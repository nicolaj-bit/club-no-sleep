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
          Senest opdateret: 25. april 2026
        </p>

        <div style={{ lineHeight: 1.8, color: '#5B3F2B', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 32 }}>
            Disse bruger- og abonnementsbetingelser gælder for brugen af LALATOTO-appen samt for oprettelse, betaling og administration af abonnement til appen. Ved oprettelse af bruger og tegning af abonnement accepterer du disse betingelser.
          </p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>1. Virksomhedsoplysninger</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: 16, paddingBottom: 8 }}>Virksomhed</td>
                  <td style={{ paddingBottom: 8 }}>LALATOTO of Denmark ApS</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: 16, paddingBottom: 8 }}>Adresse</td>
                  <td style={{ paddingBottom: 8 }}>Kulbyvej 16, 4270 Høng</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: 16, paddingBottom: 8 }}>Telefon</td>
                  <td style={{ paddingBottom: 8 }}>72 15 66 86</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: 16, paddingBottom: 8 }}>E-mail</td>
                  <td style={{ paddingBottom: 8 }}><a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, paddingRight: 16 }}>CVR-nr.</td>
                  <td>45 14 92 18</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>2. Om LALATOTO-appen</h2>
            <p style={{ marginBottom: 12 }}>LALATOTO er en digital app-tjeneste rettet mod gravide og forældre til spædbørn og småbørn. Appen kan give adgang til indhold om graviditet, babysøvn, tigerspring, community-funktioner og bookingrelaterede funktioner.</p>
            <p style={{ marginBottom: 12 }}>Appen er en digital tjeneste. Der sælges ikke fysiske produkter via disse abonnementsbetingelser, og der er derfor ingen fysisk levering, fragt eller returproces for varer.</p>
            <p>Indholdet i appen er generel information og inspiration. Det erstatter ikke individuel rådgivning fra læge, jordemoder, sundhedsplejerske eller anden autoriseret sundhedsperson. Ved sygdom, bekymring eller akutte spørgsmål bør du kontakte relevant sundhedsfaglig hjælp.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>3. Abonnement og pris</h2>
            <p style={{ marginBottom: 12 }}>Adgang til appens abonnementsfunktioner kræver et aktivt abonnement.</p>
            <ul style={{ marginTop: 12, marginBottom: 12, paddingLeft: 24 }}>
              <li style={{ marginBottom: 8 }}>Pris: 59 kr. pr. måned</li>
              <li style={{ marginBottom: 8 }}>Abonnementet fornyes automatisk hver måned, indtil det opsiges.</li>
              <li style={{ marginBottom: 8 }}>Alle beløb er angivet i danske kroner (DKK) og er inkl. moms, medmindre andet fremgår tydeligt ved tilmelding.</li>
              <li style={{ marginBottom: 8 }}>Der er ingen binding ud over den igangværende betalingsmåned.</li>
            </ul>
            <p>Når du tegner abonnement, giver du samtykke til, at abonnementet aktiveres med det samme, og at betalingen trækkes automatisk for hver abonnementsperiode, indtil abonnementet opsiges.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>4. Betaling via Stripe</h2>
            <p style={{ marginBottom: 12 }}>Betaling håndteres via Stripe, som er LALATOTOs eksterne betalingsleverandør. Stripe understøtter blandt andet Visa, Mastercard, MobilePay og Apple Pay, hvis disse betalingsmetoder er tilgængelige ved checkout.</p>
            <ul style={{ marginTop: 12, marginBottom: 12, paddingLeft: 24 }}>
              <li style={{ marginBottom: 8 }}>Betalingen trækkes automatisk på den betalingsmetode, du angiver ved oprettelse.</li>
              <li style={{ marginBottom: 8 }}>LALATOTO opbevarer ikke dine fulde kortoplysninger.</li>
              <li>Hvis en betaling ikke kan gennemføres, kan adgangen til appen blive suspenderet, indtil gyldig betaling er modtaget.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>5. Prøveperiode</h2>
            <p style={{ marginBottom: 12 }}>Hvis der ved tilmelding tilbydes en gratis prøveperiode, fremgår længden og vilkårene tydeligt i appen eller ved checkout. Efter prøveperiodens udløb overgår abonnementet automatisk til betalt abonnement til den oplyste månedspris, medmindre abonnementet opsiges inden prøveperiodens udløb.</p>
            <p>Hvis der ikke fremgår en prøveperiode ved tilmelding, starter det betalte abonnement straks ved oprettelse.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>6. Opsigelse - ingen binding</h2>
            <p style={{ marginBottom: 12 }}>Du kan til enhver tid opsige dit abonnement. Der er ingen binding ud over den løbende betalingsmåned.</p>
            <p style={{ marginBottom: 12 }}>Opsigelse sker via Indstillinger &gt; Opsig abonnement i appen, medmindre en anden opsigelsesmetode er angivet i appen eller i den betalingsløsning, hvor abonnementet er oprettet.</p>
            <p style={{ marginBottom: 12 }}>Opsigelsen træder i kraft ved udløbet af den løbende betalingsmåned. Du bevarer adgang til appen indtil periodens udløb. Der foretages som udgangspunkt ikke hel eller delvis refusion for resterende dage i en allerede påbegyndt abonnementsperiode, medmindre andet følger af ufravigelig lovgivning.</p>
            <p style={{ marginBottom: 12, fontStyle: 'italic' }}>Eksempel: Opsiger du abonnementet den 10. i en måned, har du adgang frem til og med den sidste dag i den samme løbende betalingsmåned.</p>
            <p>Sletning af appen fra din enhed er ikke i sig selv en opsigelse af abonnementet. Abonnementet skal opsiges via den angivne opsigelsesfunktion.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>7. Digital levering og adgang</h2>
            <p style={{ marginBottom: 12 }}>Adgang til appen leveres digitalt, når abonnementet er oprettet, betalingen er godkendt, og brugeren har adgang til sin konto. Der sendes ikke fysiske produkter, og der beregnes ikke fragt.</p>
            <p>LALATOTO kan løbende ændre, forbedre eller fjerne funktioner i appen som led i almindelig drift, videreudvikling, sikkerhed eller teknisk vedligeholdelse. Væsentlige ændringer, der påvirker dit abonnement, varsles i overensstemmelse med punkt 15.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>8. Fortrydelsesret</h2>
            <p style={{ marginBottom: 12 }}>Som forbruger har du som udgangspunkt 14 dages fortrydelsesret fra den dag, aftalen om abonnement indgås.</p>
            <p style={{ marginBottom: 12 }}>Da appen giver adgang til digitalt indhold og digitale ydelser, som kan leveres straks efter aktivering, kan du ved oprettelse blive bedt om udtrykkeligt at acceptere, at leveringen påbegyndes med det samme, og at du anerkender, at fortrydelsesretten dermed bortfalder i det omfang, lovgivningen giver mulighed for det.</p>
            <p>Hvis du ønsker at gøre brug af fortrydelsesretten, og du endnu ikke har taget tjenesten i brug på en måde, hvor fortrydelsesretten er bortfaldet, skal du kontakte os på <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>9. Brugerens konto og ansvar</h2>
            <p style={{ marginBottom: 12 }}>For at bruge appen skal du oprette en bruger. Du er ansvarlig for, at dine oplysninger er korrekte og opdaterede.</p>
            <ul style={{ marginTop: 12, marginBottom: 12, paddingLeft: 24 }}>
              <li style={{ marginBottom: 8 }}>Du skal opbevare dine loginoplysninger sikkert.</li>
              <li style={{ marginBottom: 8 }}>Du må ikke dele din konto med andre, medmindre LALATOTO udtrykkeligt har tilladt det.</li>
              <li style={{ marginBottom: 8 }}>Du må ikke forsøge at skaffe dig uautoriseret adgang til appen, systemer eller andre brugeres data.</li>
              <li style={{ marginBottom: 8 }}>Du må ikke kopiere, distribuere, videresælge eller på anden måde udnytte appens indhold kommercielt uden skriftlig tilladelse.</li>
              <li>Du skal være mindst 18 år eller have samtykke fra en forælder/værge for at tegne et betalt abonnement.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>10. Community og brugerindhold</h2>
            <p style={{ marginBottom: 12 }}>Hvis appen indeholder community-funktioner, er du ansvarlig for det indhold, du deler. Du må ikke dele ulovligt, krænkende, diskriminerende, vildledende, chikanerende eller på anden måde upassende indhold.</p>
            <p>LALATOTO forbeholder sig retten til at moderere, skjule eller slette brugerindhold samt suspendere adgang ved misbrug eller væsentlig overtrædelse af disse betingelser.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>11. Ekspertbooking og tredjepartsydelser</h2>
            <p style={{ marginBottom: 12 }}>Hvis appen giver adgang til ekspertbooking, bookingfunktioner eller indhold fra eksterne eksperter, kan der gælde særskilte vilkår for den konkrete booking eller ydelse. Sådanne vilkår vil fremgå i appen eller i forbindelse med bookingen.</p>
            <p>LALATOTO er ikke ansvarlig for sundhedsfaglige vurderinger, individuelle behandlingsråd eller beslutninger truffet på baggrund af generelt indhold i appen. Ved konkrete sundhedsmæssige spørgsmål bør du altid søge relevant fagperson.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>12. Support, fejl og tilgængelighed</h2>
            <p style={{ marginBottom: 12 }}>Oplever du tekniske fejl eller problemer med appen, kan du kontakte os på <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a> eller tlf. 72 15 66 86. Vi bestræber os på at besvare henvendelser inden for 2 hverdage.</p>
            <p>Vi tilstræber, at appen er stabil og tilgængelig, men kan ikke garantere, at appen altid er fejlfri eller uden afbrydelser. Midlertidig utilgængelighed kan forekomme ved vedligeholdelse, opdateringer, tekniske fejl, sikkerhedsmæssige forhold eller forhold uden for LALATOTOs kontrol.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>13. Rettigheder til app og indhold</h2>
            <p style={{ marginBottom: 12 }}>Alle rettigheder til appen, design, tekst, grafik, logoer, funktioner, software, lyd, video og øvrigt indhold tilhører LALATOTO eller LALATOTOs licensgivere, medmindre andet er angivet.</p>
            <p>Som abonnent får du en personlig, begrænset, ikke-eksklusiv og ikke-overdragelig brugsret til appen, så længe dit abonnement er aktivt, og du overholder disse betingelser.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>14. Personoplysninger</h2>
            <p style={{ marginBottom: 12 }}>LALATOTO behandler de personoplysninger, der er nødvendige for at levere appen og administrere abonnementet, herunder navn, e-mail, profiloplysninger, brugsdata og relevante betalingsrelaterede oplysninger.</p>
            <p style={{ marginBottom: 12 }}>Personoplysninger behandles i overensstemmelse med GDPR og LALATOTOs privatlivspolitik, som kan læses i appen under Indstillinger &gt; Privatliv eller på den relevante hjemmeside, hvis den er gjort tilgængelig der.</p>
            <p>Dataansvarlig: LALATOTO of Denmark ApS, <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>15. Ændringer i betingelser og pris</h2>
            <p style={{ marginBottom: 12 }}>LALATOTO kan ændre disse betingelser, appens funktioner og abonnementsprisen. Væsentlige ændringer varsles via appen eller e-mail med mindst 30 dages varsel, medmindre ændringen er nødvendig af sikkerhedsmæssige, juridiske eller tekniske årsager.</p>
            <p>Hvis du ikke kan acceptere ændringerne, kan du opsige abonnementet, inden ændringerne træder i kraft.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>16. Klageadgang</h2>
            <p style={{ marginBottom: 12 }}>Hvis du ønsker at klage, beder vi dig først kontakte os direkte, så vi kan forsøge at finde en løsning.</p>
            <p style={{ marginBottom: 12 }}>Hvis vi ikke kan finde en løsning, kan du som forbruger klage til Nævnenes Hus / Mæglingsteamet for Forbrugerklager:</p>
            <p style={{ marginBottom: 12 }}>
              Nævnenes Hus, Toldboden 2, 8800 Viborg<br />
              <a href="http://www.naevneneshus.dk" style={{ color: '#C29A73', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">www.naevneneshus.dk</a>
            </p>
            <p>EU-Kommissionens tidligere online klageportal (ODR-platformen) er lukket og kan ikke længere anvendes til nye klager.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>17. Misligholdelse og lukning af adgang</h2>
            <p style={{ marginBottom: 12 }}>LALATOTO kan suspendere eller lukke din adgang til appen, hvis du væsentligt misligholder disse betingelser, eksempelvis ved manglende betaling, misbrug af appen, krænkelse af andres rettigheder eller ulovlig brug.</p>
            <p>Ved lukning som følge af væsentlig misligholdelse refunderes allerede betalte beløb som udgangspunkt ikke.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              marginBottom: 12,
              color: '#2B1F16'
            }}>18. Lovvalg og værneting</h2>
            <p>Disse betingelser er underlagt dansk ret. Eventuelle tvister afgøres ved de danske domstole, medmindre andet følger af ufravigelige forbrugerretlige regler.</p>
          </section>
        </div>
      </article>
    </div>
  );
}