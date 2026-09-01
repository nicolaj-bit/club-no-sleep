package com.base699f47a86e7e0a874d1159ed.app;

import android.util.Log;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Capacitor-plugin, så websiden i Base44 kan starte, opdatere og stoppe
 * søvnlog-notifikationen.
 *
 * Registreret under præcis samme jsName som iOS-plugin'et — SleepLiveActivity —
 * med de samme fire metoder og de samme parametre. Derfor kan
 * src/lib/sleepLiveActivity.js bruges på begge platforme uden forgreninger.
 *
 * På Android registreres app-lokale plugins i MainActivity med
 * registerPlugin(...) før super.onCreate. Det er en anden mekanisme end på iOS,
 * hvor de registreres i capacitorDidLoad.
 */
@CapacitorPlugin(name = "SleepLiveActivity")
public class SleepLiveActivityPlugin extends Plugin {

    private static final String TAG = "CNS-LIVE";

    /**
     * På Android kræver det kun, at appen må vise notifikationer. Der er ingen
     * versionsgrænse som iOS 17: knapperne går til en BroadcastReceiver, hvilket
     * har virket siden længe før vores minimum på API 24.
     */
    private boolean notificationsAllowed() {
        return NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", notificationsAllowed());
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (!notificationsAllowed()) {
            JSObject result = new JSObject();
            result.put("started", false);
            call.resolve(result);
            return;
        }

        String sessionId = call.getString("sessionId");
        boolean isAwake = Boolean.TRUE.equals(call.getBoolean("isAwake", false));
        long phaseStart = parseDate(call.getString("phaseStart"), System.currentTimeMillis());

        boolean started = SleepNotification.show(getContext(), sessionId, phaseStart, isAwake);
        Log.d(TAG, "start: " + started);

        JSObject result = new JSObject();
        result.put("started", started);
        call.resolve(result);
    }

    @PluginMethod
    public void update(PluginCall call) {
        if (!SleepNotification.isActive(getContext())) {
            call.resolve();
            return;
        }

        boolean isAwake = Boolean.TRUE.equals(call.getBoolean("isAwake", false));
        long phaseStart = parseDate(call.getString("phaseStart"), System.currentTimeMillis());

        SleepNotification.show(getContext(), SleepNotification.sessionId(getContext()), phaseStart, isAwake);
        call.resolve();
    }

    @PluginMethod
    public void end(PluginCall call) {
        SleepNotification.cancel(getContext());
        Log.d(TAG, "afsluttet");
        call.resolve();
    }

    // --------------------------------------------------------------- Hjælpere

    /**
     * JavaScript sender tidspunkter som ISO-strenge fra toISOString(), altså med
     * brøkdele af sekunder. Ældre strenge uden brøkdele skal også kunne læses,
     * så der forsøges med begge formater.
     *
     * java.time findes først fra API 26, og vi understøtter 24.
     */
    private static long parseDate(String value, long fallback) {
        if (value == null || value.isEmpty()) return fallback;

        String[] patterns = {
            "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
            "yyyy-MM-dd'T'HH:mm:ssXXX"
        };
        for (String pattern : patterns) {
            try {
                SimpleDateFormat formatter = new SimpleDateFormat(pattern, Locale.US);
                formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date parsed = formatter.parse(value);
                if (parsed != null) return parsed.getTime();
            } catch (Exception ignored) {
                // Prøv næste format.
            }
        }
        return fallback;
    }
}
