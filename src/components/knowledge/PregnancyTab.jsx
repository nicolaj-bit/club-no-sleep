import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronUp, Baby, Heart, Sparkles } from 'lucide-react';
import { differenceInDays } from 'date-fns';

// Uge-for-uge data inspireret af Politikens Graviditetsbog af Lene Skou Jensen
const PREGNANCY_WEEKS = {
  4:  { baby: "Fosteret er på størrelse med et valmuefrø. Cellerne deler sig intenst og de første grundlæggende strukturer dannes – hjernen, rygraden og hjertet begynder at tage form.", mom: "Du er måske ikke klar over, at du er gravid endnu. Nogle mærker en let træthed eller ømme bryster. Hormonniveauet stiger markant.", tip: "Tag din første folinsyre-tablet hvis du ikke allerede gør det – det beskytter mod neuralrørsdefekter." },
  5:  { baby: "Fosteret er nu ca. 2 mm og ligner en lille tudse. Hjertet begynder at slå – ca. 100 gange i minuttet! Hjernen, øjnene og ørerne er under udvikling.", mom: "Kvalme kan begynde at melde sig, særligt om morgenen. Brysterne kan føles tunge og ømme. Du producerer nu markant mere blod.", tip: "Spis små, hyppige måltider for at holde kvalmen i skak. Ingefærtabletter eller -te kan hjælpe." },
  6:  { baby: "Fosteret er ca. 4-6 mm. Ansigtsstrukturer dannes – øjengruber, næse og mund er synlige. Arme og ben begynder at spire frem som små knopper.", mom: "Kvalme og træthed er nu almindelige. Mange oplever stærke lugtafvigelser. Hyppig vandladning kan starte.", tip: "Hvil dig så meget du kan – kroppen arbejder intenst på at danne et nyt liv." },
  7:  { baby: "Ca. 10 mm. Hjertet slår nu 160 gange i minuttet. Hjernen vokser hurtigt – der dannes 100 nye hjerneceller pr. minut. Hænder og fødder har nu synlige 'finner'.", mom: "Hormonerne er på sit højeste, og mange oplever dette som den hårdeste periode. Spyt kan tiltagere. Brysterne vokser.", tip: "Fortæl din jordmoder om dine symptomer. Svær kvalme (hyperemesis) kan behandles." },
  8:  { baby: "Ca. 16 mm – på størrelse med et hindbær. Alle indre organer er anlagt. Øjnene er nu dækket af øjenlåg. Fingers og tæers form er tydelig.", mom: "Livmoderen er nu dobbelt så stor. Du kan føle dig oppustet. Hovedpine er almindeligt pga. hormonændringer.", tip: "Drik rigeligt vand – minimum 2 liter dagligt. Undgå kaffe og te med koffein." },
  9:  { baby: "Ca. 23 mm. Fosteret begynder at bevæge sig, selvom du endnu ikke kan mærke det. Tænder begynder at dannes under tandkødet. Musklerne modnes.", mom: "Træthed er stadig meget udtalt. Mange mærker uro i benene om natten. Bugspytkirtelens funktion ændres.", tip: "Let motion som gåture kan faktisk mindske træthed og kvalme. Prøv 20 min. dagligt." },
  10: { baby: "Ca. 31 mm. Alle vitale organer er dannet – nu begynder de at modnes. Knoglerne begynder at hærde. Fosteret kan bøje arme og ben.", mom: "For mange begynder kvalmen langsomt at aftage. Hormonniveauet stabiliserer sig lidt. Livmoderen er nu på størrelse med en appelsin.", tip: "Det er en god tid at fortælle din arbejdsgiver om graviditeten, så du kan få tilpasset arbejdsvilkårene." },
  11: { baby: "Ca. 41 mm. Fosteret kan nu synke. Ansigtet ser mere menneskeligt ud. Ydre kønsorganer begynder at differentiere sig, men er endnu ikke synlige på scanning.", mom: "Første trimester nærmer sig sin afslutning. Energien kan langsomt vende tilbage. Livmoderen rager op over skambenets kant.", tip: "Planlæg din 1. trimester-scanning (uge 11-14) hvis du ikke allerede har det – det er nu muligt at se om der er ét eller to fostre." },
  12: { baby: "Ca. 53 mm – på størrelse med en blomme. Fingrene har nu fingeraftryk. Fosteret kan gribe, og reflekserne udvikles. Nyrerne producerer urin.", mom: "Mange oplever et energiboost nu. Risikoen for spontan abort falder markant. Maven begynder måske at vise sig lidt.", tip: "Nu er et godt tidspunkt at fortælle venner og familie din gode nyhed." },
  13: { baby: "Ca. 65 mm. Andet trimester begynder. Stemme-båndet anlægges. Fosteret kan åbne munden og bevæge tungen. Tarmen er nu i bughulen.", mom: "Andet trimester starter – for mange den behageligste periode. Kvalme aftager, og energien vender tilbage. Libido kan stige.", tip: "Begynd at bruge fugtighedscreme på maven, lår og bryster for at forebygge strækmærker." },
  14: { baby: "Ca. 80 mm. Fingrene er fuldt udviklede med negle. Urinstof produceres. Fosseret kan frown og smile – dog ikke bevidst endnu.", mom: "Livmoderen mærkes tydeligt over skambenet. Rundligamentssmerter (sting i siderne) er normale. Huden kan blive mere mørk på steder.", tip: "Bækkenbundøvelser er vigtige nu – de forebygger inkontinens og støtter graviditeten." },
  15: { baby: "Ca. 10 cm. Hår begynder at gro på hovedet. Øjnene kan bevæge sig, men øjenlågene er lukkede. Fosteret er yderst aktivt og bevæger sig konstant.", mom: "Du kan begynde at mærke lette bevægelser – 'sommerfugle' eller 'luftbobler'. Maven er nu synlig.", tip: "Sov gerne på siden (helst venstre) fra nu af – det giver optimal blodgennemstrømning til fosteret." },
  16: { baby: "Ca. 11,6 cm og vejer ca. 100 g. Hørelsen udvikles – fosteret kan høre din stemme og hjerteslag. Øjnene kan opfange lys.", mom: "Anden-trimester-glæden er fuldt ud mærkbar. De fleste er nu fri for kvalme. Maven er tydeligt synlig. En mørk linje (linea nigra) kan dukke op på maven.", tip: "Tal og syng til din baby – de kan høre dig! Det styrker den tidlige tilknytning." },
  17: { baby: "Ca. 13 cm. Fedt begynder at aflejres under huden. Fingrene og tæernes knogler hærder. Immunsystemet modnes.", mom: "Ryggen kan begynde at gøre ondt. Ankler og fødder kan svulme let op. Næseblod og tilstoppet næse er almindeligt.", tip: "En svømmetur eller vandgymnastik aflaster ryggen og er skånsom motion under graviditeten." },
  18: { baby: "Ca. 14,2 cm, vejer 190 g. Myelin dannes om nerverne – hastigheden i nervesignaler øges. Fosteret kan gabe og strække sig.", mom: "Bevægelserne er nu tydelige hos de fleste. Hud, hår og negle vokser hurtigt. Tandkødene kan bløde let.", tip: "Gå til tandlægen – graviditetshormoner kan fremkalde tandkødsbetændelse. Kontrol er gratis under graviditeten." },
  19: { baby: "Ca. 15,3 cm. En hvid fedtagtig substans (vernix) begynder at dække kroppen for beskyttelse i fostervandet. Sansecentrene i hjernen modnes.", mom: "Du er midt i graviditeten. Maven er nu godt synlig. Mange oplever 'graviditetshukommelse' – et reelt fænomen!", tip: "Sørg for at få nok jern – rødt kød, bønner og grønne bladgrøntsager er gode kilder." },
  20: { baby: "Ca. 16,4 cm og vejer ca. 300 g. HALVVEJS! Føtternes fodsåler er dannet. Brusk hærder til knogler. Sveddannelse begynder.", mom: "Halvvejen er nået – tillykke! Maveknapper kan poppe ud. Søvnkvaliteten begynder at blive påvirket.", tip: "Din store scanning (morfologisk scanning) foregår typisk i uge 18-22. Husk at booke tid!" },
  21: { baby: "Ca. 26,7 cm (fra hoved til fod). Smagssansen udviklles – fosteret synker fostervand og kan smage hvad du spiser.", mom: "Mange oplever uro i benene og kramper i lægge om natten. Strækmærker kan begynde at dukke op.", tip: "Magnesium kan hjælpe mod benspasmer. Tal med din jordemoder om tilskud." },
  22: { baby: "Ca. 27,8 cm. Øjenbryn og øjenvifter er synlige. Greberefleksen er stærk. Lille fingeraftryk er fuldstændigt unikt.", mom: "Livmoderen når nu navlen. Hæmorider kan opstå. Blodtrykket er som regel lavt i dette trimester.", tip: "Undgå at stå op for hurtigt – lavt blodtryk kan give svimmelhed. Rejs dig langsomt." },
  23: { baby: "Ca. 28,9 cm. Lungerne producerer surfaktant – det stof, der gør det muligt at trække vejret efter fødslen. Øjenlågene kan åbne sig.", mom: "Maven er nu godt fremtrædende. Svangerskabsbetinget diabetes testes typisk nu (glukosebelastningstest).", tip: "Øv vejrtrækningsøvelser – de hjælper til at slappe af under veer og fødsel." },
  24: { baby: "Ca. 30 cm, vejer ca. 600 g. Hjernen vokser nu meget hurtigt. En præmaturfødt baby i denne uge har en vis overlevelseschance med intensiv behandling.", mom: "Rygsmerter er meget almindelige. Mavesvie og halsbrand opstår pga. livmoderens tryk på mavesæk.", tip: "Spis lille og ofte. Undgå at ligge ned umiddelbart efter et måltid – dette reducerer halsbrand." },
  25: { baby: "Ca. 34,6 cm. Fingrene er nu så udviklede, at de kan gribe om navlestrengen. Smertesansen er aktiv.", mom: "Åndenød kan opstå. Huden på maven kan klø. Søvnbesvær er meget almindeligt nu.", tip: "En graviditetspude kan hjælpe med at finde en behagelig sovestilling. Sov på venstre side." },
  26: { baby: "Ca. 35,6 cm og vejer ca. 760 g. Øjnene er nu fuldt åbne. Immunstoffer fra dig overføres til barnet via moderkagen.", mom: "Tredje trimester begynder snart. Bekkensmerter (symfyseløsning) kan opstå. Hyppig vandladning vender tilbage.", tip: "Bækkenbelte kan give god lindring ved bækkensmerter. Tal med din jordemoder." },
  27: { baby: "Ca. 36,6 cm. Hjernen kan nu drømme – REM-søvn er observeret. Smags- og lugtesansen er i fuld funktion.", mom: "Tredje trimester begynder! Braxton Hicks-sammentrækninger (øvelsessammentrækninger) kan begynde. Energien kan aftage.", tip: "Begynd at planlægge barselsorlov og praktiske ting hjemme – det reducerer stress." },
  28: { baby: "Ca. 37,6 cm, vejer ca. 1 kg. Lungerne er næsten modne. Barnets position begynder at have betydning. Øjenlågene kan blinke.", mom: "Du kan opleve hævede ben og ankler særligt om aftenen. Søvn bliver mere besværlig.", tip: "Sæt benene op når du sidder ned – det reducerer hævelse. Undgå stramt tøj om benene." },
  29: { baby: "Ca. 38,6 cm. Fedtdepoterne bygges op under huden. Knoglerne er fuldt udviklede men bløde og bøjelige. Håret vokser.", mom: "Kortåndethed er almindelig da livmoderen presser mod mellemgulvet. Forstoppelse kan forværres.", tip: "Spis fiberrig mad og drik rigeligt. Et let aftenwalk kan hjælpe fordøjelsen." },
  30: { baby: "Ca. 39,9 cm, vejer ca. 1,3 kg. Hjernen danner bugtninger og folder. Termostaten begynder at fungere – barnet regulerer sin egen temperatur.", mom: "Lændesmerter er meget normale. Fosterbevægelserne er stærke og tydeligt synlige. Søvnkvaliteten er dårlig.", tip: "Mærk barnets bevægelser dagligt – der bør være mindst 10 bevægelser over 2 timer." },
  31: { baby: "Ca. 41,1 cm, vejer ca. 1,5 kg. Al sanseudvikling er komplet. Øjet kan skelne lys fra mørke. Barnet er nu meget aktivt.", mom: "Livmoderen er nu tæt på brystbenets underkant. Halsbrand og åndenød er på sit højeste.", tip: "Sovehøjdeindstilling – sov med overkroppen let hævet for at reducere halsbrand om natten." },
  32: { baby: "Ca. 42,4 cm, vejer ca. 1,7 kg. Tæerne er tydeligt synlige. Barnet begynder at vende sig – mange lægger sig i den rigtige position (hoved nedad).", mom: "Braxton Hicks-sammentrækninger intensiveres. Huden på maven er spændt. Navlen kan poppe ud.", tip: "Begynd at sy barseltasken og forberede barnets soveplads og tøj." },
  33: { baby: "Ca. 43,7 cm, vejer ca. 1,9 kg. Knoglerne hærder yderligere men kraniet forbliver fleksibelt for fødslen. Barnet suger på sin tommelfinger.", mom: "De fleste bevægelser mærkes tydeligt. Bækkenbundssmerter er almindelige. Hyppig vandladning vender for alvor tilbage.", tip: "Øv afspændingsteknikker og åndedræt til fødslen. Overvej fødselsforberedelse hvis du ikke allerede går." },
  34: { baby: "Ca. 45 cm, vejer ca. 2,1 kg. Lungerne er nu næsten fuldt modne. Søvncyklussen ligner mere og mere en nyfødt baby.", mom: "Cervix (livmoderhals) begynder langsomt at modnse. Mange oplever lændegener og bækkentryk.", tip: "Akupunktur kan hjælpe på bækkensmerter og forberede kroppen til fødsel. Tal med din jordemoder." },
  35: { baby: "Ca. 46,2 cm, vejer ca. 2,4 kg. Næsten al knogleudvikling er komplet. Barnet fylder nu det meste af livmoderen. Bevægelserne er kraftige.", mom: "Kroppen forbereder sig på fødslen. Mælkeproduktionen kan starte (råmælk/colostrum). Skridtbenssmerter.", tip: "Hvil dig så meget du kan – du har brug for energireserver til fødslen." },
  36: { baby: "Ca. 47,4 cm, vejer ca. 2,6 kg. Barnet er nu næsten fuldbåret. Immunstoffer overføres fortsat fra dig. Huden er glat og fyldig.", mom: "Livmoderen begynder at synke ned i bækkenet (nedsynkning). Åndenød aftager, men vandladningsbesvær øges.", tip: "Undersøg tegn på fødsel: regelmæssige veer, vandrør der brister, slimet udflåd (slimproppen)." },
  37: { baby: "Ca. 48,6 cm, vejer ca. 2,9 kg. FULDBÅREN! Alle organer er modne og klar. Barnet øver vejrtrækning ved at trække fostervand ind og ud.", mom: "Fødsel kan nu ske hvornår som helst. Bækkenet åbner sig. Hormonet relaxin løsner ledbånd.", tip: "Sørg for at barseltasken er pakket og klar. Hav jordemoder og hospital på speed dial." },
  38: { baby: "Ca. 49,8 cm, vejer ca. 3,1 kg. Vernix-laget tyndes ud. Hår og negle er fuldt udviklede. Barnet er mentalt og fysisk klar til livet udenfor.", mom: "Intens pres mod bækkenbunden. Søvn er besværlig. Mange er utålmodige og klar til at møde deres baby.", tip: "Gåture kan hjælpe barnet til at sætte sig godt i bækkenet og stimulere fødslen." },
  39: { baby: "Ca. 50,7 cm, vejer ca. 3,3 kg. Hjernen og nervesystemet modnes fortsat. Barnet er nu fuldt udviklet og klar.", mom: "Mærk barnets bevægelser nøje. Slimproppen kan afgå. Cervix modnes og åbner sig.", tip: "Tal med din jordmoder om tegn på fødsel og hvornår du skal tage på hospitalet." },
  40: { baby: "Ca. 51,2 cm, vejer ca. 3,4 kg. TERMINEN! Barnet er fuldt udviklet. Huden er glat med lidt vernix. Klar til at møde verden.", mom: "Du er ved terminen! Kun 5% føder præcist på terminsdatoen – vær tålmodig. Kroppen er klar.", tip: "Slap af og stol på din krop. Veerne vil komme. Mænd en god sang og en varm drik." },
  41: { baby: "Ca. 51,7 cm, vejer ca. 3,6 kg. Barnet er stadig trygt. Moderkagen fungerer fortsat godt. Negle og hår kan være lange.", mom: "Over terminen men det er normalt! Jordemoderen vil tilbyde igangsættelsesamtale. Hyppig scanning.", tip: "Bliv ved med at mærke bevægelser. Kontakt sygehuset hvis du mærker ændringer i bevægelsesmønstret." },
  42: { baby: "Barnet er nu post-termin. Huden kan se lidt tør ud. Alle organer fungerer fint.", mom: "Igangsættelse vil typisk tilbydes nu. Du er tæt på at møde din baby!", tip: "Stol på dit plejeteam. Igangsættelse er en sikker og almindelig procedure." },
};

