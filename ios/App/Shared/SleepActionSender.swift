import Foundation

/// Sender en søvnlog-handling til backend og holder styr på de handlinger, der
/// endnu ikke er nået frem.
///
/// Filen kompileres ind i **både** app-targetet og widget-extensionen. Knappen i
/// Live Activity'en køres som en `LiveActivityIntent`, og iOS kører den i appens
/// egen proces — men extensionen skal kunne kompilere intentet for overhovedet
/// at kunne vise knappen. Derfor må der ikke bruges noget her, som kun findes i
/// appen: ingen UIKit, ingen Capacitor.
enum SleepActionSender {

    // MARK: - Konstanter

    static let appId = "699f47a86e7e0a874d1159ed"
    static let defaultEndpoint =
        "https://lalatoto.base44.app/api/apps/699f47a86e7e0a874d1159ed/functions/nativeSleepAction"

    /// Capacitor Preferences gemmer i UserDefaults med præfikset "CapacitorStorage."
    static let tokenKey = "CapacitorStorage.cns_native_token"
    static let endpointKey = "CapacitorStorage.cns_native_endpoint"

    /// Vores egen kø over handlinger, der endnu ikke er nået frem.
    static let queueKey = "cns_pending_sleep_actions"

    /// Backend mapper 'awake' til mark_awake og 'sleeping' til mark_sleeping.
    static let actionAwake = "awake"
    static let actionSleeping = "sleeping"
    static let actionEnd = "end"

    /// Køen holdes kort. Bliver en handling ved med at blive afvist, ryger den
    /// ud, når der er kommet 50 nyere ind foran den.
    private static let maxQueueLength = 50

    private static let urlSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 20
        config.waitsForConnectivity = false
        return URLSession(configuration: config)
    }()

    // MARK: - Udførelse

    /// Gemmer handlingen i køen og forsøger straks at sende den. Lykkes det,
    /// fjernes den igen fra køen.
    ///
    /// Der gemmes ALTID først, så trykket er registreret, også hvis appen bliver
    /// lukket ned midt i netværkskaldet.
    ///
    /// Rækkefølgen er også det, der gør trykket sikkert på en låst telefon.
    /// UserDefaults ligger som udgangspunkt under beskyttelsesklassen
    /// «tilgængelig efter første oplåsning siden genstart», og der er ikke sat
    /// en strengere klasse noget sted i projektet, så tokenet kan normalt læses
    /// fra låseskærmen. Kan det alligevel ikke — for eksempel hvis telefonen er
    /// genstartet og aldrig låst op siden — fejler kun afsendelsen, mens
    /// handlingen bliver liggende i køen og går igennem ved næste appstart.
    static func perform(action: String,
                        sessionId: String?,
                        completion: @escaping (Bool) -> Void) {
        let stamp = iso8601(Date())
        enqueue(action: action, sessionId: sessionId, at: stamp)

        send(action: action, sessionId: sessionId, at: stamp) { settled in
            if settled {
                dequeue(at: stamp)
                NSLog("[CNS-NATIVE] handling sendt: %@", action)
            } else {
                NSLog("[CNS-NATIVE] handling bliver i køen: %@", action)
            }
            completion(settled)
        }
    }

    /// Sender én handling. `completion(true)` betyder "sagen er afsluttet — tag
    /// den ud af køen", ikke nødvendigvis at den lykkedes.
    static func send(action: String,
                     sessionId: String?,
                     at stamp: String,
                     completion: @escaping (Bool) -> Void) {

        let defaults = UserDefaults.standard
        guard let token = defaults.string(forKey: tokenKey), !token.isEmpty else {
            // Tokenet skrives af appen efter login. Er det her endnu ikke, skal
            // handlingen blive i køen og prøves igen ved næste appstart.
            NSLog("[CNS-NATIVE] intet token i Preferences — handlingen bliver i køen")
            completion(false)
            return
        }

        let endpointString = defaults.string(forKey: endpointKey) ?? defaultEndpoint
        guard let url = URL(string: endpointString) else {
            completion(false)
            return
        }

        var body: [String: Any] = ["token": token, "action": action, "at": stamp]
        if let sessionId = sessionId { body["session_id"] = sessionId }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(appId, forHTTPHeaderField: "X-App-Id")
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        urlSession.dataTask(with: request) { _, response, error in
            if let error = error {
                NSLog("[CNS-NATIVE] netværksfejl: %@", error.localizedDescription)
                completion(false)
                return
            }
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            NSLog("[CNS-NATIVE] svar: %d", status)

            // Kun to slags svar er endelige:
            //
            //   2xx — handlingen er udført.
            //   404 — der er ingen aktiv session at udføre den på. Den kommer
            //         aldrig tilbage, så det nytter ikke at prøve igen.
            //
            // Alt andet bliver i køen. Særligt 401: det betyder som regel bare,
            // at tokenet endnu ikke var skrevet til Preferences, da trykket
            // skete — for eksempel ved allerførste tryk efter login. Smider man
            // handlingen væk der, mister brugeren trykket permanent.
            if (200...299).contains(status) || status == 404 {
                completion(true)
            } else {
                completion(false)
            }
        }.resume()
    }

    // MARK: - Kø

    static func enqueue(action: String, sessionId: String?, at stamp: String) {
        var queue = UserDefaults.standard.array(forKey: queueKey) as? [[String: Any]] ?? []
        var item: [String: Any] = ["action": action, "at": stamp]
        if let sessionId = sessionId { item["session_id"] = sessionId }
        queue.append(item)
        if queue.count > maxQueueLength { queue = Array(queue.suffix(maxQueueLength)) }
        UserDefaults.standard.set(queue, forKey: queueKey)
    }

    static func dequeue(at stamp: String) {
        let queue = UserDefaults.standard.array(forKey: queueKey) as? [[String: Any]] ?? []
        let remaining = queue.filter { ($0["at"] as? String) != stamp }
        UserDefaults.standard.set(remaining, forKey: queueKey)
    }

    /// Sender ventende handlinger igen. Kaldes ved appstart.
    static func flushQueue() {
        let queue = UserDefaults.standard.array(forKey: queueKey) as? [[String: Any]] ?? []
        guard !queue.isEmpty else { return }
        NSLog("[CNS-NATIVE] tømmer kø: %d ventende", queue.count)

        for item in queue {
            guard let action = item["action"] as? String,
                  let stamp = item["at"] as? String else { continue }
            let sessionId = item["session_id"] as? String
            send(action: action, sessionId: sessionId, at: stamp) { settled in
                if settled { dequeue(at: stamp) }
            }
        }
    }

    // MARK: - Hjælpere

    static func iso8601(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.string(from: date)
    }
}
