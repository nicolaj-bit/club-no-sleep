import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFF8F3', borderBottom: '1px solid #EDE4DB', padding: '1.5rem 1.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#5B3F2B', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>
          <ChevronLeft size={24} />
          Tilbage
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem', fontSize: '0.95rem', lineHeight: 1.8, color: '#2B1F16' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, marginBottom: '1.5rem', color: '#2B1F16' }}>
          Privatlivspolitik
        </h1>

        <p style={{ marginBottom: '1.5rem', fontWeight: 500 }}>
          Club No Sleep respekterer dit privatliv. Denne politik beskriver, hvordan vi indsamler, bruger og beskytter dine personoplysninger.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          1. Hvilke data indsamler vi?
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Vi indsamler følgende oplysninger:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Email-adresse og navn</li>
          <li>Profilbilledet du uploader</li>
          <li>Søvnlogs og kalenderdata</li>
          <li>Chat-meddelelser i fællesskabet</li>
          <li>Spørgsmål og svar du deler</li>
          <li>Betalingsoplysninger via Stripe (kredit-/debitkort)</li>
          <li>Tekniske data (enheds-ID, OS, app-version)</li>
          <li>Lokationsdata (kun hvis du aktiverer det)</li>
        </ul>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          2. Hvordan bruger vi dine data?
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Vi bruger dine data til:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>At tilbyde og forbedre appen</li>
          <li>At behandle betalinger og abonnement</li>
          <li>At sende relevante notifikationer</li>
          <li>At analysere hvordan appen bruges</li>
          <li>At kommunikere vigtige opdateringer</li>
          <li>At understøtte customer support</li>
          <li>At overholde juridiske krav</li>
        </ul>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          3. Med hvem deler vi dine data?
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • <strong>Stripe:</strong> Behandler betalinger (de følger strengt sikkerhed)<br />
          • <strong>OneSignal:</strong> Sender push-notifikationer<br />
          • <strong>Partnere:</strong> Din familiemedlem kan se dine data hvis du inviterer dem<br />
          • <strong>Juridisk krav:</strong> Vi kan blive tvunget til at dele data af myndighederne<br />
          • Vi sælger ALDRIG dine data til tredjeparter
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          4. Datarettigeder (GDPR)
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Du har ret til:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li><strong>Adgang:</strong> Se hvilke data vi har om dig</li>
          <li><strong>Rettelse:</strong> Ændre fejlagtige eller ufuldstændige data</li>
          <li><strong>Sletning:</strong> Slette dine data ("retten til at være glemt")</li>
          <li><strong>Dataoverførsel:</strong> Få dine data i maskinlæsbart format</li>
          <li><strong>Indsigelse:</strong> Nægte databehandling under visse omstændigheder</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          Kontakt os på hej@clubnosleep.com for at udøve disse rettigheder.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          5. Datasikkerhed
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Vi bruger SSL-kryptering for data i transit<br />
          • Databasen er krypteret i hvile<br />
          • Adgang til data er begrænset til nøglemedarbjdere<br />
          • Vi tester regelmæssigt for sikkerhedsfejl<br />
          • Hvis vi opdager et brud rapporterer vi det straks
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          6. Dataopbevaring
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Dine data opbevares så længe din konto er aktiv<br />
          • Vi sletter data 30 dage efter kontoafslutning<br />
          • Nogle data kan opbevares længere for juridisk/regnskabsmæssige årsager<br />
          • Slettede data kan ikke genvindes
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          7. Cookies og sporingsteknologi
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Vi bruger cookies til at huske dine indstillinger<br />
          • Vi bruger analyse-cookies til at forstå brugeradfærd<br />
          • Du kan deaktivere cookies i dine browserindstillinger<br />
          • Nogle funktioner virker muligvis ikke uden cookies
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          8. Ændringer til denne politik
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Vi kan opdatere denne politik når som helst<br />
          • Vigtige ændringer meddeles via email<br />
          • Du accepterer ændringerne ved at fortsætte med at bruge appen
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          9. Kontakt os
        </h2>
        <p style={{ marginBottom: '3rem' }}>
          Har du spørgsmål? Kontakt vores dataperson:<br />
          <strong>Email:</strong> hej@clubnosleep.com<br />
          <strong>Adresse:</strong> Club No Sleep, Danmark
        </p>

        <p style={{ fontSize: '0.85rem', color: '#7A665A', marginBottom: '3rem' }}>
          Senest opdateret: Juni 2026
        </p>
      </div>
    </div>
  );
}