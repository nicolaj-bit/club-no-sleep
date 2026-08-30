# Club No Sleep

Dansksproget app til gravide og mødre. Udviklet af LALATOTO of Denmark ApS.
Live i både App Store og Google Play.

**Skriv altid på dansk** — både i svar, commit-beskeder og kodekommentarer.

---

## Sådan skal du svare

Nicolaj er ikke udvikler. Han har bygget appen i Base44 og kan læse kode, men
han skal ikke forstå implementeringen for at kunne træffe beslutninger.

- **Hold svarene korte.** Højst få afsnit. Ingen lange gennemgange af, hvad du
  har lavet, linje for linje.
- **Forklar hvorfor, ikke hvordan.** Hvad var problemet, og hvad løser
  ændringen. Detaljerne står i koden og i commit-beskeden.
- **Afslut altid med en linje der starter med `NÆSTE:`** og siger præcis, hvad
  Nicolaj selv skal gøre nu — ét skridt ad gangen. Er der intet, han skal gøre,
  skriv `NÆSTE: ingenting, jeg fortsætter.`
- Skal han træffe et valg, så stil ét spørgsmål med konkrete muligheder. Ikke
  fire spørgsmål på én gang.
- Undlad tekniske forkortelser uden forklaring første gang de bruges.

---

## Arkitektur — læs dette først

Appen er bygget i **Base44** (vibe-coding platform) og pakket i **Capacitor
remote mode**. Det er den vigtigste enkeltoplysning om projektet:

```ts
// capacitor.config.ts
server: { url: 'https://lalatoto.base44.app' }
```

Den native app henter altså hele websiden fra base44.app ved opstart. Den
bundler ikke web-koden.

**Konsekvenser, som ofte misforstås:**

- Ændringer i `src/` går live, så snart der publiceres i Base44. Der skal
  **ikke** laves en ny native build til web-ændringer.
- Kun ændringer i `ios/`, `android/`, `capacitor.config.ts` og plugins i
  `package.json` kræver en ny native build.
- `src/` i dette repo er en spejling af Base44. Ret ikke i `src/` her og
  forvent at det slår igennem — kilden er Base44.
- **Publiceringsrækkefølgen:** iOS og Android henter den samme publicerede
  web-bundle. Nyt JavaScript, der afhænger af en ny native funktion, må derfor
  ikke publiceres, før begge native builds er live i butikkerne. Ellers kalder
  den ene platform noget, der ikke findes.
- Fordi webviewet skal hente siden over nettet ved hver start, kan native kode
  **ikke** regne med, at JavaScript kører. Det gælder især baggrundsopgaver som
  notifikations-handlinger, hvor iOS kun giver få sekunder. Sådanne ting skal
  håndteres i Swift/Kotlin. Se `ios/App/App/SleepLockScreenActions.swift`.

---

## Base44 og backend

- App-id: `699f47a86e7e0a874d1159ed`
- Funktioner kaldes: `POST {origin}/api/apps/{appId}/functions/{navn}`
  med headeren `X-App-Id`.
- Backend-funktioner ligger i `base44/functions/*/entry.ts`, entiteter i
  `base44/entities/`, delt logik i `base44/shared/`.

**RLS-faldgruben:** brugere oprettet med email og adgangskode bliver ikke
genkendt som autentificerede af Base44's row-level security. Alle læsninger og
skrivninger på entiteter skal derfor gå gennem en backend-funktion med
`base44.asServiceRole`. Kalder man entiteter direkte fra frontend, fejler det
lydløst for præcis de brugere.

---

## Søvnlog

`base44/shared/sleepSession.js` er eneste kilde til sandhed for beregninger og
bruges af både frontend og backend. Timeren beregnes altid ud fra tidsstempler
(`nu − periode.start`), aldrig ved at tælle op — så den er korrekt, selv om
appen har været lukket.

`base44/functions/manageSleepSession/entry.ts` håndterer alle tilstande:
`start`, `mark_awake`, `mark_sleeping`, `end`, `undo_end`. Den håndterer også
inviterede familiemedlemmer, hvor handlingen skal gælde ejerens session.

`nativeSleepAction` er en parallel, ulogget funktion til native kald fra
låseskærmen. Den godkendes med `native_action_token` på brugerens UserProfile,
som appen skriver i Capacitor Preferences under `cns_native_token`.

---

## Native

**Bundle id / applicationId:** `com.base699f47a86e7e0a874d1159ed.app`

**iOS**

- Deployment target er **15.0** og skal blive der. Skal en widget-extension
  bruge nyere API, giver man extensionen sit eget, højere target.
- Bygges med Xcode Cloud. `MARKETING_VERSION` skal hæves ved hver indsendelse,
  ellers fejler «Preparing build for App Store Connect».
- Notifikations-knapper: kategorien registreres i **native kode**, ikke fra JS.
  Kalder JS `LocalNotifications.registerActionTypes` på iOS, overskriver
  Capacitor den native kategori, og knapperne forsvinder.
- iOS folder altid notifikationer sammen. Knapper vises kun ved langt tryk.
  Altid synlige knapper kræver Live Activities (ActivityKit).

**Android**

- Bygges med GitHub Actions, se `.github/workflows/android-build.yml`.
  Keystore ligger i secret'en `ANDROID_KEYSTORE_BASE64`, alias `upload`.
- `versionCode` i `android/app/build.gradle` skal hæves ved hver upload.
- `READ_MEDIA_IMAGES` fjernes bevidst med `tools:node="remove"` i manifestet.
  Google Play afviser appen, hvis den er der. Læg den ikke tilbage.
- OneSignal skal initialiseres på Android, før nogen anden OneSignal-metode
  kaldes. Ellers crasher appen med
  `IllegalStateException: Must call 'initWithContext' before use`.

---

## Betaling

RevenueCat (`@revenuecat/purchases-capacitor` v13) på begge platforme.

- `getOfferings()` returnerer `{ all, current }` direkte — brug `result?.current`.
- `appUserID` skal være `userId || null`. Aldrig strengen `'guest'`.
- Google Play Billing ligger **inde i** RevenueCat-plugin'et og kan ikke
  opgraderes selvstændigt. Versionsnummeret i AAB'en er billing-bibliotekets,
  ikke plugin'ets — de to talrækker forveksles let.
- 7 dages gratis prøveperiode er sat op i begge butikker. Eligibility fra
  RevenueCat er `'unknown'` for nye brugere, så betingelser skal skrives som
  `!== 'ineligible'` — ikke som `=== 'eligible'`, da teksten så aldrig vises.

---

## Kort

`DenmarkMap.jsx` bruger Esri Canvas-fliser og følger appens dark mode:
`World_Light_Gray_Base` / `World_Dark_Gray_Base` plus det tilsvarende
`_Reference`-lag til bynavne. Canvas-basiskortene er bevidst uden tekst —
etiketterne kommer fra reference-laget. Attributionen «© Esri, HERE, Garmin»
skal blive stående.

---

## Juridisk

- GDPR og markedsføringsloven: samtykke begravet i handelsbetingelser er
  **ikke** gyldigt markedsføringssamtykke. Push-tilladelse fra styresystemet og
  juridisk samtykke er to uafhængige krav.
- Apple 3.1.2: prøveperiodens vilkår skal fremgå tydeligt før køb.
- Apple 3.1.1: ingen links til betaling uden for appen.
- Apple 1.2: brugergenereret indhold kræver blokering og rapportering.
