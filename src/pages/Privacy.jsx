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
          Senest opdateret: 25. april 2026
        </p>

        <div style={{ lineHeight: 1.8, color: '#5B3F2B', fontSize: '0.95rem' }}>
          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>1. Generelt</h2>
            <p>
              Denne privatlivspolitik forklarer, hvordan LALATOTO of Denmark ApS behandler personoplysninger, når du opretter bruger, bruger LALATOTO-appen, køber eller administrerer abonnement, anvender community-funktioner, booker eksperter eller kontakter vores kundeservice.
            </p>
            <p style={{ marginTop: 16 }}>
              Politikken er tilpasset en digital app-tjeneste med abonnement. Appen leverer digitale funktioner og indhold, og der behandles derfor ikke leveringsoplysninger til fragtfirmaer i forbindelse med brug af appen.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>2. Dataansvarlig</h2>
            <p style={{ marginBottom: 16 }}>
              Den dataansvarlige for behandlingen af dine personoplysninger er LALATOTO of Denmark ApS.
            </p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Adresse: Kulbyvej 16, 4270 Høng</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>CVR-nr.: 45 14 92 18</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Telefon: 72 15 66 86</li>
              <li style={{ color: '#5B3F2B' }}>E-mail: kundeservice@lalatoto.dk</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              Spørgsmål om denne privatlivspolitik eller vores behandling af personoplysninger kan rettes til kundeservice@lalatoto.dk.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>3. Hvilke oplysninger behandler vi?</h2>
            <p style={{ marginBottom: 16 }}>
              Vi behandler kun personoplysninger, der er relevante for at levere og forbedre appen, administrere dit abonnement, yde support og overholde gældende lovgivning. De konkrete oplysninger afhænger af, hvilke funktioner du bruger.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, width: '35%' }}>Kategori</td>
                  <td style={{ padding: '12px 0' }}>Eksempler på oplysninger</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Konto- og kontaktoplysninger</td>
                  <td style={{ padding: '12px 0' }}>Navn, e-mailadresse, telefonnummer hvis du oplyser det, loginoplysninger, bruger-ID og kontoindstillinger.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Abonnement og betaling</td>
                  <td style={{ padding: '12px 0' }}>Abonnementsstatus, betalingshistorik, faktura- og kvitteringsoplysninger, Stripe-kunde-ID, betalingsmetode-type, transaktions-ID og tekniske betalingsdata. LALATOTO opbevarer ikke fulde kortoplysninger.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>App-profil og brugerindhold</td>
                  <td style={{ padding: '12px 0' }}>Oplysninger du selv indtaster i appen, f.eks. graviditetsuge, terminsdato, barnets fødselsdato/alder, søvnrelaterede oplysninger, præferencer, noter og gemt indhold.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Community-funktioner</td>
                  <td style={{ padding: '12px 0' }}>Brugernavn, profiloplysninger, profilbillede hvis du uploader det, opslag, kommentarer, reaktioner, rapporteringer og moderationshistorik.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Ekspertbooking</td>
                  <td style={{ padding: '12px 0' }}>Oplysninger om valgte eksperter, bookingtidspunkt, spørgsmål, beskeder, noter og de oplysninger, du selv vælger at dele i forbindelse med en booking.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Support og kommunikation</td>
                  <td style={{ padding: '12px 0' }}>Henvendelser til kundeservice, e-mails, beskeder, telefonnoter, fejlbeskrivelser og opfølgningshistorik.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Tekniske oplysninger</td>
                  <td style={{ padding: '12px 0' }}>IP-adresse, enhedstype, operativsystem, app-version, sprogindstilling, logdata, crash-rapporter, sikkerhedslogs og oplysninger om brug af appens funktioner.</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Markedsføring</td>
                  <td style={{ padding: '12px 0' }}>E-mailadresse, navn, samtykkestatus, præferencer og oplysninger om interaktion med nyhedsbreve, hvis du har givet samtykke til markedsføring.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>4. Formål og behandlingsgrundlag</h2>
            <p style={{ marginBottom: 16 }}>
              Vi behandler personoplysninger til nedenstående formål og på de angivne behandlingsgrundlag. Henvisninger henvisningerne til GDPR er medtaget for at gøre behandlingen gennemsigtig.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, width: '25%' }}>Formål</td>
                  <td style={{ padding: '12px 0', fontWeight: 600, width: '40%' }}>Beskrivelse</td>
                  <td style={{ padding: '12px 0', fontWeight: 600 }}>Behandlingsgrundlag</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Oprettelse og drift af konto</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At oprette, administrere og give adgang til din brugerprofil og appens funktioner.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b - opfyldelse af aftale.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Abonnement og betaling</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At oprette abonnement, gennemføre betaling via Stripe, sende kvitteringer og håndtere betalingsfejl.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b. Bogføringsoplysninger behandles også efter art. 6, stk. 1, litra c.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Personligt indhold i appen</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At vise relevant indhold om graviditet, babysøvn, udvikling, tigerspring og appens øvrige funktioner baseret på dine indtastninger.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b. Hvis oplysningerne udgør helbredsoplysninger eller andre særlige kategorier, behandles de kun med relevant grundlag, typisk udtrykkeligt samtykke efter GDPR art. 9, stk. 2, litra a.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Community</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At gøre det muligt at oprette opslag, kommentere, reagere, se andre brugeres indhold og moderere misbrug.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b og f - aftale samt legitim interesse i et sikkert community.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Ekspertbooking</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At gennemføre booking, dele nødvendige oplysninger med den valgte ekspert og yde opfølgning.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b. Følsomme oplysninger behandles kun, hvis du selv vælger at dele dem og der foreligger relevant samtykke eller andet gyldigt grundlag.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Support</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At besvare spørgsmål, løse tekniske problemer og dokumentere dialog med dig.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra b og f.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Drift, sikkerhed og fejlretning</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At beskytte appen mod misbrug, analysere fejl, sikre stabil drift og forebygge svig.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra f - legitim interesse i sikker og stabil drift.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Markedsføring</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At sende nyhedsbreve, tilbud og inspiration, hvis du har givet samtykke.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra a - samtykke. Du kan altid trække samtykket tilbage.</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 0', fontWeight: 500, verticalAlign: 'top' }}>Overholdelse af lovgivning</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>At opfylde bogføringskrav, håndtere indsigelser, krav eller myndighedshenvendelser.</td>
                  <td style={{ padding: '12px 0', verticalAlign: 'top' }}>GDPR art. 6, stk. 1, litra c og f.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>5. Oplysninger om graviditet, børn og helbred</h2>
            <p style={{ marginBottom: 16 }}>
              LALATOTO-appen er rettet mod gravide og forældre. Det betyder, at nogle oplysninger, som du selv vælger at indtaste, kan handle om graviditet, barnets alder, søvn, trivsel eller udvikling.
            </p>
            <p style={{ marginBottom: 16 }}>
              Oplysninger om graviditet, helbred, søvnproblemer eller lignende kan i visse tilfælde være følsomme personoplysninger efter GDPR. Vi behandler kun sådanne oplysninger, hvis de er nødvendige for den funktion, du bruger, og hvis der foreligger et gyldigt behandlingsgrundlag, typisk dit udtrykkelige samtykke.
            </p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Du vælger selv, hvilke oplysninger du indtaster i appen.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Du bør ikke dele følsomme oplysninger i community-funktioner, hvis du ikke ønsker, at andre brugere kan se dem.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Hvis du indtaster oplysninger om et barn, bekræfter du, at du er forælder, værge eller på anden måde har ret til at give oplysningerne.</li>
              <li style={{ color: '#5B3F2B' }}>Appen er ikke beregnet til, at børn selv opretter konto eller bruger tjenesten uden en voksen.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>6. Betaling via Stripe</h2>
            <p style={{ marginBottom: 16 }}>
              Betalinger og abonnementsopkrævninger håndteres via Stripe. Stripe kan understøtte betaling med f.eks. Visa, Mastercard, MobilePay og Apple Pay, afhængigt af den aktuelle betalingsopsætning.
            </p>
            <p style={{ marginBottom: 16 }}>
              Når du betaler, behandler Stripe betalingsoplysninger, der er nødvendige for at gennemføre betalingen, forebygge svig og administrere abonnementet. LALATOTO modtager og opbevarer ikke dine fulde kortoplysninger. Vi modtager alene de oplysninger, der er nødvendige for at se betalingsstatus, administrere abonnementet og bogføre transaktionen.
            </p>
            <p>
              Stripe kan i visse tilfælde være selvstændigt dataansvarlig for dele af sin behandling, f.eks. i relation til svigforebyggelse og overholdelse af finansiel lovgivning. Stripe har egne privatlivsvilkår, som gælder for Stripes behandling.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>7. Modtagere og databehandlere</h2>
            <p style={{ marginBottom: 16 }}>
              Vi sælger ikke dine personoplysninger til tredjemand. Vi videregiver eller overlader kun oplysninger, når det er nødvendigt for at levere appen, administrere abonnementet, yde support, overholde lovgivning eller beskytte vores rettigheder.
            </p>
            <ul style={{ marginTop: 16, marginBottom: 16, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Stripe til betalings- og abonnementsbehandling.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Hosting-, database- og cloudleverandører til drift af appen.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>IT-, udviklings- og supportleverandører til vedligeholdelse, fejlretning og sikkerhed.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>E-mail-, SMS- eller push-leverandører til servicebeskeder og eventuelle nyhedsbreve.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Analyse- og crash-reporting-værktøjer til stabilitet, statistik og forbedring af appen, hvor dette er lovligt og relevant.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Eksterne eksperter, hvis du bruger ekspertbooking, og kun i det omfang oplysningerne er nødvendige for bookingen.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Revisorer, bogføringssystemer, juridiske rådgivere og offentlige myndigheder, hvis det er nødvendigt eller lovpligtigt.</li>
              <li style={{ color: '#5B3F2B' }}>Andre brugere, hvis du selv publicerer opslag, kommentarer, profiloplysninger eller andet indhold i community-funktioner.</li>
            </ul>
            <p>
              Vi indgår databehandleraftaler med leverandører, der behandler personoplysninger på vores vegne. Databehandlere må kun behandle oplysninger efter vores instruks og til de formål, som er aftalt.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>8. Overførsel til lande uden for EU/EØS</h2>
            <p style={{ marginBottom: 16 }}>
              Nogle leverandører kan behandle eller tilgå personoplysninger fra lande uden for EU/EØS, herunder USA. Det kan f.eks. være relevant ved brug af internationale betalings-, cloud-, analyse- eller supportleverandører.
            </p>
            <p>
              Hvis personoplysninger overføres til et land uden for EU/EØS, sikrer vi, at overførslen sker på et gyldigt overførselsgrundlag, f.eks. EU-Kommissionens standardkontraktbestemmelser, en afgørelse om tilstrækkeligt beskyttelsesniveau, EU-U.S. Data Privacy Framework eller andre relevante garantier efter databeskyttelsesreglerne.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>9. Opbevaring og sletning</h2>
            <p style={{ marginBottom: 16 }}>
              Vi opbevarer personoplysninger, så længe det er nødvendigt for de formål, oplysningerne er indsamlet til, eller så længe vi er forpligtet til det efter lovgivningen. Når oplysninger ikke længere er nødvendige, slettes eller anonymiseres de.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, width: '35%' }}>Datatype</td>
                  <td style={{ padding: '12px 0', fontWeight: 600 }}>Opbevaring</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Konto- og profiloplysninger</td>
                  <td style={{ padding: '12px 0' }}>Opbevares så længe din konto er aktiv. Ved sletning af konto slettes eller anonymiseres oplysningerne som udgangspunkt inden for rimelig tid, medmindre der er et lovligt grundlag for længere opbevaring.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Abonnement, fakturaer og betaling</td>
                  <td style={{ padding: '12px 0' }}>Betalings- og fakturaoplysninger, der udgør bogføringsmateriale, opbevares som udgangspunkt i 5 år fra udgangen af det regnskabsår, materialet vedrører.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Community-indhold</td>
                  <td style={{ padding: '12px 0' }}>Indhold du selv har offentliggjort, kan slettes eller anonymiseres ved lukning af konto. I visse tilfælde kan indhold fortsat fremgå i anonymiseret form, hvis det indgår i en tråd eller er nødvendigt for community-sammenhængen.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Supporthenvendelser</td>
                  <td style={{ padding: '12px 0' }}>Opbevares så længe det er nødvendigt for at behandle henvendelsen og dokumentere forløbet. Som udgangspunkt slettes eller anonymiseres oplysningerne, når de ikke længere er relevante.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #EDE4DB' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Markedsføringssamtykke</td>
                  <td style={{ padding: '12px 0' }}>Opbevares indtil du trækker samtykket tilbage. Dokumentation for samtykke kan opbevares i en periode, hvis det er nødvendigt for at kunne dokumentere lovlig markedsføring.</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>Tekniske logs og sikkerhedsdata</td>
                  <td style={{ padding: '12px 0' }}>Opbevares kun så længe det er nødvendigt for drift, fejlfinding, sikkerhed og misbrugsforebyggelse. Længere opbevaring kan ske ved konkret sikkerhedshændelse eller tvist.</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 16 }}>
              Sletning fra backup sker efter vores almindelige backup- og sikkerhedsprocedurer.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>10. Markedsføring og servicebeskeder</h2>
            <p style={{ marginBottom: 16 }}>
              Vi kan sende servicebeskeder, der vedrører din konto, appen, betaling, abonnement, sikkerhed eller væsentlige ændringer i vilkår. Servicebeskeder er ikke markedsføring og er nødvendige for at levere tjenesten.
            </p>
            <p>
              Vi sender kun markedsføring, nyhedsbreve, tilbud eller lignende via e-mail, SMS eller push-notifikationer, hvis du har givet samtykke, eller hvis lovgivningen i øvrigt giver adgang til det. Du kan altid trække dit samtykke tilbage via afmeldingslink, appens indstillinger eller ved at kontakte os på kundeservice@lalatoto.dk.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>11. Cookies, analyse og lignende teknologier</h2>
            <p style={{ marginBottom: 16 }}>
              Hvis vi bruger cookies, SDK'er eller lignende teknologier i appen eller på tilknyttede hjemmesider, sker det for at sikre funktionalitet, måle brug, analysere fejl, forbedre appen og - hvis du har givet samtykke - til markedsføringsformål.
            </p>
            <p>
              Hvor samtykke er påkrævet, indhenter vi det særskilt. Du kan normalt ændre dine valg i appens indstillinger, via cookieindstillinger på hjemmesiden eller i din enheds indstillinger.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>12. Sikkerhed</h2>
            <p style={{ marginBottom: 16 }}>
              Vi anvender tekniske og organisatoriske sikkerhedsforanstaltninger, der skal beskytte personoplysninger mod uautoriseret adgang, tab, ændring, offentliggørelse eller misbrug. Det omfatter bl.a. adgangsbegrænsning, løbende vedligeholdelse, leverandørstyring, databehandleraftaler og relevante sikkerhedsprocedurer.
            </p>
            <p>
              Du er selv ansvarlig for at holde dine loginoplysninger fortrolige og for at kontakte os, hvis du mistænker misbrug af din konto.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>13. Dine rettigheder</h2>
            <p style={{ marginBottom: 16 }}>
              Du har efter databeskyttelsesreglerne en række rettigheder. Rettighederne kan være begrænset i visse tilfælde, f.eks. hvis fortsat behandling er nødvendig for at overholde lovgivning eller fastlægge, gøre gældende eller forsvare et retskrav.
            </p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til indsigt i de personoplysninger, vi behandler om dig.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til berigtigelse af urigtige eller ufuldstændige oplysninger.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til sletning, når betingelserne for sletning er opfyldt.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til begrænsning af behandling i visse situationer.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til dataportabilitet for oplysninger, du selv har givet os, når behandlingen sker automatisk og er baseret på samtykke eller aftale.</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Ret til at gøre indsigelse mod behandling baseret på vores legitime interesser.</li>
              <li style={{ color: '#5B3F2B' }}>Ret til at trække samtykke tilbage, uden at det påvirker lovligheden af den behandling, der er sket før tilbagetrækningen.</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              Du kan udøve dine rettigheder ved at skrive til kundeservice@lalatoto.dk. Vi kan bede om dokumentation for din identitet, hvis det er nødvendigt for at beskytte dine oplysninger.
            </p>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>14. Klage til Datatilsynet</h2>
            <p style={{ marginBottom: 16 }}>
              Hvis du er utilfreds med vores behandling af dine personoplysninger, opfordrer vi dig til først at kontakte os, så vi kan forsøge at finde en løsning.
            </p>
            <p style={{ marginBottom: 16 }}>
              Du har også ret til at klage til Datatilsynet:
            </p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Telefon: 33 19 32 00</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>E-mail: dt@datatilsynet.dk</li>
              <li style={{ color: '#5B3F2B' }}>Hjemmeside: www.datatilsynet.dk</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #EDE4DB' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>15. Ændringer i privatlivspolitikken</h2>
            <p>
              Vi kan ændre denne privatlivspolitik, hvis vi ændrer appen, vores behandling af personoplysninger, leverandører eller juridiske krav. Ved væsentlige ændringer informerer vi dig via appen, e-mail eller anden relevant kommunikationskanal.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: 20,
              color: '#2B1F16',
              letterSpacing: '-0.01em'
            }}>16. Kontakt</h2>
            <p style={{ marginBottom: 16 }}>
              Har du spørgsmål til privatlivspolitikken, vores behandling af personoplysninger eller dine rettigheder, kan du kontakte os her:
            </p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>LALATOTO of Denmark ApS</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Kulbyvej 16, 4270 Høng</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>Tlf. 72 15 66 86</li>
              <li style={{ marginBottom: 10, color: '#5B3F2B' }}>E-mail: kundeservice@lalatoto.dk</li>
              <li style={{ color: '#5B3F2B' }}>CVR-nr. 45 14 92 18</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}