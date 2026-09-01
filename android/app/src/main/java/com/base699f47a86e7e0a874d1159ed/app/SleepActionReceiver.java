package com.base699f47a86e7e0a874d1159ed.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Tager imod tryk på knapperne i søvnlog-notifikationen.
 *
 * Knapperne peger hertil og ikke på MainActivity. Det er dét, der gør, at appen
 * ikke åbner, og at brugeren ikke skal låse telefonen op — på samme måde som
 * LiveActivityIntent på iOS. Fra Android 12 må en notifikationsknap i øvrigt
 * alligevel ikke starte en activity gennem et mellemled.
 *
 * Selve afsendelsen og køen ligger i SleepActionSender, præcis som på iOS.
 */
public class SleepActionReceiver extends BroadcastReceiver {

    private static final String TAG = "CNS-NATIVE";

    static final String INTENT_ACTION = "com.base699f47a86e7e0a874d1159ed.app.SLEEP_ACTION";
    static final String EXTRA_BUTTON = "button";

    static final String BUTTON_TOGGLE = "toggle";
    static final String BUTTON_END = "end";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !INTENT_ACTION.equals(intent.getAction())) return;

        final Context appContext = context.getApplicationContext();
        final String button = intent.getStringExtra(EXTRA_BUTTON);
        if (button == null) return;

        // Skal læses inden en eventuel cancel(), som rydder tilstanden.
        final String sessionId = SleepNotification.sessionId(appContext);
        final String action;

        if (BUTTON_END.equals(button)) {
            action = SleepActionSender.ACTION_END;
            SleepNotification.cancel(appContext);
        } else {
            // Retningen udledes af den gemte tilstand her, hvor trykket
            // behandles — ikke af hvad knappen hed, da den blev tegnet. Trykker
            // man to gange hurtigt efter hinanden, læser andet tryk den tilstand,
            // første tryk lige har sat, og sender derfor den modsatte handling.
            boolean nowAwake = !SleepNotification.isAwake(appContext);
            action = nowAwake ? SleepActionSender.ACTION_AWAKE : SleepActionSender.ACTION_SLEEPING;

            // Tegn om med det samme, så knappen viser den modsatte handling,
            // længe før netværkskaldet er ovre.
            SleepNotification.redraw(appContext, nowAwake, System.currentTimeMillis());
        }

        Log.d(TAG, "knap trykket: " + button + " → " + action);

        // Netværk må ikke røre hovedtråden. goAsync() holder receiveren i live,
        // mens tråden arbejder.
        final PendingResult result = goAsync();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    SleepActionSender.perform(appContext, action, sessionId);
                } finally {
                    result.finish();
                }
            }
        }).start();
    }
}
