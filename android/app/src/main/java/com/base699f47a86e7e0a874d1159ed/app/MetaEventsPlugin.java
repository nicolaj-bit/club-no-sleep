package com.base699f47a86e7e0a874d1159ed.app;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Iterator;

/**
 * Capacitor-plugin, så websiden i Base44 kan sende hændelser til Meta.
 *
 * Registreret under præcis samme jsName som iOS-plugin'et — MetaEvents — med de
 * samme metoder og parametre. Derfor kan src/lib/metaEvents.js bruges på begge
 * platforme uden forgreninger.
 *
 * requestTracking og getTrackingStatus findes kun, for at den fælles
 * JavaScript kan kalde dem uden at spørge om platform. Android har ingen
 * dialog som iOS' App Tracking Transparency, så de svarer «unavailable».
 *
 * App-lokale plugins registreres i MainActivity med registerPlugin(...) før
 * super.onCreate. Det er en anden mekanisme end på iOS, hvor de registreres i
 * capacitorDidLoad.
 */
@CapacitorPlugin(name = "MetaEvents")
public class MetaEventsPlugin extends Plugin {

    private static final String TAG = "CNS-META";

    private AppEventsLogger logger;
    private boolean ready = false;

    /**
     * Kaldes af Capacitor, når broen bygges — altså ved appstart og uanset om
     * JavaScript nogensinde kalder plugin'et.
     *
     * Metas SDK initialiserer ellers sig selv gennem en ContentProvider, før
     * vores kode kører. Derfor står com.facebook.sdk.AutoInitEnabled til false
     * i manifestet: så er det her, og kun her, SDK'et bliver startet, og vi kan
     * sætte flagene først.
     */
    @Override
    public void load() {
        String appId = getContext().getString(R.string.facebook_app_id);
        String clientToken = getContext().getString(R.string.facebook_client_token);

        if (appId == null || appId.isEmpty() || clientToken == null || clientToken.isEmpty()) {
            // Buildet er lavet uden FACEBOOK_APP_ID/FACEBOOK_CLIENT_TOKEN.
            // Appen skal virke som før — der måles bare ingenting.
            Log.w(TAG, "facebook_app_id eller facebook_client_token mangler — SDK'et startes ikke");
            return;
        }

        // Flagene sættes her i koden og bevidst ikke i manifestet. Det er samme
        // sted, iOS styrer dem fra, så de to platforme kan læses sammen.
        //
        // På Android er der ingen tilladelse at vente på: annonce-id'et (GAID)
        // slår brugeren selv fra under Indstillinger → Google → Annoncer, og
        // det respekterer SDK'et af sig selv.
        FacebookSdk.setAutoLogAppEventsEnabled(true);
        FacebookSdk.setAdvertiserIDCollectionEnabled(true);
        FacebookSdk.fullyInitialize();

        Activity activity = getActivity();
        if (activity != null) {
            AppEventsLogger.activateApp(activity.getApplication(), appId);
        }

        logger = AppEventsLogger.newLogger(getContext());
        ready = true;
        Log.i(TAG, "Meta-SDK klar");
    }

    @PluginMethod
    public void logEvent(PluginCall call) {
        String name = call.getString("name");
        if (name == null || name.isEmpty()) {
            call.reject("name mangler");
            return;
        }
        if (!ready) {
            call.resolve(result(false));
            return;
        }
        logger.logEvent(name, toBundle(call.getObject("params")));
        call.resolve(result(true));
    }

    @PluginMethod
    public void logPurchase(PluginCall call) {
        Double amount = call.getDouble("amount");
        if (amount == null) {
            call.reject("amount mangler");
            return;
        }

        // Meta kræver en valuta. Uden den tæller beløbet ikke med i
        // annoncernes afkast, så der gættes ikke — der siges fra.
        String currencyCode = call.getString("currency");
        if (currencyCode == null || currencyCode.length() != 3) {
            call.reject("currency skal være en ISO-kode på tre bogstaver, f.eks. DKK");
            return;
        }

        Currency currency;
        try {
            currency = Currency.getInstance(currencyCode.toUpperCase());
        } catch (IllegalArgumentException e) {
            call.reject("currency er ikke en kendt ISO-kode: " + currencyCode);
            return;
        }

        if (!ready) {
            call.resolve(result(false));
            return;
        }

        logger.logPurchase(BigDecimal.valueOf(amount), currency, toBundle(call.getObject("params")));
        call.resolve(result(true));
    }

    /**
     * Findes kun, så den fælles JavaScript kan kalde den uden at spørge om
     * platform. Android har ingen dialog som iOS' App Tracking Transparency.
     */
    @PluginMethod
    public void requestTracking(PluginCall call) {
        JSObject res = new JSObject();
        res.put("status", "unavailable");
        res.put("prompted", false);
        call.resolve(res);
    }

    @PluginMethod
    public void getTrackingStatus(PluginCall call) {
        JSObject res = new JSObject();
        res.put("status", "unavailable");
        call.resolve(res);
    }

    /**
     * Metas anonyme id for denne installation. Det er den nøgle, RevenueCat
     * skal have, for at deres køb kan lægges oven i de hændelser, appen selv
     * sender. Det er ikke et enheds-id og følger ikke brugeren på tværs af apps.
     */
    @PluginMethod
    public void getAnonymousId(PluginCall call) {
        JSObject res = new JSObject();
        String anonymousId = "";
        if (ready) {
            try {
                anonymousId = AppEventsLogger.getAnonymousAppDeviceGUID(getContext());
            } catch (RuntimeException e) {
                Log.w(TAG, "kunne ikke hente anonymt id: " + e.getMessage());
            }
        }
        res.put("anonymousId", anonymousId == null ? "" : anonymousId);
        call.resolve(res);
    }

    private JSObject result(boolean logged) {
        JSObject res = new JSObject();
        res.put("logged", logged);
        return res;
    }

    /**
     * Meta tager kun tekst og tal som parameterværdier. Alt andet bliver
     * skrevet om til tekst frem for at blive smidt væk — så kan vi se det i
     * Events Manager og rette det, i stedet for at lede efter noget, der
     * forsvandt uden spor.
     */
    private Bundle toBundle(JSObject params) {
        Bundle bundle = new Bundle();
        if (params == null) return bundle;

        Iterator<String> keys = params.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            if (key == null || key.isEmpty()) continue;

            Object value = params.opt(key);
            if (value == null) continue;

            if (value instanceof Double || value instanceof Float) {
                bundle.putDouble(key, ((Number) value).doubleValue());
            } else if (value instanceof Number) {
                bundle.putLong(key, ((Number) value).longValue());
            } else if (value instanceof Boolean) {
                bundle.putString(key, ((Boolean) value) ? "1" : "0");
            } else if (value instanceof JSONArray) {
                bundle.putString(key, value.toString());
            } else {
                bundle.putString(key, String.valueOf(value));
            }
        }
        return bundle;
    }
}
