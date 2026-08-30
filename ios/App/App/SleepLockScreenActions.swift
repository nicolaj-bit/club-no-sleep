import Foundation
import UIKit
import UserNotifications

/// Håndterer knaptryk på søvnlog-notifikationen direkte i native kode.
///
/// Baggrund: appen kører i Capacitor remote mode, hvor hele websiden hentes fra
/// base44.app. Når iOS vækker appen kort i baggrunden for at behandle et
/// knaptryk på låseskærmen, når webviewet næsten aldrig at loade siden inden for
/// det tidsrum, iOS giver. Håndteres trykket i JavaScript, går det derfor tabt.
/// Her sendes handlingen direkte fra Swift, uden at webviewet involveres.
///
/// Fejler netværkskaldet, lægges handlingen i en kø i UserDefaults med sit
/// oprindelige tidspunkt og sendes igen, næste gang appen starter. Backend
/// bruger det medsendte tidspunkt, så søvnloggen får det rigtige klokkeslæt,
/// selv om kaldet først går igennem timer senere.
@objc final class SleepLockScreenActions: NSObject, UNUserNotificationCenterDelegate {

    @objc static let shared = SleepLockScreenActions()

    // MARK: - Konstanter

    /// Skal være identisk med actionTypeId i src/lib/sleepNotifications.js
    static let categoryId = "SLEEP_SESSION"
    static let actionAwake = "awake"
    static let actionEnd = "end"

    private static let appId = "699f47a86e7e0a874d1159ed"
    private static let defaultEndpoint =
        "https://lalatoto.base44.app/api/apps/699f47a86e7e0a874d1159ed/functions/nativeSleepAction"

    /// Capacitor Preferences gemmer i UserDefaults med præfikset "CapacitorStorage."
    private static let tokenKey = "CapacitorStorage.cns_native_token"
    private static let endpointKey = "CapacitorStorage.cns_native_endpoint"

    /// Vores egen kø over handlinger der endnu ikke er nået frem.
    private static let queueKey = "cns_pending_sleep_actions"

    /// Den delegate Capacitor selv har sat. Alt vi ikke håndterer, sendes videre
    /// hertil, så appens øvrige notifikationer opfører sig præcis som før.
    private var forwardTo: UNUserNotificationCenterDelegate?

