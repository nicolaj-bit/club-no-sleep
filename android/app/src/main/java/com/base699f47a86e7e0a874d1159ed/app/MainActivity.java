package com.base699f47a86e7e0a874d1159ed.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // App-lokale plugins skal registreres FØR super.onCreate, hvor broen
        // bygges. Det er Androids mekanisme; på iOS sker det i stedet i
        // capacitorDidLoad i MainViewController.
        registerPlugin(SleepLiveActivityPlugin.class);

        super.onCreate(savedInstanceState);

        disableWebViewCache();

        // Handlinger fra notifikationens knapper, der ikke nåede frem — for
        // eksempel fordi telefonen var uden net om natten — sendes igen her.
        SleepActionSender.flushQueueAsync(this);
    }

    /**
     * Appen henter hele brugerfladen fra base44.app, og webviewets cache
     * overlever appstart. Uden det her kan brugeren sidde med en uger gammel
     * udgave af siden, længe efter at Base44 er publiceret.
     *
     * På Android slås cachen helt fra frem for at blive ryddet: LOAD_NO_CACHE
     * betyder, at siden altid hentes over nettet. clearCache(true) rydder
     * derudover det, der allerede ligger, så den første opstart efter
     * opdateringen også bliver ren.
     *
     * Det rører kun HTTP-cachen. Login og Capacitor Preferences ligger i
     * localStorage, cookies og SharedPreferences og bliver ikke rørt — ryddes
     * de, bliver alle brugere logget ud, og søvnlogtokenet til notifikationens
     * knapper forsvinder.
     */
    private void disableWebViewCache() {
        if (getBridge() == null) return;

        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
    }
}
