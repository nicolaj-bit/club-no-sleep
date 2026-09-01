package com.base699f47a86e7e0a874d1159ed.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // App-lokale plugins skal registreres FØR super.onCreate, hvor broen
        // bygges. Det er Androids mekanisme; på iOS sker det i stedet i
        // capacitorDidLoad i MainViewController.
        registerPlugin(SleepLiveActivityPlugin.class);

        super.onCreate(savedInstanceState);

        // Handlinger fra notifikationens knapper, der ikke nåede frem — for
        // eksempel fordi telefonen var uden net om natten — sendes igen her.
        SleepActionSender.flushQueueAsync(this);
    }
}
