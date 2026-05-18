import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    number: '01',
    title: 'Generelt',
    content: (
      <>
        <p>Denne privatlivspolitik forklarer, hvordan LALATOTO of Denmark ApS behandler personoplysninger, når du opretter bruger, bruger LALATOTO-appen, køber eller administrerer abonnement, anvender community-funktioner, booker eksperter eller kontakter vores kundeservice.</p>
        <p style={{ marginTop: 16 }}>Politikken er tilpasset en digital app-tjeneste med abonnement. Appen leverer digitale funktioner og indhold, og der behandles derfor ikke leveringsoplysninger til fragtfirmaer i forbindelse med brug af appen.</p>
      </>
    )
  },
  {
    number: '02',
    title: 'Dataansvarlig',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Den dataansvarlige for behandlingen af dine personoplysninger er LALATOTO of Denmark ApS.</p>
        <div style={{
          background: 'linear-gradient(135deg, #F3E9E1, #EDE4DB)',
          borderRadius: 12,
          padding: '20px 24px',
          marginTop: 16
        }}>
          <p style={{ fontWeight: 600, marginBottom: 12, color: '#2B1F16' }}>LALATOTO of Denmark ApS</p>
          {[
            ['Adresse', 'Kulbyvej 16, 4270 Høng'],
            ['CVR-nr.', '45 14 92 18'],
            ['Telefon', '72 15 66 86'],
            ['E-mail', 'kundeservice@lalatoto.dk'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: '0.9rem' }}>
              <span style={{ color: '#7A665A', minWidth: 70 }}>{k}</span>
              <span style={{ color: '#2B1F16' }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>Spørgsmål kan rettes til <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a>.</p>
      </>
    )
  },
  {
    number: '03',
    title: 'Hvilke oplysninger behandler vi?',
    content: (
      <>
        <p style={{ marginBottom: 20 }}>Vi behandler kun personoplysninger, der er relevante for at levere og forbedre appen, administrere dit abonnement, yde support og overholde gældende lovgivning.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Konto- og kontaktoplysninger', 'Navn, e-mailadresse, telefonnummer, loginoplysninger, bruger-ID og kontoindstillinger.'],
            ['Abonnement og betaling', 'Abonnementsstatus, betalingshistorik, Stripe-kunde-ID, betalingsmetode-type og transaktions-ID. LALATOTO opbevarer ikke fulde kortoplysninger.'],
            ['App-profil og brugerindhold', 'Graviditetsuge, terminsdato, barnets fødselsdato/alder, søvnrelaterede oplysninger, præferencer og noter.'],
            ['Community-funktioner', 'Brugernavn, profilbillede, opslag, kommentarer, reaktioner og moderationshistorik.'],
            ['Ekspertbooking', 'Valgte eksperter, bookingtidspunkt, spørgsmål, beskeder og noter.'],
            ['Support og kommunikation', 'Henvendelser til kundeservice, e-mails og fejlbeskrivelser.'],
            ['Tekniske oplysninger', 'IP-adresse, enhedstype, operativsystem, app-version og logdata.'],
            ['Markedsføring', 'E-mailadresse, samtykkestatus og præferencer (kun ved samtykke).'],
          ].map(([cat, desc], i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 16,
              padding: '14px 18px',
              background: i % 2 === 0 ? 'rgba(243,233,225,0.4)' : 'transparent',
              borderRadius: 8,
              alignItems: 'start'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2B1F16' }}>{cat}</span>
              <span style={{ fontSize: '0.9rem', color: '#5B3F2B' }}>{desc}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    number: '04',
    title: 'Formål og behandlingsgrundlag',
    content: (
      <>
        <p style={{ marginBottom: 20 }}>Vi behandler personoplysninger til nedenstående formål og på de angivne behandlingsgrundlag.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Oprettelse og drift af konto', 'Oprette og give adgang til brugerprofil og funktioner.', 'Art. 6(1)(b) – aftale'],
            ['Abonnement og betaling', 'Oprette abonnement, gennemføre betaling via Stripe og håndtere kvitteringer.', 'Art. 6(1)(b) + (c)'],
            ['Personligt indhold', 'Vise relevant indhold om graviditet, babysøvn og tigerspring.', 'Art. 6(1)(b) + evt. 9(2)(a)'],
            ['Community', 'Oprette opslag, kommentere og moderere misbrug.', 'Art. 6(1)(b) + (f)'],
            ['Ekspertbooking', 'Gennemføre booking og dele oplysninger med valgt ekspert.', 'Art. 6(1)(b)'],
            ['Support', 'Besvare spørgsmål og dokumentere dialog.', 'Art. 6(1)(b) + (f)'],
            ['Drift og sikkerhed', 'Beskytte appen mod misbrug og analysere fejl.', 'Art. 6(1)(f) – legitim interesse'],
            ['Markedsføring', 'Sende nyhedsbreve og tilbud ved samtykke.', 'Art. 6(1)(a) – samtykke'],
            ['Lovgivning', 'Opfylde bogføringskrav og myndighedshenvendelser.', 'Art. 6(1)(c) + (f)'],
          ].map(([formaal, besk, grundlag], i) => (
            <div key={i} style={{
              padding: '14px 18px',
              background: i % 2 === 0 ? 'rgba(243,233,225,0.4)' : 'transparent',
              borderRadius: 8,
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 16,
              alignItems: 'start'
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2B1F16', marginBottom: 4 }}>{formaal}</p>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(194,154,115,0.15)',
                  color: '#7A4F2A',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontWeight: 500
                }}>{grundlag}</span>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#5B3F2B' }}>{besk}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    number: '05',
    title: 'Oplysninger om graviditet, børn og helbred',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>LALATOTO-appen er rettet mod gravide og forældre. Oplysninger om graviditet, helbred eller søvnproblemer kan i visse tilfælde være følsomme personoplysninger efter GDPR. Vi behandler kun sådanne oplysninger, hvis de er nødvendige, og der foreligger et gyldigt grundlag.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {[
            'Du vælger selv, hvilke oplysninger du indtaster i appen.',
            'Du bør ikke dele følsomme oplysninger i community-funktioner, hvis du ikke ønsker, at andre brugere kan se dem.',
            'Hvis du indtaster oplysninger om et barn, bekræfter du, at du er forælder, værge eller har ret til at give oplysningerne.',
            'Appen er ikke beregnet til, at børn selv opretter konto eller bruger tjenesten uden en voksen.',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#C29A73',
                marginTop: 7, flexShrink: 0
              }} />
              <p style={{ fontSize: '0.9rem', color: '#5B3F2B', lineHeight: 1.7 }}>{item}</p>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    number: '06',
    title: 'Betaling via Stripe',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Betalinger og abonnementsopkrævninger håndteres via Stripe. Stripe kan understøtte betaling med Visa, Mastercard, MobilePay og Apple Pay, afhængigt af den aktuelle opsætning.</p>
        <p style={{ marginBottom: 16 }}>LALATOTO modtager og opbevarer ikke dine fulde kortoplysninger. Vi modtager alene de oplysninger, der er nødvendige for at se betalingsstatus, administrere abonnementet og bogføre transaktionen.</p>
        <p>Stripe kan i visse tilfælde være selvstændigt dataansvarlig for dele af sin behandling. Stripe har egne privatlivsvilkår, som gælder for Stripes behandling.</p>
      </>
    )
  },
  {
    number: '07',
    title: 'Modtagere og databehandlere',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Vi sælger ikke dine personoplysninger. Vi videregiver kun oplysninger, når det er nødvendigt for at levere appen, overholde lovgivning eller beskytte vores rettigheder.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {[
            'Stripe til betalings- og abonnementsbehandling.',
            'Hosting-, database- og cloudleverandører til drift af appen.',
            'IT-, udviklings- og supportleverandører til vedligeholdelse og sikkerhed.',
            'E-mail-, SMS- eller push-leverandører til servicebeskeder.',
            'Analyse- og crash-reporting-værktøjer til statistik og forbedring af appen.',
            'Eksterne eksperter ved ekspertbooking, kun i nødvendigt omfang.',
            'Revisorer, juridiske rådgivere og offentlige myndigheder hvis lovpligtigt.',
            'Andre brugere, hvis du publicerer opslag eller indhold i community.',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#C29A73',
                marginTop: 7, flexShrink: 0
              }} />
              <p style={{ fontSize: '0.9rem', color: '#5B3F2B', lineHeight: 1.7 }}>{item}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>Vi indgår databehandleraftaler med alle leverandører, der behandler personoplysninger på vores vegne.</p>
      </>
    )
  },
  {
    number: '08',
    title: 'Overførsel til lande uden for EU/EØS',
    content: (
      <p>Nogle leverandører kan behandle personoplysninger fra lande uden for EU/EØS, herunder USA. Vi sikrer altid, at overførslen sker på et gyldigt grundlag, f.eks. EU-Kommissionens standardkontraktbestemmelser, EU-U.S. Data Privacy Framework eller andre relevante garantier efter databeskyttelsesreglerne.</p>
    )
  },
  {
    number: '09',
    title: 'Opbevaring og sletning',
    content: (
      <>
        <p style={{ marginBottom: 20 }}>Vi opbevarer personoplysninger, så længe det er nødvendigt for formålet, eller vi er forpligtet til det efter lovgivningen.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Konto- og profiloplysninger', 'Opbevares så længe kontoen er aktiv. Slettes/anonymiseres inden for rimelig tid efter kontosletning.'],
            ['Abonnement, fakturaer og betaling', '5 år fra udgangen af det regnskabsår, materialet vedrører (bogføringsloven).'],
            ['Community-indhold', 'Kan slettes ved kontolukning. I visse tilfælde bibeholdes i anonymiseret form.'],
            ['Supporthenvendelser', 'Opbevares så længe nødvendigt for at behandle henvendelsen og dokumentere forløbet.'],
            ['Markedsføringssamtykke', 'Indtil samtykket trækkes tilbage.'],
            ['Tekniske logs', 'Kun så længe nødvendigt for drift og sikkerhed.'],
          ].map(([type, opl], i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 16,
              padding: '14px 18px',
              background: i % 2 === 0 ? 'rgba(243,233,225,0.4)' : 'transparent',
              borderRadius: 8,
              alignItems: 'start'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2B1F16' }}>{type}</span>
              <span style={{ fontSize: '0.9rem', color: '#5B3F2B' }}>{opl}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    number: '10',
    title: 'Markedsføring og servicebeskeder',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Vi kan sende servicebeskeder om din konto, betaling eller væsentlige ændringer. Servicebeskeder er ikke markedsføring og er nødvendige for at levere tjenesten.</p>
        <p>Vi sender kun markedsføring, nyhedsbreve eller tilbud, hvis du har givet samtykke. Du kan altid trække dit samtykke tilbage via afmeldingslink, appens indstillinger eller ved at skrive til <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a>.</p>
      </>
    )
  },
  {
    number: '11',
    title: 'Cookies, analyse og lignende teknologier',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Hvis vi bruger cookies, SDK'er eller lignende teknologier, sker det for at sikre funktionalitet, måle brug, analysere fejl, forbedre appen og – ved samtykke – til markedsføringsformål.</p>
        <p>Hvor samtykke er påkrævet, indhenter vi det særskilt. Du kan ændre dine valg i appens indstillinger eller din enheds indstillinger.</p>
      </>
    )
  },
  {
    number: '12',
    title: 'Sikkerhed',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Vi anvender tekniske og organisatoriske sikkerhedsforanstaltninger mod uautoriseret adgang, tab, ændring eller misbrug. Det omfatter adgangsbegrænsning, løbende vedligeholdelse, leverandørstyring og databehandleraftaler.</p>
        <p>Du er selv ansvarlig for at holde dine loginoplysninger fortrolige og for at kontakte os, hvis du mistænker misbrug.</p>
      </>
    )
  },
  {
    number: '13',
    title: 'Dine rettigheder',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Du har efter databeskyttelsesreglerne en række rettigheder. De kan være begrænset, f.eks. hvis behandling er nødvendig for at overholde lovgivning.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {[
            ['Indsigt', 'Ret til indsigt i de personoplysninger, vi behandler om dig.'],
            ['Berigtigelse', 'Ret til at få rettet urigtige eller ufuldstændige oplysninger.'],
            ['Sletning', 'Ret til sletning, når betingelserne er opfyldt.'],
            ['Begrænsning', 'Ret til begrænsning af behandling i visse situationer.'],
            ['Dataportabilitet', 'Ret til at få dine data udleveret i et struktureret format.'],
            ['Indsigelse', 'Ret til at gøre indsigelse mod behandling baseret på legitime interesser.'],
            ['Tilbagetrækning', 'Ret til at trække samtykke tilbage uden fremadrettet virkning.'],
          ].map(([ret, besk], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 6 ? '1px solid #EDE4DB' : 'none' }}>
              <span style={{
                background: 'rgba(194,154,115,0.15)',
                color: '#7A4F2A',
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: 20,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
                marginTop: 2
              }}>{ret}</span>
              <p style={{ fontSize: '0.9rem', color: '#5B3F2B', lineHeight: 1.7 }}>{besk}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20 }}>Skriv til <a href="mailto:kundeservice@lalatoto.dk" style={{ color: '#C29A73', textDecoration: 'none', fontWeight: 500 }}>kundeservice@lalatoto.dk</a> for at udøve dine rettigheder.</p>
      </>
    )
  },
  {
    number: '14',
    title: 'Klage til Datatilsynet',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Hvis du er utilfreds med vores behandling, opfordrer vi dig til først at kontakte os. Du har også ret til at klage til Datatilsynet:</p>
        <div style={{
          background: 'linear-gradient(135deg, #F3E9E1, #EDE4DB)',
          borderRadius: 12,
          padding: '20px 24px',
          marginTop: 8
        }}>
          {[
            ['Adresse', 'Carl Jacobsens Vej 35, 2500 Valby'],
            ['Telefon', '33 19 32 00'],
            ['E-mail', 'dt@datatilsynet.dk'],
            ['Hjemmeside', 'www.datatilsynet.dk'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: '0.9rem' }}>
              <span style={{ color: '#7A665A', minWidth: 80 }}>{k}</span>
              <span style={{ color: '#2B1F16' }}>{v}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    number: '15',
    title: 'Ændringer i privatlivspolitikken',
    content: (
      <p>Vi kan ændre denne privatlivspolitik, hvis vi ændrer appen, vores databehandling, leverandører eller juridiske krav. Ved væsentlige ændringer informerer vi dig via appen, e-mail eller anden relevant kanal.</p>
    )
  },
  {
    number: '16',
    title: 'Kontakt',
    content: (
      <>
        <p style={{ marginBottom: 16 }}>Har du spørgsmål til privatlivspolitikken, vores behandling af personoplysninger eller dine rettigheder, kan du kontakte os her:</p>
        <div style={{
          background: 'linear-gradient(135deg, #F3E9E1, #EDE4DB)',
          borderRadius: 12,
          padding: '20px 24px',
          marginTop: 8
        }}>
          <p style={{ fontWeight: 600, marginBottom: 12, color: '#2B1F16' }}>LALATOTO of Denmark ApS</p>
          {[
            ['Adresse', 'Kulbyvej 16, 4270 Høng'],
            ['Telefon', '72 15 66 86'],
            ['E-mail', 'kundeservice@lalatoto.dk'],
            ['CVR-nr.', '45 14 92 18'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: '0.9rem' }}>
              <span style={{ color: '#7A665A', minWidth: 70 }}>{k}</span>
              <span style={{ color: '#2B1F16' }}>{v}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      border: '1px solid #EDE4DB',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
      background: 'var(--color-bg-card, #FFFDF9)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '0.85rem',
          color: '#C29A73',
          fontWeight: 500,
          minWidth: 28,
          letterSpacing: '0.05em'
        }}>{section.number}</span>
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '1.25rem',
          fontWeight: 400,
          color: 'var(--color-text-primary, #2B1F16)',
          flex: 1,
          letterSpacing: '-0.01em'
        }}>{section.title}</span>
        <span style={{ color: '#C29A73', flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 24px 24px',
          color: 'var(--color-text-secondary, #5B3F2B)',
          lineHeight: 1.8,
          fontSize: '0.92rem',
          borderTop: '1px solid #EDE4DB',
          paddingTop: 20,
        }}>
          {section.content}
        </div>
      )}
    </div>
  );
}

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg, #FAF6F1)',
      color: 'var(--color-text-primary, #2B1F16)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-nav-bg, #FFF8F3)',
        borderBottom: '1px solid var(--color-divider, #EDE4DB)',
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
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--color-primary, #5B3F2B)', fontSize: '0.9rem', fontWeight: 500
          }}
        >
          <ChevronLeft size={20} /> Tilbage
        </button>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #F3E9E1 0%, #FAF6F1 60%)',
        padding: '48px 24px 40px',
        textAlign: 'center',
        borderBottom: '1px solid #EDE4DB'
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'rgba(194,154,115,0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Shield size={26} color="#C29A73" />
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(2rem, 6vw, 2.8rem)',
          fontWeight: 300,
          marginBottom: 10,
          color: '#2B1F16',
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          Privatlivspolitik
        </h1>
        <p style={{ color: '#7A665A', fontSize: '0.9rem', marginBottom: 4 }}>
          for LALATOTO-appen
        </p>
        <p style={{ color: '#C29A73', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em' }}>
          SENEST OPDATERET 25. APRIL 2026
        </p>
      </div>

      {/* Content */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 64px' }}>
        {sections.map((s) => (
          <Section key={s.number} section={s} />
        ))}
      </article>
    </div>
  );
}