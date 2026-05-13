import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
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
          Privatlivspolitik
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
            }}>Introduktion</h2>
            <p>
              Din privatliv er vigtig for LALATOTO ApS (»vi«, »os«, »vores«). Denne privatlivspolitik forklarer, hvordan vi indsamler, bruger, deler og beskytter dine personlige data, når du bruger vores app, websted og tjenester.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Hvilke data indsamler vi?</h2>
            <p style={{ marginBottom: 12 }}>Vi indsamler forskellige typer af data:</p>
            <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
              <li><strong>Kontooplysninger:</strong> Navn, e-mailadresse, telefonnummer og adresse</li>
              <li><strong>Søvndata:</strong> Søvnlog, bedtider, opvågninger og mønstre</li>
              <li><strong>Børneoplysninger:</strong> Barnets alder, køn, fødselsdato og udviklingsfase</li>
              <li><strong>Journaldata:</strong> Indlæg i graviditetsdagbog, notater og foto'er</li>
              <li><strong>Tekniske data:</strong> IP-adresse, enhedstype, browser og brugsdata</li>
              <li><strong>Placeringsdata:</strong> Kun hvis du tillader det, til at finde andre forældre i nærheden</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Hvordan bruger vi dine data?</h2>
            <p style={{ marginBottom: 12 }}>Vi bruger dine data til at:</p>
            <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
              <li>Levere og forbedre Tjenesten</li>
              <li>Give personaliseret søvnråd via vores AI</li>
              <li>Sende notifikationer om milepæle og påmindelser</li>
              <li>Muliggøre kommunikation i community</li>
              <li>Behandle betalinger og abonnementer</li>
              <li>Analyzere brugsdata for at forbedre brugeroplevelsen</li>
              <li>Overholde juridiske forpligtelser</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Deling af data</h2>
            <p>
              Vi deler ikke dine personlige data med tredjeparter uden dit samtykke, undtagen når det er nødvendigt til at levere Tjenesten (f.eks. betalingsprocessorer) eller når det kræves ved lov.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Sikkerhed</h2>
            <p>
              Vi bruger moderne sikkerhedsforanstaltninger til at beskytte dine data mod uautoriseret adgang, ændring eller sletning. Dine data er krypteret under transmission og på vores servere.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Dine rettigheder</h2>
            <p style={{ marginBottom: 12 }}>Under GDPR har du ret til at:</p>
            <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
              <li>Få adgang til dine personlige data</li>
              <li>Få berigtiget unøjagtige data</li>
              <li>Få slettet dine data (»ret til at være glemt«)</li>
              <li>Begrænse behandlingen af dine data</li>
              <li>Få dine data porteret til en anden tjeneste</li>
              <li>Gøre indsigelse mod behandlingen</li>
            </ul>
            <p>
              Kontakt venligst <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a> for at gøre brug af disse rettigheder.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Cookies og sporing</h2>
            <p>
              Vi bruger cookies til at forbedre din oplevelse. Du kan kontrollere cookie-indstillinger i din browser. Nogle funktioner i Tjenesten kan kræve cookies.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Børnenes privatliv</h2>
            <p>
              LALATOTO er ikke rettet mod børn under 13 år. Vi indsamler ikke bevidst personlige data fra børn. Hvis vi bliver opmerksom på, at vi har indsamlet data fra et barn under 13 år, sletter vi det omgående.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Ændringer til denne politik</h2>
            <p>
              Vi kan ændre denne privatlivspolitik fra tid til anden. Vi vil underrette dig om væsentlige ændringer via e-mail eller en fremtrædende meddelelse på Tjenesten.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>Kontakt os</h2>
            <p>Hvis du har spørgsmål om denne privatlivspolitik, kontakt venligst:</p>
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