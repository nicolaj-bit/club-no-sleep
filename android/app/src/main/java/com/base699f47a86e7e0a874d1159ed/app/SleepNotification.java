package com.base699f47a86e7e0a874d1159ed.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * Den vedvarende notifikation for søvnloggen — Androids modstykke til Live
 * Activity'en på iOS.
 *
 * Bevidst en almindelig notifikation med setOngoing(true), ikke en foreground
 * service. Vi har ikke brug for at holde en proces i live: tælleren kører i
 * systemets egen chronometer, og knaptrykkene håndteres af en BroadcastReceiver,
 * der lever længe nok af sig selv. En foreground service ville kræve
 * foregroundServiceType og en begrundelse over for Google Play uden at give os
 * noget.
 *
 * Tælleren laves med setUsesChronometer(true) og setWhen(periodens start).
 * Android tæller så selv, og vi behøver ikke sende opdateringer for at få
 * sekunderne til at løbe — kun når tilstanden faktisk skifter.
 */
final class SleepNotification {

    private static final String TAG = "CNS-LIVE";

    static final int NOTIFICATION_ID = 2001;
    private static final String CHANNEL_ID = "cns_sleep_log";

    /** Vores egen tilstand. Notifikationen kan ikke selv huske noget. */
    private static final String STATE_PREFS = "cns_sleep_live";
    private static final String KEY_ACTIVE = "active";
    private static final String KEY_SESSION_ID = "session_id";
    private static final String KEY_PHASE_START = "phase_start";
    private static final String KEY_IS_AWAKE = "is_awake";

    private SleepNotification() {}

    // ------------------------------------------------------------------ Kanal

    /**
     * Egen kanal med IMPORTANCE_LOW: notifikationen ligger der hele natten og må
     * hverken lyde eller vibrere. VISIBILITY_PUBLIC, så indholdet kan ses på
     * låseskærmen — ellers er hele pointen væk.
     */
    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Søvnlog",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Viser den kørende søvnlog på låseskærmen.");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.enableLights(false);
        channel.setShowBadge(false);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(channel);
    }

    // --------------------------------------------------------------- Tilstand

    private static SharedPreferences state(Context context) {
        return context.getSharedPreferences(STATE_PREFS, Context.MODE_PRIVATE);
    }

    static boolean isActive(Context context) {
        return state(context).getBoolean(KEY_ACTIVE, false);
    }

    static boolean isAwake(Context context) {
        return state(context).getBoolean(KEY_IS_AWAKE, false);
    }

    static String sessionId(Context context) {
        return state(context).getString(KEY_SESSION_ID, null);
    }

    private static void saveState(Context context, String sessionId, long phaseStart, boolean isAwake) {
        state(context).edit()
            .putBoolean(KEY_ACTIVE, true)
            .putString(KEY_SESSION_ID, sessionId)
            .putLong(KEY_PHASE_START, phaseStart)
            .putBoolean(KEY_IS_AWAKE, isAwake)
            .apply();
    }

    private static void clearState(Context context) {
        state(context).edit().clear().apply();
    }

    // ------------------------------------------------------------------ Visning

    /** Viser eller opdaterer notifikationen med den givne tilstand. */
    static boolean show(Context context, String sessionId, long phaseStart, boolean isAwake) {
        ensureChannel(context);
        saveState(context, sessionId, phaseStart, isAwake);

        NotificationCompat.Builder builder =
            new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_sleep_notification)
                .setContentTitle(isAwake ? "Barnet er vågent" : "Søvnlog kører")
                .setContentText(isAwake ? "Vågen siden" : "Sover siden")
                // Tælleren: Android tæller selv opad fra setWhen.
                .setWhen(phaseStart)
                .setShowWhen(true)
                .setUsesChronometer(true)
                // Kan ikke swipes væk, mens loggen kører.
                .setOngoing(true)
                // Ingen lyd eller vibration ved hver opdatering.
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                .setContentIntent(openAppIntent(context))
                .addAction(toggleAction(context, isAwake))
                .addAction(endAction(context));

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
            return true;
        } catch (SecurityException e) {
            // Tilladelsen til notifikationer er ikke givet.
            Log.w(TAG, "må ikke vise notifikation: " + e.getMessage());
            return false;
        }
    }

    /** Tegner notifikationen om ud fra den gemte tilstand. */
    static void redraw(Context context, boolean isAwake, long phaseStart) {
        show(context, sessionId(context), phaseStart, isAwake);
    }

    static void cancel(Context context) {
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID);
        clearState(context);
    }

    // ------------------------------------------------------------------ Knapper

    /**
     * Knapperne peger på en BroadcastReceiver, ikke på MainActivity. Det er dét,
     * der gør, at appen ikke åbner, og at brugeren ikke skal låse op.
     */
    private static PendingIntent actionIntent(Context context, String button, int requestCode) {
        Intent intent = new Intent(context, SleepActionReceiver.class)
            .setAction(SleepActionReceiver.INTENT_ACTION)
            .putExtra(SleepActionReceiver.EXTRA_BUTTON, button);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }

    /**
     * Én knap der går begge veje, som i Live Activity'en. Teksten siger, hvad et
     * tryk gør — ikke hvad der gælder lige nu.
     */
    private static NotificationCompat.Action toggleAction(Context context, boolean isAwake) {
        return new NotificationCompat.Action(
            0,
            isAwake ? "Sover igen" : "Barnet er vågent",
            actionIntent(context, SleepActionReceiver.BUTTON_TOGGLE, 1)
        );
    }

    private static NotificationCompat.Action endAction(Context context) {
        return new NotificationCompat.Action(
            0,
            "Afslut log",
            actionIntent(context, SleepActionReceiver.BUTTON_END, 2)
        );
    }

    /** Tryk på selve notifikationen åbner appen — kun knapperne går udenom. */
    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getActivity(context, 0, intent, flags);
    }
}