function getPregnancyWeek(dueDateStr) {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  const weeksDue = Math.round(daysUntilDue / 7);
  const currentWeek = 40 - weeksDue;
  return currentWeek;
}

function WeekCard({ week, data, isCurrent }) {
  const [open, setOpen] = useState(isCurrent);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${isCurrent ? 'border-2' : ''}`}
      style={{
        borderColor: isCurrent ? 'var(--color-cappuccino)' : 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
      }}
    >
      <button
        className="w-full px-4 py-3 flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          {isCurrent && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-cappuccino)', color: '#fff' }}>
              Nu
            </span>
          )}
          <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Uge {week}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="pt-3 space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Baby className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Babyen</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.baby}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Din krop</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.mom}</p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-cappuccino)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-cappuccino)' }}>Tip</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{data.tip}</p>
          </div>
          <Link
            to={`/PregnancyWeekDetail?week=${week}`}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            Læs meget mere om uge {week} →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PregnancyTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        setProfile(profiles[0] || null);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, []);

  const dueDateStr = profile?.child_due_date;
  const currentWeek = dueDateStr ? getPregnancyWeek(dueDateStr) : null;

  const isPregnant = currentWeek !== null && currentWeek >= 4 && currentWeek <= 42;
  const isPostTerm = currentWeek !== null && currentWeek > 42;

  // Which weeks to show
  const weeksToShow = Object.keys(PREGNANCY_WEEKS).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="space-y-3 mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-4">
      {/* Header card */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Inspireret af
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Politikens Graviditetsbog
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>af Lene Skou Jensen</p>

        {!dueDateStr && (
          <p className="text-xs mt-3 p-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
            💡 Tilføj din terminsdato i din profil for at se hvilken uge du er i nu.
          </p>
        )}

        {isPregnant && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((currentWeek - 4) / 38) * 100)}%`, backgroundColor: 'var(--color-cappuccino)' }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-cappuccino)' }}>
              Uge {currentWeek}
            </span>
          </div>
        )}

        {isPostTerm && (
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            🎉 Du er forbi terminen – din baby er snart her!
          </p>
        )}
      </div>

      {/* Week list */}
      <div className="space-y-2">
        {weeksToShow.map(week => (
          <WeekCard
            key={week}
            week={week}
            data={PREGNANCY_WEEKS[week]}
            isCurrent={isPregnant && week === currentWeek}
          />
        ))}
      </div>
    </div>
  );
}