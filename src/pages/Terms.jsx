import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
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
          Handelsbetingelser
        </h1>

        <p style={{ marginBottom: '1.5rem', fontWeight: 500 }}>
          Gælder for Club No Sleep app – www.clubnosleep.com
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          1. Betingelser for brug
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Ved at bruge Club No Sleep accepterer du disse handelsbetingelser. Appens indhold og funktioner er beregnet til personer på 18 år og derover.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          2. Medlemskab og betaling
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Du kan vælge mellem en gratis demo og et aktivt abonnement<br />
          • Hvis du vælger betalt medlemskab betales via Stripe<br />
          • Abonnementet fornyes hver måned, medmindre du opsiger det<br />
          • Du kan opsige når som helst uden omkostninger<br />
          • Prisændringer meddeles med 30 dages varsel
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          3. Familiedeling
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Ét medlemskab inkluderer én ekstra bruger (partner)<br />
          • Begge brugere får fuld adgang til alle funktioner<br />
          • Den primære medlem administrerer og betaler for abonnementet<br />
          • Partneren kan ikke deltage i betalingsaftalen
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          4. Brugerindhold
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Du ejer dine egne data og indhold (søvnlogs, notater osv.)<br />
          • Ved sletning af din konto slettes dine data permanent<br />
          • Du kan ikke videresælge eller misbruge anden brugers indhold<br />
          • Vi kan slette indhold, der krænker love eller vores vejledning
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          5. Ansvar og garanti
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Club No Sleep leveres "som den er" uden garanti for fejlfrihed<br />
          • Vi er ikke ansvarlige for indirekte tab eller dataloss<br />
          • Appens råd er alene informativt og erstatter ikke lægelighed<br />
          • Du bruger appen på eget ansvar
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          6. Ændringer og afbrydelser
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Vi kan foretage ændringer i appen når som helst<br />
          • Vi kan suspendere eller lukke appen med 30 dages varsel<br />
          • Vi kan fjerne funktioner uden erstatning<br />
          • Vi udbedrer fejl når det er praktisk muligt
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          7. Åbenbaringer og kontakt
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          • Kontakt os på hej@clubnosleep.com<br />
          • Svar på henvendelser inden for 10 arbejdsdage<br />
          • Vi forbeholder os retten til at nægte service til brugere, der overtræder vilkårene
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' }}>
          8. Lovgivning
        </h2>
        <p style={{ marginBottom: '3rem' }}>
          • Disse betingelser reguleres af dansk ret<br />
          • Enhver tvist afgøres af danske domstole
        </p>

        <p style={{ fontSize: '0.85rem', color: '#7A665A', marginBottom: '3rem' }}>
          Senest opdateret: Juni 2026
        </p>
      </div>
    </div>
  );
}