import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF6F1',
      color: '#2B1F16',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFF8F3',
        borderBottom: '1px solid #EDE4DB',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#5B3F2B',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ChevronLeft size={20} /> Tilbage
        </button>
      </div>

      {/* Content */}
      <article style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 24px 64px'
      }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '2.5rem',
          fontWeight: 400,
          marginBottom: 12,
          color: '#2B1F16'
        }}>
          Handelsbetingelser
        </h1>
        <p style={{ color: '#7A665A', marginBottom: 40, fontSize: '0.95rem' }}>
          Senest opdateret: Januar 2024
        </p>

        <div style={{ lineHeight: 1.8, color: '#5B3F2B', fontSize: '0.95rem' }}>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>1. Introduktion</h2>
            <p>
              Disse handelsbetingelser regulerer din brug af LALATOTO-appen og webstedet (»Tjenesten«). Ved at bruge Tjenesten accepterer du disse betingelser. Hvis du ikke accepterer dem, må du ikke bruge Tjenesten.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>2. Brugerkonti</h2>
            <p>Du er ansvarlig for at holde dine login-oplysninger konfidentielle og for alle aktiviteter, der finder sted under din konto. Du accepterer at være fuldstændig ansvarlig for alle aktiviteter under din konto.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>3. Abonnement og betaling</h2>
            <p>LALATOTO tilbyder både gratis og betalte abonnementsniveauer. Hvis du vælger at abonnere på en betalt plan:</p>
            <ul style={{ marginTop: 12, marginBottom: 12, paddingLeft: 24 }}>
              <li>Du godkender, at vi kan opkræve det beløb, du har aftalt, på dine regelmæssige faktureringsdatoer</li>
              <li>Hvis din betaling afvises, bevares din adgang i henhold til vores dårlig-betaling-politik</li>
              <li>Du kan opsige dit abonnement når som helst, og du vil ikke blive opkrævet for fremtidige perioder</li>
              <li>Der gives ingen refund for delvist brugte faktureringsperioder</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>4. Intellektuel ejendomsret</h2>
            <p>Alt indhold i Tjenesten (tekst, grafik, logo, billeder, videoer, osv.) er ejendom af LALATOTO eller dets indholdsleverandører og er beskyttet af dansk og international ophavsret. Du må ikke kopiere, distribuere eller ændre indholdet uden tilladelse.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>5. Ansvarsfraskrivelse</h2>
            <p>LALATOTO leveres »som den er« uden garantier af nogen art. Vi garanterer ikke, at Tjenesten vil være fejlfri eller uafbrudt. I det omfang det er tilladt ved lov, fraskriver LALATOTO sig alle garantier, herunder stiltiende garantier.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>6. Begrænsning af ansvar</h2>
            <p>I det omfang det er tilladt ved lov, hæfter LALATOTO ikke for indirekte, tilfældig, speciel eller følgeskader, selvom vi er blevet underrettet om muligheden for sådanne skader.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>7. Ændringer af betingelser</h2>
            <p>LALATOTO forbeholder sig retten til at ændre disse betingelser når som helst. Dine fortsatte brug af Tjenesten efter sådanne ændringer betyder, at du accepterer de ændrede betingelser.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>8. Kontakt</h2>
            <p>Hvis du har spørgsmål om disse handelsbetingelser, kontakt venligst:</p>
            <p style={{ marginTop: 12 }}>
              <strong>LALATOTO ApS</strong><br />
              Kongevej 87, 2100 København Ø<br />
              <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a><br />
              <a href="tel:+4540408888" style={{ color: '#C29A73', textDecoration: 'none' }}>+45 40 40 88 88</a>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}