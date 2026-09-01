package com.base699f47a86e7e0a874d1159ed.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Sender en søvnlog-handling til backend og holder styr på de handlinger, der
 * endnu ikke er nået frem.
 *
 * Modstykket til SleepActionSender.swift på iOS. Samme endepunkt, samme
 * handlingsnavne, samme regler for hvornår en handling er endelig, og samme kø
 * med oprindeligt tidsstempel.
 */
final class SleepActionSender {

    private static final String TAG = "CNS-NATIVE";

    static final String APP_ID = "699f47a86e7e0a874d1159ed";
    static final String DEFAULT_ENDPOINT =
        "https://lalatoto.base44.app/api/apps/699f47a86e7e0a874d1159ed/functions/nativeSleepAction";

    /** Capacitor Preferences gemmer på Android i SharedPreferences-filen "CapacitorStorage". */
    private static final String CAPACITOR_PREFS = "CapacitorStorage";
    private static final String TOKEN_KEY = "cns_native_token";
    private static final String ENDPOINT_KEY = "cns_native_endpoint";

    /** Vores egen kø over handlinger, der endnu ikke er nået frem. */
    private static final String QUEUE_PREFS = "cns_sleep_queue";
    private static final String QUEUE_KEY = "cns_pending_sleep_actions";

    /** Backend mapper 'awake' til mark_awake og 'sleeping' til mark_sleeping. */
    static final String ACTION_AWAKE = "awake";
    static final String ACTION_SLEEPING = "sleeping";
    static final String ACTION_END = "end";

    /**
     * Køen holdes kort. Bliver en handling ved med at blive afvist, ryger den ud,
     * når der er kommet 50 nyere ind foran den.
     */
    private static final int MAX_QUEUE_LENGTH = 50;

    private SleepActionSender() {}

    // ---------------------------------------------------------------- Udførelse

    /**
     * Gemmer handlingen i køen og forsøger straks at sende den. Lykkes det,
     * fjernes den igen fra køen.
     *
     * Der gemmes ALTID først, så trykket er registreret, også hvis processen
     * bliver slået ihjel midt i netværkskaldet.
     *
     * Kalder netværket direkte og må derfor kun køres fra en baggrundstråd.
     */
    static void perform(Context context, String action, String sessionId) {
        String stamp = iso8601(new Date());
        enqueue(context, action, sessionId, stamp);

        boolean settled = send(context, action, sessionId, stamp);
        if (settled) {
            dequeue(context, stamp);
            Log.d(TAG, "handling sendt: " + action);
        } else {
            Log.d(TAG, "handling bliver i køen: " + action);
        }
    }

    /**
     * Sender én handling. Returnerer true når sagen er afsluttet — altså "tag den
     * ud af køen" — ikke nødvendigvis at den lykkedes.
     */
    static boolean send(Context context, String action, String sessionId, String stamp) {
        SharedPreferences prefs =
            context.getSharedPreferences(CAPACITOR_PREFS, Context.MODE_PRIVATE);

        String token = prefs.getString(TOKEN_KEY, null);
        if (token == null || token.isEmpty()) {
            // Tokenet skrives af appen efter login. Er det her endnu ikke, skal
            // handlingen blive i køen og prøves igen ved næste appstart.
            Log.d(TAG, "intet token i Preferences — handlingen bliver i køen");
            return false;
        }

        String endpoint = prefs.getString(ENDPOINT_KEY, DEFAULT_ENDPOINT);

        HttpURLConnection connection = null;
        try {
            JSONObject body = new JSONObject();
            body.put("token", token);
            body.put("action", action);
            body.put("at", stamp);
            if (sessionId != null && !sessionId.isEmpty()) {
                body.put("session_id", sessionId);
            }

            connection = (HttpURLConnection) new URL(endpoint).openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(20000);
            connection.setReadTimeout(20000);
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("X-App-Id", APP_ID);

            try (OutputStream out = connection.getOutputStream()) {
                out.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }

            int status = connection.getResponseCode();
            Log.d(TAG, "svar: " + status);

            // Kun to slags svar er endelige:
            //
            //   2xx — handlingen er udført.
            //   404 — der er ingen aktiv session at udføre den på. Den kommer
            //         aldrig tilbage, så det nytter ikke at prøve igen.
            //
            // Alt andet bliver i køen. Særligt 401: det betyder som regel bare,
            // at tokenet endnu ikke var skrevet til Preferences, da trykket
            // skete. Smider man handlingen væk der, mister brugeren trykket.
            return (status >= 200 && status <= 299) || status == 404;
        } catch (Exception e) {
            Log.w(TAG, "netværksfejl: " + e.getMessage());
            return false;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    // ---------------------------------------------------------------------- Kø

    private static SharedPreferences queuePrefs(Context context) {
        return context.getSharedPreferences(QUEUE_PREFS, Context.MODE_PRIVATE);
    }

    private static JSONArray readQueue(Context context) {
        String raw = queuePrefs(context).getString(QUEUE_KEY, "[]");
        try {
            return new JSONArray(raw);
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private static void writeQueue(Context context, JSONArray queue) {
        queuePrefs(context).edit().putString(QUEUE_KEY, queue.toString()).apply();
    }

    static void enqueue(Context context, String action, String sessionId, String stamp) {
        try {
            JSONArray queue = readQueue(context);

            JSONObject item = new JSONObject();
            item.put("action", action);
            item.put("at", stamp);
            if (sessionId != null && !sessionId.isEmpty()) {
                item.put("session_id", sessionId);
            }
            queue.put(item);

            while (queue.length() > MAX_QUEUE_LENGTH) {
                queue.remove(0);
            }
            writeQueue(context, queue);
        } catch (Exception e) {
            Log.w(TAG, "kunne ikke lægge handling i kø: " + e.getMessage());
        }
    }

    static void dequeue(Context context, String stamp) {
        JSONArray queue = readQueue(context);
        JSONArray remaining = new JSONArray();
        for (int i = 0; i < queue.length(); i++) {
            JSONObject item = queue.optJSONObject(i);
            if (item == null) continue;
            if (!stamp.equals(item.optString("at"))) {
                remaining.put(item);
            }
        }
        writeQueue(context, remaining);
    }

    /** Sender ventende handlinger igen. Kaldes ved appstart. */
    static void flushQueue(Context context) {
        JSONArray queue = readQueue(context);
        if (queue.length() == 0) return;
        Log.d(TAG, "tømmer kø: " + queue.length() + " ventende");

        for (int i = 0; i < queue.length(); i++) {
            JSONObject item = queue.optJSONObject(i);
            if (item == null) continue;

            String action = item.optString("action", null);
            String stamp = item.optString("at", null);
            if (action == null || stamp == null) continue;

            String sessionId = item.optString("session_id", null);
            if (send(context, action, sessionId, stamp)) {
                dequeue(context, stamp);
            }
        }
    }

    /** Som flushQueue, men på egen tråd — netværk må ikke røre hovedtråden. */
    static void flushQueueAsync(final Context context) {
        final Context appContext = context.getApplicationContext();
        new Thread(new Runnable() {
            @Override
            public void run() {
                flushQueue(appContext);
            }
        }).start();
    }

    // --------------------------------------------------------------- Hjælpere

    /** Samme format som iOS sender: ISO 8601 i UTC uden brøkdele af sekunder. */
    static String iso8601(Date date) {
        SimpleDateFormat formatter =
            new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        return formatter.format(date);
    }
}
