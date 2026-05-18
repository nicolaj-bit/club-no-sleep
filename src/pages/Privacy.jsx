import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  const h2Style = {
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontSize: '1.6rem',
    fontWeight: 400,
    marginBottom: 20,
    color: '#2B1F16',
    letterSpacing: '-0.01em'
  };

  const sectionStyle = {
    marginBottom: 48,
    paddingBottom: 32,
    borderBottom: '1px solid #EDE4DB'
  };

  const liStyle = { marginBottom: 10, color: '#5B3F2B' };

  // Key-value table rows (like Terms virksomhedsoplysninger)
  const InfoRow = ({ label, value }) => (
    <tr style={{ borderTop: '1px solid #EDE4DB' }}>
      <td style={{ fontWeight: 500, paddingRight: 24, paddingTop: 12, paddingBottom: 12, color: '#7A665A', fontSize: '0.9rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ paddingTop: 12, paddingBottom: 12, color: '#2B1F16' }}>{value}</td>
    </tr>
  );

  // Two-column data table rows
  const DataRow = ({ col1, col2, col3, header }) => (
    <tr style={{ borderTop: '1px solid #EDE4DB', background: header ? '#F7F0EA' : 'transparent' }}>
      <td style={{ paddingTop: 12, paddingBottom: 12, paddingRight: 20, color: header ? '#7A665A' : '#2B1F16', fontWeight: header ? 600 : 500, fontSize: '0.88rem', verticalAlign: 'top', width: col3 ? '22%' : '32%' }}>{col1}</td>
      <td style={{ paddingTop: 12, paddingBottom: 12, paddingRight: col3 ? 20 : 0, color: header ? '#7A665A' : '#5B3F2B', fontSize: '0.9rem', verticalAlign: 'top', width: col3 ? '40%' : '68%' }}>{col2}</td>
      {col3 !== undefined && <td style={{ paddingTop: 12, paddingBottom: 12, color: header ? '#7A665A' : '#5B3F2B', fontSize: '0.88rem', verticalAlign: 'top' }}>{col3}</td>}
    </tr>
  );

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
      <article style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 64px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '3rem',
          fontWeight: 300,
          marginBottom: 8,
          color: '#2B1F16',
          letterSpacing: '-0.02em'
        }}>
          Privatlivspolitik
        </h1>
        <p style={{ color: '#C29A73', marginBottom: 40, fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Senest opdateret 25. april 2026
        </p>

        <div style={{ lineHeight: 1.8, color: '#5B3F2B', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 40, fontSize: '1rem', color: '#7A665A', lineHeight: 1.7 }}>
            Denne privatlivspolitik forklarer, hvordan LALATOTO of Denmark ApS behandler personoplysninger, når du opretter bruger, bruger LALATOTO-appen, køber eller administrerer abonnement, anvender community-funktioner, booker eksperter eller kontakter vores kundeservice.
          </p>

          {/* 1 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Generelt</h2>
            <p>Politikken er tilpasset en digital app-tjeneste med abonnement. Appen leverer digitale funktioner og indhold, og der behandles derfor ikke leveringsoplysninger til fragtfirmaer i forbindelse med brug af appen.</p>
          </section>

          {/* 2 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Dataansvarlig</h2>
            <p style={{ marginBottom: 16 }}>Den dataansvarlige for behandlingen af dine personoplysninger er LALATOTO of Denmark ApS.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <InfoRow label="Virksomhed" value="LALATOTO of Denmark ApS" />
                <InfoRow label="Adresse" value="Kulbyvej 16, 4270 Høng" />
                <InfoRow label="CVR-nr." value="45 14 92 18" />
                <InfoRow label="Telefon" value="72 15 66 86" />
                <InfoRow label="E-mail" value={<a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a>} />
              </tbody>
            </table>
            <p style={{ marginTop: 16 }}>Spørgsmål om denne privatlivspolitik kan rettes til kundeservice@lalatoto.dk.</p>
          </section>

          {/* 3 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Hvilke oplysninger behandler vi?</h2>
            <p style={{ marginBottom: 16 }}>Vi behandler kun personoplysninger, der er relevante for at levere og forbedre appen, administrere dit abonnement, yde support og overholde gældende lovgivning.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <tbody>
                <DataRow header col1="Kategori" col2="Eksempler på oplysninger" />
                <DataRow col1="Konto- og kontaktoplysninger" col2="Navn, e-mailadresse, telefonnummer hvis du oplyser det, loginoplysninger, bruger-ID og kontoindstillinger." />
                <DataRow col1="Abonnement og betaling" col2="Abonnementsstatus, betalingshistorik, faktura- og kvitteringsoplysninger, Stripe-kunde-ID, betalingsmetode-type, transaktions-ID. LALATOTO opbevarer ikke fulde kortoplysninger." />
                <DataRow col1="App-profil og brugerindhold" col2="Oplysninger du selv indtaster, f.eks. graviditetsuge, terminsdato, barnets fødselsdato/alder, søvnrelaterede oplysninger, præferencer, noter og gemt indhold." />
                <DataRow col1="Community-funktioner" col2="Brugernavn, profiloplysninger, profilbillede hvis du uploader det, opslag, kommentarer, reaktioner, rapporteringer og moderationshistorik." />
                <DataRow col1="Ekspertbooking" col2="Oplysninger om valgte eksperter, bookingtidspunkt, spørgsmål, beskeder, noter og de oplysninger, du selv vælger at dele." />
                <DataRow col1="Support og kommunikation" col2="Henvendelser til kundeservice, e-mails, beskeder, telefonnoter, fejlbeskrivelser og opfølgningshistorik." />
                <DataRow col1="Tekniske oplysninger" col2="IP-adresse, enhedstype, operativsystem, app-version, sprogindstilling, logdata, crash-rapporter og sikkerhedslogs." />
                <DataRow col1="Markedsføring" col2="E-mailadresse, navn, samtykkestatus og præferencer – kun hvis du har givet samtykke til markedsføring." />
              </tbody>
            </table>
          </section>

          {/* 4 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Formål og behandlingsgrundlag</h2>
            <p style={{ marginBottom: 16 }}>Vi behandler personoplysninger til nedenstående formål og på de angivne behandlingsgrundlag. Henvisningerne til GDPR er medtaget for at gøre behandlingen gennemsigtig.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <tbody>
                <DataRow header col1="Formål" col2="Beskrivelse" col3="Behandlingsgrundlag" />
                <DataRow col1="Drift af konto" col2="At oprette, administrere og give adgang til din brugerprofil og appens funktioner." col3="Art. 6(1)(b) – aftale" />
                <DataRow col1="Abonnement og betaling" col2="At oprette abonnement, gennemføre betaling via Stripe, sende kvitteringer og håndtere betalingsfejl." col3="Art. 6(1)(b) + (c)" />
                <DataRow col1="Indhold i appen" col2="At vise relevant indhold om graviditet, babysøvn, udvikling og tigerspring baseret på dine indtastninger." col3="Art. 6(1)(b), evt. 9(2)(a)" />
                <DataRow col1="Community" col2="At gøre det muligt at oprette opslag, kommentere og moderere misbrug." col3="Art. 6(1)(b) + (f)" />
                <DataRow col1="Ekspertbooking" col2="At gennemføre booking og dele nødvendige oplysninger med den valgte ekspert." col3="Art. 6(1)(b)" />
                <DataRow col1="Support" col2="At besvare spørgsmål, løse tekniske problemer og dokumentere dialog." col3="Art. 6(1)(b) + (f)" />
                <DataRow col1="Drift og sikkerhed" col2="At beskytte appen mod misbrug, analysere fejl og forebygge svig." col3="Art. 6(1)(f) – legitim interesse" />
                <DataRow col1="Markedsføring" col2="At sende nyhedsbreve og tilbud, hvis du har givet samtykke." col3="Art. 6(1)(a) – samtykke" />
                <DataRow col1="Lovgivning" col2="At opfylde bogføringskrav og håndtere myndighedshenvendelser." col3="Art. 6(1)(c) + (f)" />
              </tbody>
            </table>
          </section>

          {/* 5 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Oplysninger om graviditet, børn og helbred</h2>
            <p style={{ marginBottom: 12 }}>LALATOTO-appen er rettet mod gravide og forældre. Det betyder, at nogle oplysninger, som du selv vælger at indtaste, kan handle om graviditet, barnets alder, søvn, trivsel eller udvikling.</p>
            <p style={{ marginBottom: 12 }}>Oplysninger om graviditet, helbred eller søvnproblemer kan i visse tilfælde være følsomme personoplysninger efter GDPR. Vi behandler kun sådanne oplysninger, hvis de er nødvendige for den funktion, du bruger, og der foreligger et gyldigt behandlingsgrundlag, typisk dit udtrykkelige samtykke.</p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Du vælger selv, hvilke oplysninger du indtaster i appen.</li>
              <li style={liStyle}>Du bør ikke dele følsomme oplysninger i community-funktioner, hvis du ikke ønsker, at andre brugere kan se dem.</li>
              <li style={liStyle}>Hvis du indtaster oplysninger om et barn, bekræfter du, at du er forælder, værge eller på anden måde har ret til at give oplysningerne.</li>
              <li style={{ color: '#5B3F2B' }}>Appen er ikke beregnet til, at børn selv opretter konto eller bruger tjenesten uden en voksen.</li>
            </ul>
          </section>

          {/* 6 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Betaling via Stripe</h2>
            <p style={{ marginBottom: 12 }}>Betalinger og abonnementsopkrævninger håndteres via Stripe. Stripe kan understøtte betaling med f.eks. Visa, Mastercard, MobilePay og Apple Pay, afhængigt af den aktuelle betalingsopsætning.</p>
            <p style={{ marginBottom: 12 }}>LALATOTO modtager og opbevarer ikke dine fulde kortoplysninger. Vi modtager alene de oplysninger, der er nødvendige for at se betalingsstatus, administrere abonnementet og bogføre transaktionen.</p>
            <p>Stripe kan i visse tilfælde være selvstændigt dataansvarlig for dele af sin behandling, f.eks. i relation til svigforebyggelse og finansiel lovgivning. Stripe har egne privatlivsvilkår, som gælder for Stripes behandling.</p>
          </section>

          {/* 7 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Modtagere og databehandlere</h2>
            <p style={{ marginBottom: 12 }}>Vi sælger ikke dine personoplysninger til tredjemand. Vi videregiver eller overlader kun oplysninger, når det er nødvendigt for at levere appen, administrere abonnementet, yde support, overholde lovgivning eller beskytte vores rettigheder.</p>
            <ul style={{ marginTop: 16, marginBottom: 16, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Stripe til betalings- og abonnementsbehandling.</li>
              <li style={liStyle}>Hosting-, database- og cloudleverandører til drift af appen.</li>
              <li style={liStyle}>IT-, udviklings- og supportleverandører til vedligeholdelse, fejlretning og sikkerhed.</li>
              <li style={liStyle}>E-mail-, SMS- eller push-leverandører til servicebeskeder og eventuelle nyhedsbreve.</li>
              <li style={liStyle}>Analyse- og crash-reporting-værktøjer til statistik og forbedring af appen.</li>
              <li style={liStyle}>Eksterne eksperter, hvis du bruger ekspertbooking, kun i nødvendigt omfang.</li>
              <li style={liStyle}>Revisorer, bogføringssystemer, juridiske rådgivere og offentlige myndigheder, hvis lovpligtigt.</li>
              <li style={{ color: '#5B3F2B' }}>Andre brugere, hvis du selv publicerer opslag, kommentarer eller profiloplysninger i community.</li>
            </ul>
            <p>Vi indgår databehandleraftaler med leverandører, der behandler personoplysninger på vores vegne.</p>
          </section>

          {/* 8 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Overførsel til lande uden for EU/EØS</h2>
            <p style={{ marginBottom: 12 }}>Nogle leverandører kan behandle eller tilgå personoplysninger fra lande uden for EU/EØS, herunder USA. Det kan f.eks. være relevant ved brug af internationale betalings-, cloud-, analyse- eller supportleverandører.</p>
            <p>Hvis personoplysninger overføres til et land uden for EU/EØS, sikrer vi, at overførslen sker på et gyldigt overførselsgrundlag, f.eks. EU-Kommissionens standardkontraktbestemmelser, EU-U.S. Data Privacy Framework eller andre relevante garantier efter databeskyttelsesreglerne.</p>
          </section>

          {/* 9 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Opbevaring og sletning</h2>
            <p style={{ marginBottom: 16 }}>Vi opbevarer personoplysninger, så længe det er nødvendigt for de formål, oplysningerne er indsamlet til, eller så længe vi er forpligtet til det efter lovgivningen.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <tbody>
                <DataRow header col1="Datatype" col2="Opbevaring" />
                <DataRow col1="Konto- og profiloplysninger" col2="Opbevares så længe kontoen er aktiv. Slettes eller anonymiseres inden for rimelig tid ved kontosletning, medmindre der er lovligt grundlag for længere opbevaring." />
                <DataRow col1="Abonnement, fakturaer og betaling" col2="Betalings- og fakturaoplysninger opbevares som udgangspunkt i 5 år fra udgangen af det regnskabsår, materialet vedrører." />
                <DataRow col1="Community-indhold" col2="Kan slettes eller anonymiseres ved lukning af konto. I visse tilfælde kan indhold fortsat fremgå i anonymiseret form, hvis det er nødvendigt for community-sammenhængen." />
                <DataRow col1="Supporthenvendelser" col2="Opbevares så længe nødvendigt for at behandle henvendelsen og dokumentere forløbet." />
                <DataRow col1="Markedsføringssamtykke" col2="Opbevares indtil du trækker samtykket tilbage. Dokumentation for samtykke kan opbevares en periode for at dokumentere lovlig markedsføring." />
                <DataRow col1="Tekniske logs og sikkerhedsdata" col2="Opbevares kun så længe nødvendigt for drift, fejlfinding og sikkerhed. Kan opbevares længere ved konkret sikkerhedshændelse eller tvist." />
              </tbody>
            </table>
            <p style={{ marginTop: 16 }}>Sletning fra backup sker efter vores almindelige backup- og sikkerhedsprocedurer.</p>
          </section>

          {/* 10 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Markedsføring og servicebeskeder</h2>
            <p style={{ marginBottom: 12 }}>Vi kan sende servicebeskeder, der vedrører din konto, appen, betaling, abonnement, sikkerhed eller væsentlige ændringer i vilkår. Servicebeskeder er ikke markedsføring og er nødvendige for at levere tjenesten.</p>
            <p>Vi sender kun markedsføring, nyhedsbreve, tilbud eller lignende, hvis du har givet samtykke, eller hvis lovgivningen i øvrigt giver adgang til det. Du kan altid trække dit samtykke tilbage via afmeldingslink, appens indstillinger eller ved at kontakte os på <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>.</p>
          </section>

          {/* 11 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>11. Cookies, analyse og lignende teknologier</h2>
            <p style={{ marginBottom: 12 }}>Hvis vi bruger cookies, SDK'er eller lignende teknologier i appen eller på tilknyttede hjemmesider, sker det for at sikre funktionalitet, måle brug, analysere fejl, forbedre appen og – hvis du har givet samtykke – til markedsføringsformål.</p>
            <p>Hvor samtykke er påkrævet, indhenter vi det særskilt. Du kan normalt ændre dine valg i appens indstillinger, via cookieindstillinger på hjemmesiden eller i din enheds indstillinger.</p>
          </section>

          {/* 12 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>12. Sikkerhed</h2>
            <p style={{ marginBottom: 12 }}>Vi anvender tekniske og organisatoriske sikkerhedsforanstaltninger, der skal beskytte personoplysninger mod uautoriseret adgang, tab, ændring, offentliggørelse eller misbrug. Det omfatter bl.a. adgangsbegrænsning, løbende vedligeholdelse, leverandørstyring, databehandleraftaler og relevante sikkerhedsprocedurer.</p>
            <p>Du er selv ansvarlig for at holde dine loginoplysninger fortrolige og for at kontakte os, hvis du mistænker misbrug af din konto.</p>
          </section>

          {/* 13 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>13. Dine rettigheder</h2>
            <p style={{ marginBottom: 12 }}>Du har efter databeskyttelsesreglerne en række rettigheder. Rettighederne kan være begrænset i visse tilfælde, f.eks. hvis fortsat behandling er nødvendig for at overholde lovgivning eller fastlægge, gøre gældende eller forsvare et retskrav.</p>
            <ul style={{ marginTop: 16, marginBottom: 16, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Ret til indsigt i de personoplysninger, vi behandler om dig.</li>
              <li style={liStyle}>Ret til berigtigelse af urigtige eller ufuldstændige oplysninger.</li>
              <li style={liStyle}>Ret til sletning, når betingelserne for sletning er opfyldt.</li>
              <li style={liStyle}>Ret til begrænsning af behandling i visse situationer.</li>
              <li style={liStyle}>Ret til dataportabilitet for oplysninger, du selv har givet os, når behandlingen sker automatisk og er baseret på samtykke eller aftale.</li>
              <li style={liStyle}>Ret til at gøre indsigelse mod behandling baseret på vores legitime interesser.</li>
              <li style={{ color: '#5B3F2B' }}>Ret til at trække samtykke tilbage, uden at det påvirker lovligheden af den behandling, der er sket før tilbagetrækningen.</li>
            </ul>
            <p>Du kan udøve dine rettigheder ved at skrive til <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>. Vi kan bede om dokumentation for din identitet, hvis det er nødvendigt for at beskytte dine oplysninger.</p>
          </section>

          {/* 14 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>14. Klage til Datatilsynet</h2>
            <p style={{ marginBottom: 12 }}>Hvis du er utilfreds med vores behandling af dine personoplysninger, opfordrer vi dig til først at kontakte os, så vi kan forsøge at finde en løsning.</p>
            <p style={{ marginBottom: 12 }}>Du har også ret til at klage til Datatilsynet:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <InfoRow label="Adresse" value="Carl Jacobsens Vej 35, 2500 Valby" />
                <InfoRow label="Telefon" value="33 19 32 00" />
                <InfoRow label="E-mail" value={<a href="mailto:dt@datatilsynet.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>dt@datatilsynet.dk</a>} />
                <InfoRow label="Hjemmeside" value={<a href="https://www.datatilsynet.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }} target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>} />
              </tbody>
            </table>
          </section>

          {/* 15 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>15. Ændringer i privatlivspolitikken</h2>
            <p>Vi kan ændre denne privatlivspolitik, hvis vi ændrer appen, vores behandling af personoplysninger, leverandører eller juridiske krav. Ved væsentlige ændringer informerer vi dig via appen, e-mail eller anden relevant kommunikationskanal.</p>
          </section>

          {/* 16 */}
          <section>
            <h2 style={h2Style}>16. Kontakt</h2>
            <p style={{ marginBottom: 16 }}>Har du spørgsmål til privatlivspolitikken, vores behandling af personoplysninger eller dine rettigheder, kan du kontakte os her:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <InfoRow label="Virksomhed" value="LALATOTO of Denmark ApS" />
                <InfoRow label="Adresse" value="Kulbyvej 16, 4270 Høng" />
                <InfoRow label="Telefon" value="72 15 66 86" />
                <InfoRow label="E-mail" value={<a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a>} />
                <InfoRow label="CVR-nr." value="45 14 92 18" />
              </tbody>
            </table>
          </section>
        </div>
      </article>
    </div>
  );
}