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
    marginBottom: 56,
    paddingBottom: 40,
    borderBottom: '1px solid #EDE4DB'
  };

  const pStyle = { marginBottom: 12, color: '#5B3F2B', lineHeight: 1.75, fontSize: '0.95rem' };
  const liStyle = { marginBottom: 12, color: '#5B3F2B' };

  // Simple key-value info block (no table)
  const InfoBlock = ({ rows }) => (
    <div style={{ background: '#FFF8F3', border: '1px solid #EDE4DB', borderRadius: 12, padding: '20px 24px', marginTop: 16 }}>
      {rows.map(({ label, value }, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: i < rows.length - 1 ? 14 : 0 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B08D72', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</span>
          <span style={{ fontSize: '0.95rem', color: '#2B1F16' }}>{value}</span>
        </div>
      ))}
    </div>
  );

  // A labeled entry row for data lists
  const DataEntry = ({ title, text }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, color: '#2B1F16', fontSize: '0.92rem', marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#5B3F2B', fontSize: '0.92rem', lineHeight: 1.7 }}>{text}</div>
    </div>
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
            <p style={pStyle}>Politikken er tilpasset en digital app-tjeneste med abonnement. Appen leverer digitale funktioner og indhold, og der behandles derfor ikke leveringsoplysninger til fragtfirmaer i forbindelse med brug af appen.</p>
          </section>

          {/* 2 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Dataansvarlig</h2>
            <p style={pStyle}>Den dataansvarlige for behandlingen af dine personoplysninger er LALATOTO of Denmark ApS.</p>
            <InfoBlock rows={[
              { label: 'Virksomhed', value: 'LALATOTO of Denmark ApS' },
              { label: 'Adresse', value: 'Kulbyvej 16, 4270 Høng' },
              { label: 'CVR-nr.', value: '45 14 92 18' },
              { label: 'Telefon', value: '72 15 66 86' },
              { label: 'E-mail', value: <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a> },
            ]} />
            <p style={{ ...pStyle, marginTop: 16 }}>Spørgsmål om denne privatlivspolitik kan rettes til kundeservice@lalatoto.dk.</p>
          </section>

          {/* 3 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Hvilke oplysninger behandler vi?</h2>
            <p style={pStyle}>Vi behandler kun personoplysninger, der er relevante for at levere og forbedre appen, administrere dit abonnement, yde support og overholde gældende lovgivning.</p>
            <div style={{ marginTop: 20 }}>
              <DataEntry title="Konto- og kontaktoplysninger" text="Navn, e-mailadresse, telefonnummer hvis du oplyser det, loginoplysninger, bruger-ID og kontoindstillinger." />
              <DataEntry title="Abonnement og betaling" text="Abonnementsstatus, betalingshistorik, faktura- og kvitteringsoplysninger, Stripe-kunde-ID, betalingsmetode-type, transaktions-ID. LALATOTO opbevarer ikke fulde kortoplysninger." />
              <DataEntry title="App-profil og brugerindhold" text="Oplysninger du selv indtaster, f.eks. graviditetsuge, terminsdato, barnets fødselsdato/alder, søvnrelaterede oplysninger, præferencer, noter og gemt indhold." />
              <DataEntry title="Community-funktioner" text="Brugernavn, profiloplysninger, profilbillede hvis du uploader det, opslag, kommentarer, reaktioner, rapporteringer og moderationshistorik." />
              <DataEntry title="Ekspertbooking" text="Oplysninger om valgte eksperter, bookingtidspunkt, spørgsmål, beskeder, noter og de oplysninger, du selv vælger at dele." />
              <DataEntry title="Support og kommunikation" text="Henvendelser til kundeservice, e-mails, beskeder, telefonnoter, fejlbeskrivelser og opfølgningshistorik." />
              <DataEntry title="Tekniske oplysninger" text="IP-adresse, enhedstype, operativsystem, app-version, sprogindstilling, logdata, crash-rapporter og sikkerhedslogs." />
              <DataEntry title="Markedsføring" text="E-mailadresse, navn, samtykkestatus og præferencer – kun hvis du har givet samtykke til markedsføring." />
            </div>
          </section>

          {/* 4 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Formål og behandlingsgrundlag</h2>
            <p style={pStyle}>Vi behandler personoplysninger til nedenstående formål og på de angivne behandlingsgrundlag. Henvisningerne til GDPR er medtaget for at gøre behandlingen gennemsigtig.</p>
            <div style={{ marginTop: 20 }}>
              <DataEntry title="Drift af konto" text="At oprette, administrere og give adgang til din brugerprofil og appens funktioner. Grundlag: Art. 6(1)(b) – aftale." />
              <DataEntry title="Abonnement og betaling" text="At oprette abonnement, gennemføre betaling via Stripe, sende kvitteringer og håndtere betalingsfejl. Grundlag: Art. 6(1)(b) + (c)." />
              <DataEntry title="Indhold i appen" text="At vise relevant indhold om graviditet, babysøvn, udvikling og tigerspring baseret på dine indtastninger. Grundlag: Art. 6(1)(b), evt. 9(2)(a)." />
              <DataEntry title="Community" text="At gøre det muligt at oprette opslag, kommentere og moderere misbrug. Grundlag: Art. 6(1)(b) + (f)." />
              <DataEntry title="Ekspertbooking" text="At gennemføre booking og dele nødvendige oplysninger med den valgte ekspert. Grundlag: Art. 6(1)(b)." />
              <DataEntry title="Support" text="At besvare spørgsmål, løse tekniske problemer og dokumentere dialog. Grundlag: Art. 6(1)(b) + (f)." />
              <DataEntry title="Drift og sikkerhed" text="At beskytte appen mod misbrug, analysere fejl og forebygge svig. Grundlag: Art. 6(1)(f) – legitim interesse." />
              <DataEntry title="Markedsføring" text="At sende nyhedsbreve og tilbud, hvis du har givet samtykke. Grundlag: Art. 6(1)(a) – samtykke." />
              <DataEntry title="Lovgivning" text="At opfylde bogføringskrav og håndtere myndighedshenvendelser. Grundlag: Art. 6(1)(c) + (f)." />
            </div>
          </section>

          {/* 5 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Oplysninger om graviditet, børn og helbred</h2>
            <p style={pStyle}>LALATOTO-appen er rettet mod gravide og forældre. Det betyder, at nogle oplysninger, som du selv vælger at indtaste, kan handle om graviditet, barnets alder, søvn, trivsel eller udvikling.</p>
            <p style={pStyle}>Oplysninger om graviditet, helbred eller søvnproblemer kan i visse tilfælde være følsomme personoplysninger efter GDPR. Vi behandler kun sådanne oplysninger, hvis de er nødvendige for den funktion, du bruger, og der foreligger et gyldigt behandlingsgrundlag, typisk dit udtrykkelige samtykke.</p>
            <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Du vælger selv, hvilke oplysninger du indtaster i appen.</li>
              <li style={liStyle}>Du bør ikke dele følsomme oplysninger i community-funktioner, hvis du ikke ønsker, at andre brugere kan se dem.</li>
              <li style={liStyle}>Hvis du indtaster oplysninger om et barn, bekræfter du, at du er forælder, værge eller på anden måde har ret til at give oplysningerne.</li>
              <li style={liStyle}>Appen er ikke beregnet til, at børn selv opretter konto eller bruger tjenesten uden en voksen.</li>
            </ul>
          </section>

          {/* 6 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Betaling via Stripe</h2>
            <p style={pStyle}>Betalinger og abonnementsopkrævninger håndteres via Stripe. Stripe kan understøtte betaling med f.eks. Visa, Mastercard, MobilePay og Apple Pay, afhængigt af den aktuelle betalingsopsætning.</p>
            <p style={pStyle}>LALATOTO modtager og opbevarer ikke dine fulde kortoplysninger. Vi modtager alene de oplysninger, der er nødvendige for at se betalingsstatus, administrere abonnementet og bogføre transaktionen.</p>
            <p style={pStyle}>Stripe kan i visse tilfælde være selvstændigt dataansvarlig for dele af sin behandling, f.eks. i relation til svigforebyggelse og finansiel lovgivning. Stripe har egne privatlivsvilkår, som gælder for Stripes behandling.</p>
          </section>

          {/* 7 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Modtagere og databehandlere</h2>
            <p style={pStyle}>Vi sælger ikke dine personoplysninger til tredjemand. Vi videregiver eller overlader kun oplysninger, når det er nødvendigt for at levere appen, administrere abonnementet, yde support, overholde lovgivning eller beskytte vores rettigheder.</p>
            <ul style={{ marginTop: 16, marginBottom: 16, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Stripe til betalings- og abonnementsbehandling.</li>
              <li style={liStyle}>Hosting-, database- og cloudleverandører til drift af appen.</li>
              <li style={liStyle}>IT-, udviklings- og supportleverandører til vedligeholdelse, fejlretning og sikkerhed.</li>
              <li style={liStyle}>E-mail-, SMS- eller push-leverandører til servicebeskeder og eventuelle nyhedsbreve.</li>
              <li style={liStyle}>Analyse- og crash-reporting-værktøjer til statistik og forbedring af appen.</li>
              <li style={liStyle}>Eksterne eksperter, hvis du bruger ekspertbooking, kun i nødvendigt omfang.</li>
              <li style={liStyle}>Revisorer, bogføringssystemer, juridiske rådgivere og offentlige myndigheder, hvis lovpligtigt.</li>
              <li style={liStyle}>Andre brugere, hvis du selv publicerer opslag, kommentarer eller profiloplysninger i community.</li>
            </ul>
            <p style={pStyle}>Vi indgår databehandleraftaler med leverandører, der behandler personoplysninger på vores vegne.</p>
          </section>

          {/* 8 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Overførsel til lande uden for EU/EØS</h2>
            <p style={pStyle}>Nogle leverandører kan behandle eller tilgå personoplysninger fra lande uden for EU/EØS, herunder USA. Det kan f.eks. være relevant ved brug af internationale betalings-, cloud-, analyse- eller supportleverandører.</p>
            <p style={pStyle}>Hvis personoplysninger overføres til et land uden for EU/EØS, sikrer vi, at overførslen sker på et gyldigt overførselsgrundlag, f.eks. EU-Kommissionens standardkontraktbestemmelser, EU-U.S. Data Privacy Framework eller andre relevante garantier efter databeskyttelsesreglerne.</p>
          </section>

          {/* 9 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Opbevaring og sletning</h2>
            <p style={pStyle}>Vi opbevarer personoplysninger, så længe det er nødvendigt for de formål, oplysningerne er indsamlet til, eller så længe vi er forpligtet til det efter lovgivningen.</p>
            <div style={{ marginTop: 20 }}>
              <DataEntry title="Konto- og profiloplysninger" text="Opbevares så længe kontoen er aktiv. Slettes eller anonymiseres inden for rimelig tid ved kontosletning, medmindre der er lovligt grundlag for længere opbevaring." />
              <DataEntry title="Abonnement, fakturaer og betaling" text="Betalings- og fakturaoplysninger opbevares som udgangspunkt i 5 år fra udgangen af det regnskabsår, materialet vedrører." />
              <DataEntry title="Community-indhold" text="Kan slettes eller anonymiseres ved lukning af konto. I visse tilfælde kan indhold fortsat fremgå i anonymiseret form, hvis det er nødvendigt for community-sammenhængen." />
              <DataEntry title="Supporthenvendelser" text="Opbevares så længe nødvendigt for at behandle henvendelsen og dokumentere forløbet." />
              <DataEntry title="Markedsføringssamtykke" text="Opbevares indtil du trækker samtykket tilbage. Dokumentation for samtykke kan opbevares en periode for at dokumentere lovlig markedsføring." />
              <DataEntry title="Tekniske logs og sikkerhedsdata" text="Opbevares kun så længe nødvendigt for drift, fejlfinding og sikkerhed. Kan opbevares længere ved konkret sikkerhedshændelse eller tvist." />
            </div>
            <p style={{ ...pStyle, marginTop: 8 }}>Sletning fra backup sker efter vores almindelige backup- og sikkerhedsprocedurer.</p>
          </section>

          {/* 10 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Markedsføring og servicebeskeder</h2>
            <p style={pStyle}>Vi kan sende servicebeskeder, der vedrører din konto, appen, betaling, abonnement, sikkerhed eller væsentlige ændringer i vilkår. Servicebeskeder er ikke markedsføring og er nødvendige for at levere tjenesten.</p>
            <p style={pStyle}>Vi sender kun markedsføring, nyhedsbreve, tilbud eller lignende, hvis du har givet samtykke, eller hvis lovgivningen i øvrigt giver adgang til det. Du kan altid trække dit samtykke tilbage via afmeldingslink, appens indstillinger eller ved at kontakte os på <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>.</p>
          </section>

          {/* 11 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>11. Cookies, analyse og lignende teknologier</h2>
            <p style={pStyle}>Hvis vi bruger cookies, SDK'er eller lignende teknologier i appen eller på tilknyttede hjemmesider, sker det for at sikre funktionalitet, måle brug, analysere fejl, forbedre appen og – hvis du har givet samtykke – til markedsføringsformål.</p>
            <p style={pStyle}>Hvor samtykke er påkrævet, indhenter vi det særskilt. Du kan normalt ændre dine valg i appens indstillinger, via cookieindstillinger på hjemmesiden eller i din enheds indstillinger.</p>
          </section>

          {/* 12 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>12. Sikkerhed</h2>
            <p style={pStyle}>Vi anvender tekniske og organisatoriske sikkerhedsforanstaltninger, der skal beskytte personoplysninger mod uautoriseret adgang, tab, ændring, offentliggørelse eller misbrug. Det omfatter bl.a. adgangsbegrænsning, løbende vedligeholdelse, leverandørstyring, databehandleraftaler og relevante sikkerhedsprocedurer.</p>
            <p style={pStyle}>Du er selv ansvarlig for at holde dine loginoplysninger fortrolige og for at kontakte os, hvis du mistænker misbrug af din konto.</p>
          </section>

          {/* 13 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>13. Dine rettigheder</h2>
            <p style={pStyle}>Du har efter databeskyttelsesreglerne en række rettigheder. Rettighederne kan være begrænset i visse tilfælde, f.eks. hvis fortsat behandling er nødvendig for at overholde lovgivning eller fastlægge, gøre gældende eller forsvare et retskrav.</p>
            <ul style={{ marginTop: 16, marginBottom: 16, paddingLeft: 24, listStyleType: 'disc' }}>
              <li style={liStyle}>Ret til indsigt i de personoplysninger, vi behandler om dig.</li>
              <li style={liStyle}>Ret til berigtigelse af urigtige eller ufuldstændige oplysninger.</li>
              <li style={liStyle}>Ret til sletning, når betingelserne for sletning er opfyldt.</li>
              <li style={liStyle}>Ret til begrænsning af behandling i visse situationer.</li>
              <li style={liStyle}>Ret til dataportabilitet for oplysninger, du selv har givet os, når behandlingen sker automatisk og er baseret på samtykke eller aftale.</li>
              <li style={liStyle}>Ret til at gøre indsigelse mod behandling baseret på vores legitime interesser.</li>
              <li style={liStyle}>Ret til at trække samtykke tilbage, uden at det påvirker lovligheden af den behandling, der er sket før tilbagetrækningen.</li>
            </ul>
            <p style={pStyle}>Du kan udøve dine rettigheder ved at skrive til <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none' }}>kundeservice@lalatoto.dk</a>. Vi kan bede om dokumentation for din identitet, hvis det er nødvendigt for at beskytte dine oplysninger.</p>
          </section>

          {/* 14 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>14. Klage til Datatilsynet</h2>
            <p style={pStyle}>Hvis du er utilfreds med vores behandling af dine personoplysninger, opfordrer vi dig til først at kontakte os, så vi kan forsøge at finde en løsning.</p>
            <p style={pStyle}>Du har også ret til at klage til Datatilsynet:</p>
            <InfoBlock rows={[
              { label: 'Adresse', value: 'Carl Jacobsens Vej 35, 2500 Valby' },
              { label: 'Telefon', value: '33 19 32 00' },
              { label: 'E-mail', value: <a href="mailto:dt@datatilsynet.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>dt@datatilsynet.dk</a> },
              { label: 'Hjemmeside', value: <a href="https://www.datatilsynet.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }} target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a> },
            ]} />
          </section>

          {/* 15 */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>15. Ændringer i privatlivspolitikken</h2>
            <p style={pStyle}>Vi kan ændre denne privatlivspolitik, hvis vi ændrer appen, vores behandling af personoplysninger, leverandører eller juridiske krav. Ved væsentlige ændringer informerer vi dig via appen, e-mail eller anden relevant kommunikationskanal.</p>
          </section>

          {/* 16 */}
          <section>
            <h2 style={h2Style}>16. Kontakt</h2>
            <p style={pStyle}>Har du spørgsmål til privatlivspolitikken, vores behandling af personoplysninger eller dine rettigheder, kan du kontakte os her:</p>
            <InfoBlock rows={[
              { label: 'Virksomhed', value: 'LALATOTO of Denmark ApS' },
              { label: 'Adresse', value: 'Kulbyvej 16, 4270 Høng' },
              { label: 'Telefon', value: '72 15 66 86' },
              { label: 'E-mail', value: <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a> },
              { label: 'CVR-nr.', value: '45 14 92 18' },
            ]} />
          </section>
        </div>
      </article>
    </div>
  );
}