    private let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 20
        config.waitsForConnectivity = false
        return URLSession(configuration: config)
    }()

    // MARK: - Opsætning

    /// Kaldes fra AppDelegate. Er idempotent og må gerne kaldes flere gange.
    @objc func install() {
        registerCategory()

        // Capacitor sætter selv delegate, når broen bygges — altså efter
        // didFinishLaunching. Vi lægger os derfor bagerst i køen og gemmer
        // den delegate der allerede står der.
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let center = UNUserNotificationCenter.current()
            if !(center.delegate === self) {
                self.forwardTo = center.delegate
                center.delegate = self
                NSLog("[CNS-NATIVE] delegate installeret, videresender til %@",
                      String(describing: type(of: self.forwardTo)))
            }
            self.flushQueue()
        }
    }

    /// Registrerer kategorien med de to knapper. Ingen af dem har
    /// `.foreground`, så iOS behandler trykket uden at brugeren skal låse op.
    private func registerCategory() {
        let awake = UNNotificationAction(
            identifier: Self.actionAwake,
            title: "Barnet er vågent",
            options: []
        )
        let end = UNNotificationAction(
            identifier: Self.actionEnd,
            title: "Afslut log",
            options: [.destructive]
        )
        let category = UNNotificationCategory(
            identifier: Self.categoryId,
            actions: [awake, end],
            intentIdentifiers: [],
            options: []
        )

        let center = UNUserNotificationCenter.current()
        center.getNotificationCategories { existing in
            // Bevar alle andre kategorier — vi erstatter kun vores egen.
            var merged = existing.filter { $0.identifier != Self.categoryId }
            merged.insert(category)
            center.setNotificationCategories(merged)
            NSLog("[CNS-NATIVE] kategori registreret: %@", Self.categoryId)
        }
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {

        let category = response.notification.request.content.categoryIdentifier
        let actionId = response.actionIdentifier

        if category == Self.categoryId,
           actionId == Self.actionAwake || actionId == Self.actionEnd {

            let sessionId = Self.findSessionId(in: response.notification.request.content.userInfo)
            NSLog("[CNS-NATIVE] knap trykket: %@ (session %@)", actionId, sessionId ?? "ukendt")

            handle(action: actionId, sessionId: sessionId, completion: completionHandler)
            return
        }

        if let forward = forwardTo {
            forward.userNotificationCenter?(center,
                                            didReceive: response,
                                            withCompletionHandler: completionHandler)
        } else {
            completionHandler()
        }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler:
                                    @escaping (UNNotificationPresentationOptions) -> Void) {
        if let forward = forwardTo {
            forward.userNotificationCenter?(center,
                                            willPresent: notification,
                                            withCompletionHandler: completionHandler)
        } else {
            if #available(iOS 14.0, *) {
                completionHandler([.banner, .sound, .badge])
            } else {
                completionHandler([.alert, .sound, .badge])
            }
        }
    }

    // MARK: - Handling

    private func handle(action: String, sessionId: String?, completion: @escaping () -> Void) {
        let stamp = Self.iso8601(Date())

        // Gem ALTID først. Så er trykket registreret, også hvis appen bliver
        // lukket ned midt i netværkskaldet.
        enqueue(action: action, sessionId: sessionId, at: stamp)

        var bgTask = UIBackgroundTaskIdentifier.invalid
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "cns-sleep-action") {
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = .invalid
        }

        send(action: action, sessionId: sessionId, at: stamp) { [weak self] success in
            if success {
                self?.dequeue(at: stamp)
                NSLog("[CNS-NATIVE] handling sendt: %@", action)
            } else {
                NSLog("[CNS-NATIVE] handling lagt i kø: %@", action)
            }
            if bgTask != .invalid {
                UIApplication.shared.endBackgroundTask(bgTask)
                bgTask = .invalid
            }
            completion()
        }
    }

    private func send(action: String,
                      sessionId: String?,
                      at stamp: String,
                      completion: @escaping (Bool) -> Void) {

        let defaults = UserDefaults.standard
        guard let token = defaults.string(forKey: Self.tokenKey), !token.isEmpty else {
            NSLog("[CNS-NATIVE] intet token i Preferences — kan ikke sende")
            completion(false)
            return
        }

        let endpointString = defaults.string(forKey: Self.endpointKey) ?? Self.defaultEndpoint
        guard let url = URL(string: endpointString) else {
            completion(false)
            return
        }

        var body: [String: Any] = ["token": token, "action": action, "at": stamp]
        if let sessionId = sessionId { body["session_id"] = sessionId }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(Self.appId, forHTTPHeaderField: "X-App-Id")
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        session.dataTask(with: request) { _, response, error in
            if let error = error {
                NSLog("[CNS-NATIVE] netværksfejl: %@", error.localizedDescription)
                completion(false)
                return
            }
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            NSLog("[CNS-NATIVE] svar: %d", status)

            // 4xx betyder at kaldet aldrig kommer igennem — så skal det ud af
            // køen i stedet for at blive forsøgt i det uendelige. 404 er dog
            // 'ingen aktiv session', hvilket også er endeligt.
            if (200...299).contains(status) || (400...499).contains(status) {
                completion(true)
            } else {
                completion(false)
            }
        }.resume()
    }

    // MARK: - Kø

    private func enqueue(action: String, sessionId: String?, at stamp: String) {
        var queue = UserDefaults.standard.array(forKey: Self.queueKey) as? [[String: Any]] ?? []
        var item: [String: Any] = ["action": action, "at": stamp]
        if let sessionId = sessionId { item["session_id"] = sessionId }
        queue.append(item)
        // Hold køen kort — ældre end 24 timer er ikke længere brugbart.
        if queue.count > 50 { queue = Array(queue.suffix(50)) }
        UserDefaults.standard.set(queue, forKey: Self.queueKey)
    }

    private func dequeue(at stamp: String) {
        let queue = UserDefaults.standard.array(forKey: Self.queueKey) as? [[String: Any]] ?? []
        let remaining = queue.filter { ($0["at"] as? String) != stamp }
        UserDefaults.standard.set(remaining, forKey: Self.queueKey)
    }

    /// Sender ventende handlinger igen. Kaldes ved appstart.
    @objc func flushQueue() {
        let queue = UserDefaults.standard.array(forKey: Self.queueKey) as? [[String: Any]] ?? []
        guard !queue.isEmpty else { return }
        NSLog("[CNS-NATIVE] tømmer kø: %d ventende", queue.count)

        for item in queue {
            guard let action = item["action"] as? String,
                  let stamp = item["at"] as? String else { continue }
            let sessionId = item["session_id"] as? String
            send(action: action, sessionId: sessionId, at: stamp) { [weak self] success in
                if success { self?.dequeue(at: stamp) }
            }
        }
    }

    // MARK: - Hjælpere

    private static func iso8601(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.string(from: date)
    }

    /// Capacitor pakker `extra` forskelligt afhængigt af version, så vi leder
    /// efter session_id både øverst og ét niveau nede.
    private static func findSessionId(in userInfo: [AnyHashable: Any]) -> String? {
        if let direct = userInfo["session_id"] as? String { return direct }
        for (_, value) in userInfo {
            if let nested = value as? [AnyHashable: Any],
               let found = nested["session_id"] as? String {
                return found
            }
        }
        return nil
    }
}
