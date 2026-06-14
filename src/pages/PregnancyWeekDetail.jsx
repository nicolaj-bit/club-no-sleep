import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Baby, Heart, Sparkles, Apple, Activity, AlertCircle } from 'lucide-react';

const WEEK_DATA = {
  4: {
    title: 'Uge 4 – De første celler deler sig',
    intro: 'Du er nu officielt gravid! Befrugtningsægget har implanteret sig i livmoderslimhinden, og din krop begynder at producere graviditetshormonet hCG – det hormon, der får en graviditetstest til at vise positivt.',
    baby: {
      size: 'Valmuefrø (ca. 1–2 mm)',
      weight: 'Under 1 gram',
      description: 'Fosteret er på dette stadie kun en lille klump celler, men allerede nu sker der utrolige ting. De tre kimlag dannes: ectoderm (hud, nervesystem, hjerne), mesoderm (knogler, muskler, hjerte) og endoderm (indre organer). Det neurale rør, der siden bliver hjernen og rygraden, begynder at lukke sig. Hjertet er endnu bare et rør, men det begynder at sende de første elektriske signaler.',
      milestones: ['Det neurale rør begynder at dannes', 'De tre kimlag etableres', 'Placenta begynder at udvikle sig', 'hCG-hormonniveauet stiger dagligt'],
    },
    mom: {
      symptoms: ['Udeblevet menstruation', 'Ømme og tunge bryster', 'Let træthed', 'Måske let kvalme om morgenen', 'Hyppigere vandladning begynder'],
      body: "Din livmoder er stadig kun på størrelse med en ærtepotre, men kroppen er allerede i fuld gang med at tilpasse sig. Blodvolumen begynder at stige – i løbet af graviditeten øges den med op til 50%. Dit immunsystem dæmpes en smule for at acceptere det 'fremmede' foster. Progesteronniveauet stiger markant og giver træthed og blødere ledbånd.",
    },
    nutrition: 'Folinsyre er altafgørende nu – du bør tage 400 mikrogram dagligt. Det beskytter direkte mod alvorlige neuralrørsdefekter som spina bifida. Spis grønne bladgrøntsager, bønner og berigede kornprodukter. Undgå alkohol, rå fisk og upasteuriserede mejeriprodukter fra nu af.',
    tips: [
      'Book din første jordemoderkonsultation – den foregår typisk i uge 6–10',
      'Stop med at tage ibuprofen og andre NSAID-præparater',
      'Tal med din læge om dine mediciner – visse lægemidler er uegnede under graviditet',
      'Undgå sauna og meget varme bade – forhøjet kropstemperatur er skadelig i første trimester',
    ],
    emotional: 'Mange oplever en blanding af begejstring og usikkerhed. Det er fuldstændigt normalt. Graviditet i de tidlige uger er en tid med stor hormonel uro, og dine følelser kan svinge hurtigt. Del dine tanker med din partner, og vid at ambivalens er en del af oplevelsen.',
    warning: 'Kontakt din jordemoder eller læge ved kraftig blødning, svære smerter i underlivet eller feber over 38°C.',
  },
  5: {
    title: 'Uge 5 – Hjertet slår for første gang',
    intro: 'En af graviditetens allerstørste mirakler sker nu: fosterets hjerte begynder at slå. Det er ikke mere end et lille rør, men det pumper allerede primitivt blod. På en scanning i denne uge kan man måske høre de hurtige hjerteslag – op til 160 slag i minuttet.',
    baby: {
      size: 'Sesamfrø (ca. 2–3 mm)',
      weight: 'Under 1 gram',
      description: 'Fosteret ligner nu en lille tudse med en tydelig hoved-ende og en halestruktur. Hjertet er et rør, der begynder at pulsere. Hjernens tre primære dele er anlagt: forhjernen, midthjernen og baghjerner. Øjengruber og øregruber er synlige som mørke pletter. Armknopperne begynder at spire frem. Navlestrengen er under dannelse.',
      milestones: ['Hjertet begynder at slå (ca. 100–160 slag/min)', 'Primitivt nervesystem dannes', 'Armknopper spirer frem', 'Hjernens tre grundstrukturer anlagt'],
    },
    mom: {
      symptoms: ['Kvalme – særligt om morgenen men kan vare hele dagen', 'Kraftig træthed', 'Meget ømme bryster', 'Øget spytproduktion', 'Madaversioner og -begær', 'Let svimmelhed'],
      body: 'Kvalmen du oplever skyldes primært det høje hCG-niveau – og faktisk er kraftig kvalme et tegn på en velfungerende graviditet. Din lugtesans er nu enormt skærpet, og ting du ellers godt kunne lide kan pludselig virke uudholdelige. Livmoderen begynder at vokse, og du kan mærke en svag trykken.',
    },
    nutrition: 'Spis hvad du kan holde nede. Tørre kiks, ristet brød eller bananer er gode kvalme-dæmpere. B6-vitamin kan reducere kvalme – find det i bananer, avocado og kartofler. Undgå fed, stegt og krydret mad. Ginger (ingefær) i te, kapsler eller kandiseret form virker dokumenteret mod graviditetskvalme.',
    tips: [
      'Spis noget lille inden du stiger ud af sengen om morgenen',
      'Hold en lille snack på natbordet – f.eks. kiks eller nødder',
      'Undgå lugte der trigger kvalme – lad andre lave mad hvis muligt',
      'Prøv akupressur-armbånd (søsygdomsarmbånd) – de kan hjælpe mange',
      'Drik vand i små slurke hele dagen frem for store mængder ad gangen',
    ],
    emotional: 'Den første tid kan føles overvældende. Du kan føle dig euforisk og angst på samme tid. Mange kvinder har svært ved at holde hemmeligheden, mens de stadig er nervøse for det første trimester. Husk: du behøver ikke fortælle nogen endnu – tag det i dit eget tempo.',
    warning: 'Henvend dig til læge ved meget kraftig, vedvarende opkastning (hyperemesis gravidarum) – dette er en tilstand der kræver behandling og evt. indlæggelse.',
  },
  6: {
    title: 'Uge 6 – Ansigtet former sig',
    intro: 'Nu begynder det ansigt, du en dag vil kende bedre end dit eget, langsomt at tage form. Øjegruber, næsebor og mundspalte er synlige, og de små knopper, der siden bliver arme og ben, vokser sig længere.',
    baby: {
      size: 'Linse (ca. 4–6 mm)',
      weight: 'Under 1 gram',
      description: 'Hjertet slår nu med ca. 100–110 slag i minuttet og kan ses på en vaginal ultralydsscanning. Hjernen udvikler sig ekstremt hurtigt – der dannes op mod 250.000 neuroner hvert eneste minut! Ansigtsstrukturer er under intens udvikling: to mørke pletter markerer øjnene, og næse og mund begynder at åbne sig. Arm- og benknopper er tydelige.',
      milestones: ['Hjertet pumper nu stabilt', '250.000 neuroner dannes per minut', 'Øjne, næse og mund begynder at forme sig', 'Arm- og benknopper vokser frem'],
    },
    mom: {
      symptoms: ['Kraftig kvalme – mange har det allersværest i uge 6–9', 'Madaversioner er på sit højeste', 'Mørke, møre bryster', 'Forstoppelse begynder', 'Humørsvingninger', 'Hyppig vandladning'],
      body: 'Dine bryster er måske vokset op til en halv størrelse allerede. Areola (den mørke ring om brystvorterne) bliver mørkere, og blodårerne i brysterne er tydeligt synlige. Livmoderen er nu på størrelse med en appelsin.',
    },
    nutrition: 'Jern er vigtigt – start med at spise mere rødt kød, linser og spinat. C-vitamin øger jernoptagelsen markant – spis gerne et glas appelsinjuice til jernrige måltider. Kalcium er afgørende for barnets knogledannelse: mælk, ost, yoghurt og grønne grøntsager er gode kilder.',
    tips: [
      'Book din første jordemoder-kontakt hvis du ikke har gjort det endnu',
      'Begynd at bruge graviditetstøj eller elastiske linninger – komfort er vigtig',
      'Undgå at ligge på ryggen i længere tid – det kan give svimmelhed',
      'Lær at anerkende og respektere din træthed – din krop arbejder hårdt',
    ],
    emotional: "Første trimester er præget af ambivalens for mange. Du kan elske at være gravid og samtidig savne dit 'gamle' liv. Det er normalt. Tal med din partner om dine forventninger til forældreskabet – jo tidligere jo bedre.",
    warning: 'En blødning i første trimester er ikke altid farligt, men skal altid undersøges. Tag kontakt til din jordemoder eller vagtlæge.',
  },
  7: {
    title: 'Uge 7 – Hjernen vokser eksplosivt',
    intro: 'Denne uge er præget af den mest intensive hjernedannelse i hele fosterets liv. Hvert eneste minut dannes hundredtusinder af nye hjerneceller, og de grundlæggende strukturer, der en dag vil styre alt fra vejrtrækning til kreativitet, anlægges nu.',
    baby: {
      size: 'Blåbær (ca. 8–10 mm)',
      weight: 'Under 1 gram',
      description: 'Fosteret er ca. fordoblet i størrelse på blot en uge. Handen har nu en synlig "finnelignende" form, og tæerne begynder at skille sig ad. Hjertet slår nu op til 160 slag i minuttet og er delt i fire kamre. Øjenlågene er under dannelse. Galdeblæren og bugspytkirtlen anlægges.',
      milestones: ['Hjertet er delt i fire kamre', 'Øjenlåg under dannelse', 'Hænder og fødder har synlig form', 'Galdeblæren anlægges'],
    },
    mom: {
      symptoms: ['Kvalme kan føles uudholdelig for mange', 'Meget øget spytproduktion (ptyalismus)', 'Ekstrem træthed – kan opleves som en fysisk tyngde', 'Oppustet mave', 'Humørsvingninger – gråd og latter om hinanden'],
      body: 'Dit blodomfang er allerede steget med ca. 20%, og din hjertepuls i hvile er steget. Du kan føle dig svimmel ved hurtige bevægelser. Nyrerne arbejder i højtryk for at filtrere det øgede blodvolumen.',
    },
    nutrition: 'Omega-3 fedtsyrer (DHA) er afgørende for hjernens udvikling. Spis fede fisk (laks, makrel, ørred) 1–2 gange om ugen – dog ikke rovfisk som tunfisk. Valnødder og hørfrø er gode plantebaserede omega-3 kilder. Et graviditetsomega-3 tilskud kan være en god idé.',
    tips: [
      'Tal med din jordemoder om D-vitamintilskud – de fleste gravide mangler D-vitamin i Danmark',
      'Undgå lever og leverprodukter – de indeholder for meget A-vitamin',
      'Prøv at have noget at nippe til konstant – tomt maven forværrer kvalme',
      'Let bevægelse som yoga eller gåture kan faktisk hjælpe på kvalme og humør',
    ],
    emotional: 'Det er normalt at bekymre sig om en eventuel abort – statistisk set afsluttes ca. 15–20% af kendte graviditeter med spontan abort, og de fleste sker i 1. trimester. Du kan finde det svært at knytte dig til graviditeten endnu. Det er okay – din kærlighed til dit barn behøver ikke starte nu for at blive dyb.',
    warning: 'Kontakt jordemoder ved svær, vedvarende opkastning der forhindrer dig i at holde noget nede. Hyperemesis gravidarum kan føre til dehydrering og kræver medicinsk behandling.',
  },
  8: {
    title: 'Uge 8 – Alle organer er anlagt',
    intro: 'En stor milepæl: alle fosterets organer er nu anlagt og under udvikling. Fra nu af handler det primært om vækst og modning. Fosteret bevæger sig faktisk allerede, selvom du ikke kan mærke det endnu.',
    baby: {
      size: 'Hindbær (ca. 14–16 mm)',
      weight: 'Ca. 1 gram',
      description: 'Alle vitale organer – hjerte, hjerne, lunger, lever, nyrer – er anlagt. Fingrene begynder at adskille sig fra den hånd-"finne". Øjnene er nu pigmenterede og dækket af øjenlåg. Ørerne er tydelige. Fosteret bevæger sine arme og ben spontant, men bevægelserne er ikke koordinerede endnu.',
      milestones: ['Alle indre organer anlagt', 'Fingrene begynder at adskille sig', 'Spontane bevægelser begynder', 'Øjnene er pigmenterede'],
    },
    mom: {
      symptoms: ['Mavebrynd og sure opstød begynder', 'Forstoppelse er meget almindelig', 'Nedsat blodtryk kan give svimmelhed', 'Livmoderen trykker mod blæren → hyppig vandladning', 'Træthed er stadig dominerende'],
      body: 'Livmoderen er nu ca. dobbelt så stor som normalt – på størrelse med en appelsin. Den begynder at presse mod omgivende organer. Dine nyrer filtrerer 50% mere blod end normalt. Huden kan opleves tørrere og mere sensitiv.',
    },
    nutrition: 'Magnesium hjælper mod forstoppelse og muskelkramper – find det i nødder, frø og mørk chokolade (gerne 70%+). Fiber er vigtig: spis fuld-kornsprodukter, grøntsager og tørrede frugter. Probiotika (fx yoghurt med levende kulturer) kan forbedre tarmfloraen.',
    tips: [
      'Drik rigeligt vand for at modvirke forstoppelse og støtte nyrerne',
      'Undgå at drikke store mængder kaffe – max 200 mg koffein om dagen (ca. 1 kop)',
      'Undgå overdreven fysisk aktivitet, men let motion er fint og gavnligt',
      'Begynd at holde øje med din energi og sov når du kan',
    ],
    emotional: 'Mange par oplever en forandring i parforholdet allerede nu. Seksuallysten kan variere – for nogle stiger den, for andre forsvinder den helt i 1. trimester. Kommunikation med din partner om dine behov og bekymringer er afgørende.',
    warning: 'Hvis du ikke allerede har booket 1. trimester-scanning (CVS-scanning/nakkefoldscanning), gør det nu – den skal foregå i uge 11–14.',
  },
  9: {
    title: 'Uge 9 – Barnet er nu et foster',
    intro: 'Fra nu af kaldes dit barn officielt et "foster" (tidligere "embryo"). Det lyder måske teknisk, men det markerer et vigtigt stadie: alle grundlæggende strukturer er dannet, og nu handler det om raffinement og vækst.',
    baby: {
      size: 'Kirsebær (ca. 22–25 mm)',
      weight: 'Ca. 2 gram',
      description: 'Halen er væk – fosteret ligner nu i stigende grad et menneske. Tæerne er adskilt. Øjenlågene er lukkede og vil forblive lukkede frem til uge 28. Musklerne er begyndt at modne, og fosteret kan nu bøje armene. Tændernes anlæg dannes under tandkødet.',
      milestones: ['Halen er forsvundet – ser menneskelignende ud', 'Tændernes anlæg dannes', 'Musklerne modnes', 'Øjenlågene er lukkede og vokset fast'],
    },
    mom: {
      symptoms: ['Træthed er fortsat dominerende', 'Uro i benene om natten', 'Øget vaginal udflåd (normalt, hvis det er gennemsigtigt/hvidt)', 'Maven vokser – tøj begynder at sidde trangt', 'Følelsesmæssig intensitet'],
      body: 'Dine æggestokke har overdraget hormonproduktionen til moderkagen. Du kan opleve svimmelhed, da blodtrykket stadig er lavt. Brysterne er begyndt at forberede sig til amning – mælkegangene vokser.',
    },
    nutrition: 'Zink er vigtig for celledeling og immunforsvar – find det i kød, skaldyr (pas på rå!), frø og bønner. Jod er essentielt for skjoldbruskkirtlen og fosterets hjernudvikling – fisk, mejeriprodukter og jodberiget salt. Undgå lakrids i store mængder – glycyrrhizin kan påvirke blodtrykket.',
    tips: [
      'Fortæl din arbejdsgiver om graviditeten så de kan tilpasse dine arbejdsvilkår',
      'Undersøg dine rettigheder som gravid på arbejdsmarkedet',
      'Let yoga, svømning eller gåture er ideelle motionsformer nu',
      'Begynd at tænke på fødselsforberedelse – kurser bookes tidligt',
    ],
    emotional: 'Det er normalt at have blandede følelser – glæde, angst, usikkerhed på egne evner som forælder. Overvej om du vil gå til noget støttesamtaler eller fødselsforberedelse med fokus på det mentale. Depression og angst i graviditeten er langt mere udbredt end mange tror.',
    warning: 'Skjoldbruskkirtelsygdom kan forværres under graviditeten. Tal med din læge om screening hvis du har symptomer på under- eller overfunktion.',
  },
  10: {
    title: 'Uge 10 – Knoglerne begynder at hærde',
    intro: 'Dit barn er nu ca. 3 cm langt og vejer næsten ingenting – men det er et lille menneske med ansigt, hænder, fødder og alle sine organer. Knoglerne begynder at erstatte den bløde brusk, der hidtil har dannet skelettet.',
    baby: {
      size: 'Jordbær (ca. 30–32 mm)',
      weight: 'Ca. 4 gram',
      description: 'Ossifikation (knoglehærdning) starter nu. Fosternets krop retter sig ud. Fingrene er fuldt adskilt. Ydre kønsorganer begynder at differentiere sig – om 4–6 uger kan man evt. se køn på en scanning. Tarmsystemet er nu fuldt i bughulen.',
      milestones: ['Knoglehærdning (ossifikation) begynder', 'Ydre kønsorganer differentierer sig', 'Tarmen er fuldt i bughulen', 'Fingrene er fuldstændigt adskilt'],
    },
    mom: {
      symptoms: ['Kvalmen kan begynde at aftage let', 'Ryggen kan begynde at gøre ondt', 'Livmoderen presser nu på blæren', 'Bryster vokser fortsat', 'Huden kan opleves tørrere'],
      body: 'Dit hormonelle stressniveau begynder at falde lidt. Moderkagen overtager i stigende grad hormonproduktionen fra æggestokkene. Du kan begynde at se en lille "bule" under navlen.',
    },
    nutrition: 'Kalcium og D-vitamin arbejder sammen om at opbygge babyens knogler og tænder. Kalcium: mejeriprodukter, grønne grøntsager, mandler. D-vitamin: fedtede fisk, æggeblommer – og sol på huden (udfordrende i dansk vinter!). Mange gravide har brug for tilskud.',
    tips: [
      'Book nakkefoldsscanningen (uge 11–14) hvis ikke gjort',
      'Undersøg mulighederne for barselsorlov og planlæg fremad',
      'Prøv bækkenbundøvelser (kegels) – start tidligt for at forebygge inkontinens',
      'Undgå kontaktsport og aktiviteter med faldrisiko fra nu af',
    ],
    emotional: 'Mange par finder at de første 10 uger har været de hårdeste følelsesmæssigt. Der kan nu komme en lille lettelse. Overvej at dele nyheden med nære venner – støtte fra netværk er uvurderlig.',
    warning: 'Tal med din jordemoder om dine spørgsmål til nakkefoldsscanningen og den genetiske rådgivning den evt. fører til.',
  },
  11: {
    title: 'Uge 11 – Ud af embryostadiet',
    intro: 'Første trimester nærmer sig sin afslutning. Nakkefoldsscanningen kan nu bookes eller er måske allerede bestilt. Risikoen for spontan abort er nu markant reduceret, og mange vælger at dele nyheden med omverdenen.',
    baby: {
      size: 'Figen (ca. 40–42 mm)',
      weight: 'Ca. 7 gram',
      description: 'Fosteret kan nu synke! Reflekserne er begyndt at fungere. Håndfladerne og fodsålerne er fuldt udviklede med linjemønstre. Øjnene er rykket fra siden af ansigtet til forsiden – mere menneskelignende. Næsebor og tunge er synlige. Nyrerne producerer allerede urin.',
      milestones: ['Slugerefleksen udvikles', 'Hånd- og fodlinjer dannes', 'Øjnene er vendt fremad', 'Nyrerne begynder at producere urin'],
    },
    mom: {
      symptoms: ['Træthed begynder at aftage for mange', 'Kvalmen letter for de fleste i løbet af uge 12–14', 'Livmoderen rager op over skambenets kant', 'Let synlig mave for tynde kvinder'],
      body: 'Din livmoder er nu stor nok til at den kan mærkes inde i bughulen. Venerne i Maven og brysterne er meget synlige. Mange oplever en let brunlig linje fra navlen ned mod skambenets kant (linea nigra).',
    },
    nutrition: 'Protein er afgørende for celledannelse og fostervækst: kylling, fisk, bønner, linser, æg og mejeriprodukter. Sigt efter ca. 70–80 gram protein om dagen. Kolhydrater fra fuldkorn giver stabil energi og forebygger store blodsukkersving.',
    tips: [
      'Book nakkefoldsscanningen nu hvis ikke gjort – den foregår uge 11–14',
      'Tænk på din arbejdssituation og hvornår du vil gå på barsel',
      'Begynd at fortælle venner og familie – støtte er vigtig',
      'Start en graviditetsdagbog – det er dejligt at kigge tilbage på',
    ],
    emotional: 'Nakkefoldsscanningen kan skabe bekymring og angst, særligt hos førstegangsgravide. Snak med din jordemoder om hvad scanningen kan og ikke kan vise, og forbered jer mentalt på begge udfald.',
    warning: 'Kontakt din jordemoder med spørgsmål om rygning, alkohol, medicin eller andre bekymringer – der er ingen dumme spørgsmål.',
  },
  12: {
    title: 'Uge 12 – Første trimester slutter',
    intro: 'Tillykke – du er snart fri af første trimester! Risikoen for spontan abort er nu meget lav, og for mange kvinder begynder energien at vende tilbage. Dit barn er nu på størrelse med en blomme og har alle sine organer anlagt.',
    baby: {
      size: 'Blomme (ca. 50–55 mm)',
      weight: 'Ca. 14 gram',
      description: 'Fingeraftrykkene er nu unikke og fuldt dannede. Reflekserne er veludviklede – fosteret reagerer på berøring. Nyrerne producerer urin, som udskilles i fostervandet. Tarmene er nu permanent i bughulen og begynder at lave de første peristaltiske bevægelser. Hjernen vokser fortsat eksplosivt.',
      milestones: ['Unikke fingeraftryk er dannet', 'Reflekserne er veludviklede', 'Tarmbevægelser begynder', 'Alle organer på plads'],
    },
    mom: {
      symptoms: ['Energiboost for mange – "anden-trimester-glæde" nærmer sig', 'Kvalmen aftager gradvist', 'Maven begynder at blive tydelig', 'Huden kan skinne eller blive problematisk – begge er normale'],
      body: 'Livmoderen rager nu tydelig op over skambenets kant. Du er begyndt at tage på – de fleste har taget 1–2 kg i 1. trimester, men det varierer meget. Dine bryster fortsætter med at vokse og forberede sig.',
    },
    nutrition: 'Nu er det et godt tidspunkt at spise varieret og næringsrigt. Din energibehov er steget med ca. 300 kcal om dagen i 2. trimester. Spis mad du kan lide – der er ingen "forbudte" sunde madvarer (undtagen lever, råt kød og rå fisk).',
    tips: [
      'Del din gode nyhed med familien og vennerne!',
      'Begyndt at se på fødselsforberedelseskurser og book i god tid',
      'Meld dig til svangreprogrammet hos din jordemoder',
      'Overvej om du vil amme og begyndt at læse om det',
    ],
    emotional: 'For mange er uge 12 et vendepunkt. Mange kvinder begynder at slappe mere af og knytte sig mere til graviditeten. For andre fortsætter angsten, og det er også okay. Graviditet er individuel.',
    warning: 'Nakkefoldsscanningen i denne uge kan vise tegn på kromosomsygdomme som Downs syndrom. Resultaterne er statistik, ikke diagnoser – din jordemoder kan guide dig videre.',
  },
  13: {
    title: 'Uge 13 – Andet trimester begynder!',
    intro: 'Velkommen til andet trimester – for mange den allerbedste periode af graviditeten. Energien vender tilbage, kvalmen aftager, og du kan begynde at nyde at være gravid. Dit barn er nu et lille miniatureudgave af et menneske.',
    baby: {
      size: 'Ært (ca. 65 mm)',
      weight: 'Ca. 23 gram',
      description: 'Stemmeudstyr anlægges (men barnet kan selvfølgelig ikke bruge det endnu). Fosteret kan åbne munden og bevæge tungen. Tarmen er på plads. Hjernen vokser hurtigt. Kroppen begynder at vokse hurtigere end hovedet – proportionerne bliver mere menneskelignende.',
      milestones: ['Stemmeudstyr anlægges', 'Mundmotorik udvikles', 'Kroppen vokser nu hurtigere end hovedet', 'Hjernen vokser markant'],
    },
    mom: {
      symptoms: ['Øget seksualdrift for mange', 'Mere energi og bedre humør', 'Maveomfanget vokser tydeligt', 'Let rygsmerter kan begynde'],
      body: 'Dit blodtryk er nu typisk lidt lavt, og du kan opleve svimmelhed. Hormonet relaxin løsner ledbånd og led over hele kroppen – dette er nødvendigt for at bækkenet kan åbne sig ved fødslen, men kan give let ubehag i ryg og bækken.',
    },
    nutrition: 'Jernbehovet stiger nu markant: du har brug for 27 mg jern om dagen. Rødt kød, fjerkræ og fisk er bedste jernkilder. Kombiner med C-vitamin for bedre optagelse. Undgå te og kaffe til måltider – de hæmmer jernoptagelse markant.',
    tips: [
      'Start med at smøre mave, lår og bryster med fugtighedscreme – forebyg strækmærker',
      'Begynd at sove på siden nu – en graviditetspude kan hjælpe',
      'Motioner regelmæssigt – 30 min. let motion om dagen er optimalt',
      'Overvej en babymoon (parrejse) mens du stadig er i god form',
    ],
    emotional: 'Mange par oplever en markant forbedring i parforholdet i andet trimester. Seksuallivet kan genopstå, og der er mere overskud til hinanden. Tal om jeres forventninger, bange anelser og glæder.',
    warning: 'Tal med din jordemoder om NIPT-test (non-invasiv prænatal test) som et alternativ til invasive undersøgelser.',
  },
  14: {
    title: 'Uge 14 – Negle og tænder',
    intro: 'Dit barns fingre er nu fuldt udviklede med negle – ja, rigtige negle! Rundligamentssmerter (sting i siden) er et meget almindeligt fænomen nu og det næste stykke tid. Det er livmoderens ledbånd, der strækker sig.',
    baby: {
      size: 'Citron (ca. 80–85 mm)',
      weight: 'Ca. 43 gram',
      description: 'Fingrene har fuldt udviklede negle. Urinstof produceres. Fosteret kan frown og smile – men ikke bevidst. Øjnene bevæger sig selv om øjenlågene er lukkede. Knoglerne i ansigtet hærder. Lanugo (fin, blød dun) begynder at vokse over hele kroppen.',
      milestones: ['Negle er fuldt udviklede', 'Lanugo begynder at gro', 'Ansigtsudtryk dannes', 'Urinstof dannes'],
    },
    mom: {
      symptoms: ['Rundligamentssmerter (sting i siderne ved hurtig bevægelse)', 'Mere energi og appetit', 'Maven er klart synlig', 'Huden kan mørkne visse steder'],
      body: 'Rundligamentssmerte er en skarp, lynhurtig smerte i siden der opstår ved pludselige bevægelser. Det er ganske normalt og ikke farligt – livmoderens støtteledbånd strækkes. Linea nigra (den mørke linje) er nu tydelig hos mange.',
    },
    nutrition: 'Begynd at tænke på DHA (omega-3) til barnets hjerneudvikling. Laks, makrel og sardiner er fremragende. Hvis du ikke spiser fisk, tag et omega-3-tilskud specifikt til gravide. Mejeriprodukter giver kalcium til barnets knogler og tænder.',
    tips: [
      'Bækkenbundøvelser HVER DAG – sæt en alarm hvis du glemmer det',
      'Undgå at rejse dig hurtigt – det udløser rundligamentssmerter',
      'Støt maven med en pude ved søvn',
      'Besøg tandlægen – graviditeten kan forværre tandkødsproblemer og kontrol er gratis',
    ],
    emotional: 'Du kan begynde at mærke en stærkere tilknytning til dit ufødte barn. Mange begynder at tale til deres mave og føle barnets "personlighed" på trods af at de endnu ikke kender det. Nyd denne tid.',
    warning: 'Kontakt jordemoder ved kraftige, vedvarende smerter i underlivet – rundligamentssmerter er korte og skarpe, men vedvarende smerte kræver vurdering.',
  },
  15: {
    title: 'Uge 15 – De første bevægelser',
    intro: 'Mange kvinder – særligt dem der har født før – begynder nu at mærke de første svage bevægelser fra barnet. Det beskrives som sommerfugle i maven, luftbobler eller en let kildren. For førstegangsgravide kommer det typisk i uge 18–22.',
    baby: {
      size: 'Æble (ca. 10 cm)',
      weight: 'Ca. 70 gram',
      description: 'Hår begynder at vokse på hovedet og som øjenbryn og vipper. Øjnene bevæger sig langsomt, selvom de er lukket. Fosteret er yderst aktivt – det rulter, sparker og strækker sig konstant. Ben er nu længere end arme. Det kan også hikke!',
      milestones: ['Hår begynder at gro', 'Øjenbryn og vipper dannes', 'Hyppige bevægelser', 'Hikke begynder'],
    },
    mom: {
      symptoms: ['Mulige første svage bevægelser', 'God energi for de fleste', 'Maven vokser ugentligt', 'Næseblødning og tilstoppet næse er meget normalt'],
      body: 'Det øgede blodvolumen giver øget tryk i slimhinderne – i næsen fører det til let tilstopning og næseblødning. Tandkødet er mere blodmættet og bløder lettere. Disse gener er normale og forbigående.',
    },
    nutrition: 'Vitamin C er vigtigt for kollagendannelse – grønne pebre, citrusfrugter og jordbær. Vitamin A (i form af betacaroten, IKKE retinol) er godt for øjenudviklingen: gulerødder, søde kartofler. Husk: undgå lever pga. for høj retinol.',
    tips: [
      'Tal og syng til din mave – barnet kan begynde at høre lyde',
      'Begynd at sove konsekvent på venstre side for optimal blodgennemstrømning',
      'Brug en saltvandssprøjte til tilstoppet næse – det er sikkert',
      'Overvej at gå til en fysioterapeut specielt i graviditet hvis du har rygsmerter',
    ],
    emotional: 'Det er normalt at være bekymret for om barnet har det godt, når du endnu ikke kan mærke det tydeligt. Stol på din krop og dine kontroller. En scanning kan altid berolige dig.',
    warning: 'Morfologisk scanning (stor scanning) bookes nu til uge 18–22. Glem ikke at booke din tid.',
  },
  16: {
    title: 'Uge 16 – Barnet kan høre dig',
    intro: 'Dit barns ører er nu fuldt udviklede, og det kan høre lyde fra omverdenen – inklusive din stemme, din hjertebanken og musiken du lytter til. Forskning viser at nyfødte genkender musik og stemmer, de hørte i maven.',
    baby: {
      size: 'Avocado (ca. 11–12 cm)',
      weight: 'Ca. 100 gram',
      description: 'Høresansen er nu aktiv. Øjnene er stadig lukkede, men kan registrere lys. En fin hvid substans (vernix caseosa) begynder at danne sig på huden for at beskytte den mod fostervandet. Skelettet er nu primært knogle frem for brusk.',
      milestones: ['Høresansen er aktiv', 'Øjnene kan registrere lys', 'Vernix begynder at danne sig', 'Skelet primært af knogle'],
    },
    mom: {
      symptoms: ['Synlige fosterbevægelser hos tynde kvinder', 'Maven er tydelig', 'Linea nigra er mørk', 'Huden er lysende for mange – "pregnancy glow"'],
      body: 'Du er nu tydeligt gravid for omverdenen. "Pregnancy glow" er reel – det øgede blodvolumen giver huden mere farve og fugt. Men for andre giver hormonerne acne og pigmentforandringer. Begge varianter er normale.',
    },
    nutrition: 'Din appetit er nu normal eller øget. Spis hvad du har lyst til – bare sørg for at det er varieret. Ekstra kaloriebehov er nu ca. 300 kcal/dag. En god tommelfingerregel: et ekstra glas mælk og en frugt om dagen.',
    tips: [
      'Tal, læs og syng til dit barn dagligt – I begynder en kommunikation der aldrig stopper',
      'Begynd at smøre maven med mandelolie eller kokosolie for strækmærker',
      'Overvej at optage babybevægelserne i en dagbog fra nu af',
      'Find et fødselsforberedelseskursus og book pladser – de fyldes hurtigt',
    ],
    emotional: 'Mange par begynder nu at diskutere barneopdragelse, navnevalg og praktiske forberedelser. Det kan give anledning til uenigheder – det er normalt. Jo tidligere I taler om grundlæggende værdier, jo bedre.',
    warning: 'Morfologisk scanning bookes nu. Hav din patientjournal klar – sundhedssystemet bruger disse oplysninger aktivt.',
  },
  17: {
    title: 'Uge 17 – Fedt aflejres',
    intro: 'Dit barn begynder nu at opbygge fedtdepoter under huden. Disse fedt-reserver er afgørende for varmeregulering efter fødslen og er en vigtig energikilde de første uger af livet.',
    baby: {
      size: 'Pære (ca. 13 cm)',
      weight: 'Ca. 140 gram',
      description: 'Subkutant fedt begynder at aflejres. Fingernegles er hårde. Knoglerne hærder fortsat. Immunsystemet modnes. Fosteret er nu meget aktivt – det vender sig og strækker sig i fostervandet.',
      milestones: ['Fedtdepoter begynder at opbygges', 'Immunsystemet modnes', 'Finger- og tånegle er hårde', 'Meget aktive bevægelser'],
    },
    mom: {
      symptoms: ['Rygsmerte er meget almindelig', 'Ankler og fødder kan svulme', 'Næseblod', 'Hyppig vandladning', 'Mavesvie og halsbrand'],
      body: 'Hormoner gør dine ledbånd og led løsere, og det mærkes nu i ryggen. Bækkenbundmusklerne støtter den voksende livmoder, og bækkenbundsøvelser er nu vigtigere end nogensinde. Hævelse i ankler og fødder mod aftenen er normalt.',
    },
    nutrition: 'Protein er fortsat nøglen: dit behov er ca. 75–80 gram om dagen. Kombiner proteiner med jernrige fødevarer. Undgå processet kød og spegepølser – de kan indeholde listeria-bakterier. Bær er superfood under graviditeten: antioxidanter, fiber og C-vitamin.',
    tips: [
      'Tag ryggen alvorligt – overvej en ergonomisk stol på arbejdet',
      'Svøm eller gå i vandgymnastik – vand aflaster ryggen perfekt',
      'Hold benene hævet når du sidder for at reducere hævelse',
      'Brug støttestrømper ved lange stå- eller siddeperioder',
    ],
    emotional: 'Kroppen din forandrer sig markant, og ikke alle kvinder elsker det. Det er okay at have blandede følelser om din forandrende krop. Din krop gør noget utroligt – men det er fuldstændigt legitimt at savne at føle sig i sin egen krop.',
    warning: 'Ved pludselig kraftig hævelse i ansigt og hænder, kontakt jordemoder – det kan være et tidligt tegn på præeklampsi.',
  },
  18: {
    title: 'Uge 18 – Bevægelserne er tydelige',
    intro: 'Nu er bevægelserne normalt klart mærkbare for de fleste gravide. Barnet sparker, ruller, strækker sig og hikker – og du mærker det hele! Det er en af de mest magiske og intime oplevelser i graviditeten.',
    baby: {
      size: 'Sød kartoffel (ca. 14 cm)',
      weight: 'Ca. 190 gram',
      description: 'Myelin (den fedtholdige substans der isolerer nerveceller) begynder at dannes – dette accelererer nervesignalernes hastighed markant. Fosteret gaber, strækker sig og hikker regelmæssigt. Ørerne er fuldt udviklede. Nethinden i øjet er sensitiv over for lys.',
      milestones: ['Myelinisering af nerverne begynder', 'Gaben og hikken begynder', 'Ørerne er fuldt udviklede', 'Øjet er lysfølsomt'],
    },
    mom: {
      symptoms: ['Klare sparkekicks og bevægelser', 'Hyppig vandladning intensiveres', 'Rundbenet ligament-smerter', 'Tandkødsblødning', 'Rygsmerter'],
      body: 'Din livmoder er nu ca. på højde med navlen. Tyngdepunktet i din krop skifter, og det kan give ryg- og bækkengener. Mange mærker nu at de går anderledes – lidt "gyngegangagtigt". Det er helt normalt.',
    },
    nutrition: 'Gå til tandlægen! Graviditetshormoner kan fremkalde graviditetsgingivitis (tandkødsbetændelse) – dine tænder trænger til ekstra pleje nu. Fluortandpasta og blød tandbørste. God tandsundhed er forbundet med lavere risiko for præterm fødsel.',
    tips: [
      'Begyndt at registrere sparkemønsteret – du vil lære dit barns rytme at kende',
      'Brug tøj der sidder løst og behageligt – kompression er ubehageligt',
      'Overvej en afslapningsapp eller meditationslyd til bedre søvn',
      'Book morfologisk scanning hvis ikke gjort – den skal foregå uge 18–22',
    ],
    emotional: 'Mærk efter: føler du dig lykkelig, bekymret, begejstret? Alle følelser er gyldige. Del dem med en du stoler på. Mange kvinder oplever øget angst i midten af graviditeten – statistisk set er uge 20-scanningen en kæmpe nervøsitetshæmmer.',
    warning: 'Morfologisk scanning (stor scanning) er afgørende – den vurderer barnets anatomiske struktur og placental placering. Husk at du kan bede om ekstra forklaringer under scanningen.',
  },
  19: {
    title: 'Uge 19 – Midten af graviditeten',
    intro: 'Du er næsten midt i graviditeten! Sansecentrene i barnets hjerne modnes nu accelereret, og barnet begynder at opfange lyde, lys og bevægelse på en mere bevidst måde.',
    baby: {
      size: 'Mango (ca. 15 cm)',
      weight: 'Ca. 240 gram',
      description: 'Vernix (hvid fedtagtig substans) dækker nu barnets hud for beskyttelse mod fostervandet. Sansecentrene i hjernen modnes: høre-, syn-, lugte-, smage- og berøringscentre er alle aktive. Piger har nu alle de ægceller de nogensinde vil have dannet.',
      milestones: ['Vernix dækker huden', 'Alle sansecentre modnes', 'Piger: alle ægceller dannet', 'Hjernen modnes intenst'],
    },
    mom: {
      symptoms: ['Graviditetshukommelse ("baby brain")', 'Svimmelhed ved hurtige bevægelser', 'Mavesmerter der ligner kramper (normalt hvis kortvarige)', 'Maven er synlig'],
      body: 'Graviditetshukommelse er reel og videnskabeligt dokumenteret! Det skyldes hormonelle ændringer og hjernenens omstrukturering i forberedelse til moderskab. Du behøver ikke bekymre dig – det er midlertidigt.',
    },
    nutrition: 'Jern, jern, jern! Jernmangel er den hyppigste ernæringsmangel under graviditet. Blodprøve ved jordemoder kan afsløre evt. mangel. Jernkilderne: mørkt kød, linser, quinoa, mørkgrønne grøntsager. Kombiner ALTID med C-vitamin.',
    tips: [
      'Skriv lister – det hjælper på graviditetshukommelsen',
      'Begynd at interessere dig for amning – find et kursus eller læs om det',
      'Kend til graviditetsrelaterede nødsituationer (præeklampsi-symptomer, for tidlig fødsel-tegn)',
      'Fortæl dine nærmeste om din terminsdato og dine fødselspræferencer',
    ],
    emotional: 'Du er nu godt i gang. For mange begynder fantasien om barnets personlighed, udseende og fremtid. Det er den mest intime del af graviditeten – du kender dit barn, inden nogen andre gør.',
    warning: 'Kontakt jordemoder ved feber over 38,5°C – infektioner kan i sjældne tilfælde udløse for tidlig fødsel.',
  },
  20: {
    title: 'Uge 20 – HALVVEJS! 🎉',
    intro: 'TILLYKKE – du er halvvejs! Det er en kæmpe milepæl. Morfologisk scanning (den store scanning) foregår nu, og for mange er det et af graviditetens mest bevægende øjeblikke – første rigtige "møde" med dit barn.',
    baby: {
      size: 'Banan (ca. 16,5 cm)',
      weight: 'Ca. 300 gram',
      description: 'HALVVEJS! Fodsålernes linjer er dannet. Brusk er ved at blive erstattet af ægte knogler. Sveddannelse begynder. Fosteret sover og er vågent i regelmæssige cyklusser – ca. 12–14 timer per dag. Bevægelserne er meget koordinerede og kraftige.',
      milestones: ['Midtvejspunktet er nået!', 'Fodsåler med fuld linjestruktur', 'Sove/vågne-cyklus etableres', 'Sveddannelse begynder'],
    },
    mom: {
      symptoms: ['God energi for de fleste', 'Tydelige fosterbevægelser', 'Maveknap kan poppe ud', 'Let søvnbesvær begynder'],
      body: 'Livmoderen er nu nøjagtigt ved navlens niveau – en dejlig klinisk markering af halvvejen! Dit hjerte pumper nu 40–50% mere blod end normalt. Du kan mærke dit hjerte slå tydeligere.',
    },
    nutrition: 'Dit ernæringsbehov er nu på sit maksimum. Sørg for: 1) Jern (27 mg), 2) Folat (600 µg), 3) DHA omega-3 (200 mg), 4) Jod (200 µg), 5) D-vitamin (10 µg). Graviditetstilskud dækker de fleste – men mad skal stadig være varieret.',
    tips: [
      'Nyd den morfologiske scanning og stil alle dine spørgsmål',
      'Overvej om I vil vide barnets køn – tal det igennem med din partner',
      'Begynd at sætte barnets rum i stand – det giver en god fornemmelse af fremtid',
      'Plan en "babymoon" mens du stadig er i god form',
    ],
    emotional: 'At nå halvvejen er en kæmpe psykologisk milepæl. For mange begynder det virkelig at føles virkeligt nu. Den store scanning kan afstedkomme stærke følelser – klar dig til at blive overvældet.',
    warning: 'Morfologisk scanning kan afsløre anatomiske abnormiteter. Forbered jer på at modtage information, og husk at I ikke er alene – der er altid rådgivning at få.',
  },
  21: {
    title: 'Uge 21 – Smagssansen vågner',
    intro: 'Dit barn smager nu hvad du spiser! Smagsknopperne er fuldt udviklede, og barnet sluger fostervand og registrerer smagene. Forskning viser at smag og mad-præferencer delvist dannes i denne periode.',
    baby: {
      size: 'Gulerod (ca. 27 cm, hoved til fod)',
      weight: 'Ca. 360 gram',
      description: 'Smagsknopperne er aktive. Barnet synker fostervand og smager de smagsstoffer du spiser. Legebevægelserne er nu koordinerede. Synsnerven modnes. Legumsystemet (immunsystem) styrkes.',
      milestones: ['Smagsansen er aktiv', 'Barnet smager din mad', 'Koordinerede bevægelser', 'Synsnerven modnes'],
    },
    mom: {
      symptoms: ['Benlængtan og kramper om natten', 'Søvnbesvær', 'Strækmærker kan begynde', 'Hæmorider kan opstå', 'Svulmende fødder om aftenen'],
      body: 'Vener er under øget pres fra livmoderen, og hæmorider kan opstå. Det er ubehageligt men meget normalt – op til 35% af gravide får hæmorider. Koldt vand, fiber og at undgå at sidde for lange ad gangen hjælper.',
    },
    nutrition: 'Spis varieret og smagfuldt! Dit barn "smager" det hele med dig. Krydderurter, stærke grøntsager, varierede proteiner – det er med til at danne barnets smagspalette. Magnesium hjælper mod benkramper: nødder, frø, bønner.',
    tips: [
      'Spis varieret mad – det introducerer dit barn for mange smagsnuancer',
      'Løft benene op og drik rigeligt mod benkramper',
      'Prøv magnesiumcreme eller -tilskud ved benkramper',
      'Sov med en pude mellem benene for at aflaste bækkenet',
    ],
    emotional: 'Viden om at barnet nu reagerer på din mad og lyde kan intensivere tilknytningen. Mange gravide oplever drømmene bliver mere levende og gerne om barnet – det er helt normalt.',
    warning: 'Hæmorider der ikke bedres med hjemmebehandling bør vurderes af din jordemoder eller praktiserende læge.',
  },
  22: {
    title: 'Uge 22 – Fingeraftryk er unikke',
    intro: 'Dit barns fingeraftryk er nu fuldt udviklet og helt unikt – der er ikke et andet menneske på jorden med det samme mønster. En vidunderlig påmindelse om at dit barn allerede er et individ.',
    baby: {
      size: 'Papaya (ca. 28 cm)',
      weight: 'Ca. 430 gram',
      description: 'Fingeraftrykkene er fuldstændig unikke. Øjnene er fuldt udviklede – iris mangler endnu pigment, så de fleste babyer er blåøjede ved fødslen. Hjernens vækst er fortsat eksplosiv. Hørecenteret er nu så udviklet at barnet reagerer på høje lyde.',
      milestones: ['Unikke fingeraftryk', 'Øjne fuldt udviklede (iris mangler pigment)', 'Reagerer på høje lyde', 'Hjernens hurtigvækstsperiode'],
    },
    mom: {
      symptoms: ['Lavt blodtryk ved hurtig opstigen', 'Huden strammer', 'Klø på maven ved strækmærker', 'Søvnen er begyndt at blive udfordrende'],
      body: 'Livmoderen er nu ca. 2–3 cm over navlen. Det lave blodtryk giver mange pludselig svimmelhed – rejs dig altid langsomt fra liggend eller siddende stilling. Huden er stramt strakt og kan klø – fugt er din bedste ven nu.',
    },
    nutrition: 'Vitamin E er godt for huden og kan forebygge strækmærker indefra: mandler, solsikkefrø, vegetabilske olier. Zink er vigtigt for immunforsvaret: kød, ost, frø. Husk at drikke rigeligt vand – det holder huden fugtig indefra.',
    tips: [
      'Fugt maven dagligt med olie eller creme – det forebygger strækmærker og klø',
      'Undgå pludselige opstigninger',
      'Overvej at begynde bækkenfysikoterapi ved bækkensmerter',
      'Begyndt at udtænke fødeplanen og dine ønsker for fødslen',
    ],
    emotional: 'Det er normal at begynde at bekymre sig om selve fødslen. Angst for smerte, komplikationer og at "gøre det rigtige" er udbredt. Fødselsforberedelse – med fokus på positiv fødsel og smertehåndtering – kan hjælpe enormt.',
    warning: 'Tal med din jordemoder om tegn på for tidlig fødsel: regelmæssige veer før uge 37, vandafgang, tryk i bækkenet.',
  },
  23: {
    title: 'Uge 23 – Lungerne forbereder sig',
    intro: 'Lungerne producerer nu surfaktant – det fedtholdige stof, der holder luftsækkene (alveolerne) åbne efter fødslen. Uden surfaktant kollapser lungerne ved hvert udåndingsdræt. Det er en kritisk milepæl for barnets overlevelsesevne.',
    baby: {
      size: 'Aubergine (ca. 29 cm)',
      weight: 'Ca. 500 gram',
      description: 'Surfaktantproduktionen starter i alveolerne. Øjenlågene kan nu åbne og lukke sig. Binyrebarken producerer kortisol, som fremskynder lungemodning. Fosteret reagerer tydeligt på stemmer og musik. Suge-refleksen er aktiv.',
      milestones: ['Surfaktantproduktion starter', 'Øjenlåg kan åbne og lukke', 'Aktiv suge-refleks', 'Reaktion på stemmer og musik'],
    },
    mom: {
      symptoms: ['Kortåndethed ved anstrengelse', 'Braxton Hicks-sammentrækninger kan starte (uregelmæssige, smertefri)', 'Svulmende hænder og fødder', 'Søvnbesvær'],
      body: 'Braxton Hicks-sammentrækninger (øvelsessammentrækninger) er nu mulige. De er uregelmæssige, smertefrie og kortvarige – ganske anderledes end rigtige veer. Din mave hærdes lidt i 20–30 sekunder og slapper derefter af igen.',
    },
    nutrition: 'Blødning fra tandkødet kan øges – brug en ekstra blød tandbørste og tandtråd forsigtigt. Calcium er vigtigt for tænder og knogler: 1000 mg om dagen. Hvis du har forhøjet blodtryk, begræns salt.',
    tips: [
      'Øv vejrtrækningsøvelser nu – de er afgørende ved fødslen',
      'Genkend Braxton Hicks vs. rigtige veer: BH er uregelmæssige, smertefulde veer er regelmæssige',
      'Hav en positiv fødsel-dagbog eller vision board',
      'Overvej at optage fosterlyde eller musik til dit barns "hjemmeplaylist"',
    ],
    emotional: 'Mange kvinder begynder at have angstdrømme om fødslen eller om at noget går galt med barnet. Det er normalt. Tal om dine bekymringer med din jordemoder – de er vant til disse samtaler og kan berolige og informere.',
    warning: 'En for tidlig fødsel i uge 23 er alvorlig men mulig at overleve med intensiv behandling. Kend tegn på for tidlig fødsel og søg straks hjælp ved mistanke.',
  },
  24: {
    title: 'Uge 24 – En vigtig overlevelses-milepæl',
    intro: 'Uge 24 markerer en medicinsk set vigtig grænse: fra nu af anses et for tidligt født barn for "levedygtigt" – dvs. der sættes ind med intensiv behandling ved for tidlig fødsel. Det er selvfølgelig stadig langt for tidligt, men grænsen er passeret.',
    baby: {
      size: 'Majskolbe (ca. 30 cm)',
      weight: 'Ca. 600 gram',
      description: 'Hjernen vokser meget hurtigt – bugtningerne (folderne der øger hjernens overfladeareal) begynder at dannes. Blodbankerne i lungerne modnes. Smertesansen er aktiv. Barnet kan nu skelne din stemme fra andre stemmer.',
      milestones: ['Hjernebugtninger dannes', 'Smertesansen er aktiv', 'Genkender din specifikke stemme', 'Levedygtighedsgrænsen passeret'],
    },
    mom: {
      symptoms: ['Halsbrand og sure opstød er nu meget intense', 'Åndenød', 'Ryg- og bækkensmerter intensiveres', 'Hyppig vandladning'],
      body: 'Livmoderen presser nu direkte mod mavesækken, og fordøjelsesenzymer kan refluksere op i spiserøret. Halsbrand er nu næsten universelt hos gravide. Spis ALDRIG umiddelbart inden du lægger dig.',
    },
    nutrition: 'Antacida (syreneutraliserende medicin) er sikkert i graviditeten – tal med din jordemoder eller apoteker. Undgå mad der trigger halsbrand: kaffe, tomat, fed mad, chokolade, citrus. Spis lille og ofte frem for store måltider.',
    tips: [
      'Sov med overkroppen let hævet – 2–3 puder under overkroppen',
      'Spis dit aftensmåltid mindst 2–3 timer inden du lægger dig',
      'Tygge tyggegummi stimulerer spytproduktion og neutraliserer syre',
      'Book jordemoderambulance-nummeret i din telefon',
    ],
    emotional: 'Det er normalt at begynde at tænke på fødslen med en blanding af glæde og angst. Fødselsforberedelse er dit vigtigste redskab nu. Find et kursus der passer til dig – online, fysisk, eller specialiseret (f.eks. mindfulness-fødsel).',
    warning: 'Test for svangerskabsbetinget diabetes (GDM) foregår typisk i uge 24–28. Tal med din jordemoder om dette.',
  },
  25: {
    title: 'Uge 25 – Barnet kan gribe om navlestrengen',
    intro: 'Dine barns hænder er nu så koordinerede, at det kan gribe om sin egen navlestreng og holde fast. Smertesansen er aktiv, og barnet kan nu mærke og reagere på stimuli udefra.',
    baby: {
      size: 'Nepe (ca. 34–35 cm)',
      weight: 'Ca. 660 gram',
      description: 'Greberefleksen er stærk – barnet kan gribe om navlestrengen. Huden begynder at strammere til – de første kurvede linjer er synlige. Hårfarven er ved at etablere sig. Fedtdepoterne vokser fortsat. Høresansen er fuldt funktionel.',
      milestones: ['Grebet om navlestrengen', 'Hud strammer til', 'Fedtlag opbygges aktivt', 'Hårfarven etablerer sig'],
    },
    mom: {
      symptoms: ['Besvær med at finde behagelig sovestilling', 'Huden på maven er stram og kløende', 'Benkramper om natten', 'Uro i benene (restless legs)'],
      body: 'Restless Legs Syndrom rammer mange gravide – en ubehagelig trang til at bevæge benene, særligt om aftenen. Det skyldes jernmangel og hormonelle ændringer. Jerntilskud og regelmæssig motion kan hjælpe.',
    },
    nutrition: 'Jern igen! Restless legs er kraftigt forbundet med jernmangel under graviditet. Blodprøve kan afklare om du mangler jern. Spis jernrige fødevarer og kombinér med C-vitamin. Undgå te og kaffe til måltider.',
    tips: [
      'En graviditetspude (U-formet eller lang) forbedrer søvnen markant',
      'Stræk lægge grundigt inden du går i seng for at forebygge kramper',
      'Gå en tur om aftenen – det hjælper på restless legs',
      'Forbered dig på at søvnen kun vil blive sværere – prioritér hvile',
    ],
    emotional: 'Det er normalt at bekymre sig om barnets velvære og at gruble over alle de ting der kan gå galt. Del dine bekymringer med din jordemoder – det er en del af din faglige støtte. Du behøver ikke bære det alene.',
    warning: 'Alvorlig Restless Legs der forhindrer søvn bør vurderes af jordemoder. Jernmangel kan behandles med tilskud.',
  },
  26: {
    title: 'Uge 26 – Øjnene åbner sig',
    intro: 'Et lille mirakel sker denne uge: dit barns øjenlåg åbner sig for første gang! Øjnene, der har været lukkede siden uge 10, ser nu lys for første gang. Barnet begynder sin lange rejse mod at lære verden at kende.',
    baby: {
      size: 'Salathoved (ca. 35–36 cm)',
      weight: 'Ca. 760 gram',
      description: 'Øjenlågene åbner sig. Nethindens lysfølsomme celler er nu aktive. Hjernen modnes fortsat – hjernebølger kan nu registreres. Immunstoffer overføres aktivt fra dig via moderkagen. Lungerne fortsat under modning.',
      milestones: ['Øjnene åbner sig for første gang', 'Hjernebølger kan registreres', 'Aktiv immunstofoverførsel fra mor', 'Lungemodning fortsætter'],
    },
    mom: {
      symptoms: ['Bækkensmerter (symfyseløsning) kan starte', 'Åndenød', 'Søvn er udfordrende', 'Livmoderen kan mærkes til siden af navlen'],
      body: 'Symfyseløsning (SPD – Symphysis Pubis Dysfunction) giver smerter ved skambenets forflade ved gang, trappegang og vending i sengen. Det skyldes relaxin-hormonet. Bækkenbelte og -øvelser hjælper.',
    },
    nutrition: 'Vitamin C styrker dit immunsystem og hjælper barnet med at optage dine immunstoffer: citrus, pebre, jordbær, broccoli. Zink er immunbooster: kød, ost, pumpkin seeds.',
    tips: [
      'Bækkenbelte kan give god lindring – bed din jordemoder om at vise dig det korrekte brug',
      'Undgå at bære tunge ting og at stå på ét ben',
      'Sov med en pude MELLEM knæene og under maven',
      'Tag trin én ad gangen i trapper – det reducerer bækkensmerter',
    ],
    emotional: 'Tredje trimester nærmer sig. Mange kvinder begynder at "reede" – at have stærk trang til at rydde op, sætte barnets rum i stand og forberede hjemmet. Det er en instinktiv reaktion på den nærtstående fødsel.',
    warning: 'Bækkensmerter der forhindrer normal gang kræver fysioterapi-behandling – kontakt din jordemoder.',
  },
  27: {
    title: 'Uge 27 – Barnet drømmer',
    intro: 'Vidste du at dit ufødte barn allerede drømmer? REM-søvn (den drømmende søvnfase) er observeret hos fostre fra denne uge. Hvad drømmer de om? Det ved vi ikke – men hjernen er aktiv selv i søvnen.',
    baby: {
      size: 'Blomkål (ca. 37 cm)',
      weight: 'Ca. 900 gram',
      description: 'REM-søvn er observeret – barnet drømmer! Lugte- og smagssansen er i fuld funktion. Hjernen modnes hastigt. Kropstemperaturen reguleres nu bedre. Barnet "praktiserer" vejrtrækning regelmæssigt ved at trække fostervand ind og ud.',
      milestones: ['REM-søvn og drømmefasen begynder', 'Lugtesansen aktiv', 'Vejrtrækningspraksis', 'Bedre termoregulering'],
    },
    mom: {
      symptoms: ['Tredje trimester starter snart', 'Braxton Hicks intensiveres', 'Hvile er vigtigere end nogensinde', 'Søvnkvaliteten forværres'],
      body: 'Dine bryster producerer nu colostrum (råmælk) – du kan måske presse en lille dråbe gul-hvid væske ud. Colostrum er ekstremt næringsrigt og immunologisk vigtigt for det nyfødte barn.',
    },
    nutrition: 'Spis for at have energi – men pas på at overkalorier ikke giver for hurtig vægtøgning, som kan belaste ryggen. Fokus på proteiner og gode kulhydrater. Undgå tom kalorieindtag fra sukkerholdige drikkevarer.',
    tips: [
      'Planlæg barselsorlov og praktiske ting hjemme – det reducerer stress markant',
      'Skriv en fødselsplan – dine ønsker til fødslen kommunikeret til personalet',
      'Forbered en barseltaske – det er aldrig for tidligt',
      'Overvej at tale med HR om dine rettigheder og din barselorlov',
    ],
    emotional: 'At vide at dit barn drømmer – er i sin inderste ind i sig selv – er en dybt bevægende tanke. Du er ikke alene med det. Mange gravide oplever en intensivering af tilknytningsoplevelsen i tredje trimester.',
    warning: 'Hvis du bemærker at barnets bevægelsesmønster ændrer sig markant, kontakt jordemoder. Du kender dit barns mønster bedst.',
  },
  28: {
    title: 'Uge 28 – Tredje trimester!',
    intro: 'Velkommen til tredje og sidste trimester! Du er nu i slutspurten. Barnet ligner en miniatureudgave af det barn, du snart møder – og det er nu tid til at gøre de finale forberedelser.',
    baby: {
      size: 'Aubergine (ca. 37,5 cm)',
      weight: 'Ca. 1 kg',
      description: 'Et kilo! Lungerne er næsten modne. Øjenlågene blinker. Hjernen dannes nu meget hurtigt – vækstraten er på sit maksimum. Barnet vender sig regelmæssigt. Fedt samles aktivt under huden.',
      milestones: ['Et kilo – tredje trimester!', 'Lunger næsten modne', 'Hjernen i maksimal vækst', 'Aktiv øjenblinken'],
    },
    mom: {
      symptoms: ['Hævede ankler og fødder – særligt om aftenen', 'Åndenød', 'Søvnbesvær', 'Hyppig vandladning vender for alvor tilbage'],
      body: 'Din livmoder er nu enorm – fra nedre del af mavebunden til ca. 8 cm over navlen. Alt er komprimeret: mavesæk, lunger, blære. Hold din overkrop hævet for at lette åndedrættet.',
    },
    nutrition: 'Caloriebehov er nu på sit maksimum: ca. 450 ekstra kalorier om dagen. Prioriter næringstæt mad. Omega-3 er stadig vigtig for hjernens vækst. Protein: 75–85 gram om dagen.',
    tips: [
      'Pak barseltasken nu – du ved aldrig hvornår det er',
      'Lær vejerkendelses-techniquer: timing, styrke, rytme',
      'Book fødselsforberedende kursus hvis ikke allerede gjort',
      'Diskuter din fødselsplan med din partner og skriv den ned',
    ],
    emotional: 'Tredje trimester er præget af forventning, men også angst. Mange kvinder oplever panik over ansvarets størrelse. Det er normalt – faktisk er det sund og ansvarlig tænkning.',
    warning: 'Husk din Rh-faktor-injektion til Rh-negative mødre som gives ved ca. 28 uger. Tal med din jordemoder.',
  },
  29: {
    title: 'Uge 29 – Hjernen ekspanderer',
    intro: 'Barnets hjerne vokser nu med en hastighed, der aldrig siden vil gentages. De karakteristiske folder og bugtninger (gyri og sulci) der giver hjernen sin store overflade, dannes nu intenst.',
    baby: {
      size: 'Butternut squash (ca. 38,5 cm)',
      weight: 'Ca. 1,15 kg',
      description: 'Hjernefolningerne dannes intenst – det øger hjernens overfladeareal og dermed kognitiv kapacitet. Knoglerne er fuldt udviklede men fortsat bøjelige. Håret vokser fortsat. Muskelmassen øges markant.',
      milestones: ['Hjernefolde (gyri/sulci) dannes intenst', 'Knogler fuldt udviklede men bøjelige', 'Kraftig muskelvækst', 'Fedtlag opbygges fortsat'],
    },
    mom: {
      symptoms: ['Kortåndethed', 'Forstoppelse', 'Hæmorider', 'Rygsmerter', 'Kramper i lægge og fødder'],
      body: 'Den stigende størrelse af livmoderen sætter nu pres på alle organer. Tyktarmen er komprimeret og forstoppelse er universelt. Fiber, vand og motion er dine redskaber.',
    },
    nutrition: 'Fiberrig kost: fuld-kornsprodukter, bælgfrugter, pærer, blommer. Svesker er naturlig afføringsglidning. Drik minimum 2,5 liter vand om dagen. Undgå processet hvid mel og sukker der forværrer forstoppelse.',
    tips: [
      'Gå en aftenwalk – det hjælper fordøjelsen og giver bedre søvn',
      'Prøv at sætte tid af til afspænding og visualisering af fødslen',
      'Lav en check-liste over hvad der mangler til barnets ankomst',
      'Overvej at tale med en doula – en personlig fødselshjælper',
    ],
    emotional: 'Det er normalt at begynde at bekymre sig om dit parforholds overlevelse og parrets liv som to kontra tre. Invitér din partner til at dele opgaverne og til at tale om det nye familieliv.',
    warning: 'Kontakt jordemoder straks ved tegn på præeklampsi: pludselig kraftig hævelse, hovedpine, synsforstyrrelser, smerter under brystet.',
  },
  30: {
    title: 'Uge 30 – Mærk bevægelserne',
    intro: 'Barnets bevægelser er nu stærke og regelmæssige. Det er vigtigt at du begynder at registrere bevægelsesmønsteret – det er din bedste indikator for barnets velvære i de kommende uger.',
    baby: {
      size: 'Lille hoved-kål (ca. 40 cm)',
      weight: 'Ca. 1,3 kg',
      description: 'Hjernen danner nu de typiske vindmølleformede bugtninger. Øjnene kan skelne lys fra mørke i fostertilstanden. Bevægelserne er regelmæssige og kraftige. Barnet kan nu genkende jeres stemmer – og reagerer på dem.',
      milestones: ['Genkender jeres stemmer', 'Hjernen er fuldt bugtet', 'Stærke, regelmæssige bevægelser', 'Lys/mørke-perception'],
    },
    mom: {
      symptoms: ['Lændesmerter er meget intense for mange', 'Fosterbevægelser er stærke og synlige', 'Søvnen er meget fragmenteret', 'Huden på maven kløer intenst'],
      body: 'Din rygsøjle bærer en enorm ekstrabelastning nu. Lænde-lordosen (den indadbuede rygkurve) er forstærket. Mange behøver nu bækkengördel eller lændestøtte for at fungere normalt.',
    },
    nutrition: 'Proteiner er fortsat super-vigtige til barnets vækst. Ost, æg, kylling, bønner. Undgå at springe måltider over – det fører til blodsukkersving der kan gøre dig svimmel og udmattet.',
    tips: [
      'Tæl spark: 10 bevægelser på 2 timer er normal aktivitet',
      'Note ned i en app eller dagbog hvornår barnet er aktivt',
      'Kontakt altid jordemoder ved markant ændring i bevægelsesmønster',
      'Forbered dit netværk: hvem er i beredskab til at hjælpe ved fødslen?',
    ],
    emotional: 'Den manglende søvn og den tunge krop kan give irritabilitet og tristhed. Det er normalt – men tal med din partner om din træthed. Lad folk hjælpe dig.',
    warning: 'Færre end 10 bevægelser i 2 timer kræver jordemoderkontakt. Stol på din instinkt – ring hellere én gang for meget.',
  },
  31: {
    title: 'Uge 31 – Alle sanser er aktive',
    intro: 'Dit barn har nu alle sine sanser aktive og velfungerende: hørelse, syn, smag, lugt og berøring. Det er nu aktivt lærende og optager information fra sin omverden – inklusive dit hjerte, din stemme og dine følelser.',
    baby: {
      size: 'Kokosnød (ca. 41 cm)',
      weight: 'Ca. 1,5 kg',
      description: 'Alle fem sanser er nu aktive og velfungerende. Øjnene kan fokusere på nære genstande. Barnet reagerer på lys, lyd, berøring og smag. Immunsystemet modnes kraftigt.',
      milestones: ['Alle fem sanser aktive', 'Synsfokus på nære objekter', 'Immunsystemet modnes', 'Aktiv læring og tilpasning'],
    },
    mom: {
      symptoms: ['Halsbrand på sit maksimum', 'Åndenød ved minimal anstrengelse', 'Søvnkvaliteten er meget dårlig', 'Bækkensmerter', 'Hævelse i hænder om morgenen'],
      body: 'Mange finder det svært at trække vejret ved let aktivitet – det skyldes at livmoderen presser direkte mod mellemgulvet. Tyngdekraften hjælper lidt – forsøg at stå ret og løfte brystkassen.',
    },
    nutrition: 'Mange kvinder mister appelliten igen i tredje trimester pga. pladesmanglende pladsen. Spis hvad du kan, hyppigt og næringsrigt. En smoothie med protein, bær og mælk er en hurtig og god løsning.',
    tips: [
      'Forbered og pack barseltasken nu – alt hvad du skal have med på hospitalet',
      'Skriv fødselsplan og diskuter den med din jordemoder',
      'Lav madfrysning nu mens du kan – I vil takke jer selv efter fødslen',
      'Book hjemmebesøg af jordemoder og evt. ammerådgiver',
    ],
    emotional: 'Det er normalt at være klar TIL at føde nu – og det er stadig 2 måneder til terminen. Kanal energien til produktiv forberedelse frem for angst.',
    warning: 'Hændelhævet om morgenen der ikke bedres i løbet af dagen, kombineret med hovedpine – ring til jordemoder.',
  },
  32: {
    title: 'Uge 32 – Barnet vender sig',
    intro: 'De fleste babyer begynder nu at vende sig og lægge sig i den rigtige position til fødsel – med hovedet nedad. Det er endnu tidligt nok at de kan skifte position, men de fleste er nu på vej til den rigtige stilling.',
    baby: {
      size: 'Ananas (ca. 42–43 cm)',
      weight: 'Ca. 1,7 kg',
      description: 'De fleste babyer begynder at lægge sig i sæde- eller hoved-nedadstilling. Kroppen runder til, og huden er nu glat og blød. Tåer er tydelige. Øjnene kan nu fokusere. Barnet øver sugebevægelser.',
      milestones: ['Begynder at lægge sig i fødestilling', 'Hud er glat og blød', 'Øger sugeøvelser', 'Tæerne er tydeligt synlige'],
    },
    mom: {
      symptoms: ['Braxton Hicks er mere intense', 'Navlen kan poppe ud', 'Huden på maven er meget stram', 'Søvn kræver mange puder og positionering'],
      body: 'Dit bryst producerer nu colostrum aktivt, og du kan måske se eller mærke lækage. Det er helt normalt. Brystholdere med ammepuder kan hjælpe.',
    },
    nutrition: 'Blodvolumet er på sit maksimum nu – op til 50% mere end normalt. Spis jernrigt for at holde hæmoglobinniveauet oppe. Træthed og blegt udseende kan være tegn på jernmangel – tag en blodprøve.',
    tips: [
      'Begynd aktivt at arbejde med barnets stilling – fourfoots-øvelser og svømning kan hjælpe',
      'Tal med din jordemoder om hvad der sker hvis barnet er i sædeleje ved uge 36',
      'Forbered din partner på at være din støtteperson',
      'Gør din hjemmeplads klar til nyfødt – sikre ledninger, køb bleer mv.',
    ],
    emotional: 'Mange kvinder føler sig store, besværede og utålmodige nu. Det er legitimt. Dine følelser er gyldige. Søg støtte i netværket – mor-fællesskaber, venner, jordemoder.',
    warning: 'Sædeleje ved uge 36 kræver samtale med jordemoder om muligheder: udvendigt vending (ECV), planlagt kejsersnit eller vaginale fødsel med sæde.',
  },
  33: {
    title: 'Uge 33 – Vejrtrækningsøvelser',
    intro: 'Dit barn øver nu vejrtrækning i "simulationsmodus" – det trækker fostervand ind og ud af lungerne og træner de muskler, der snart skal til at trække luft ind for første gang.',
    baby: {
      size: 'Ananas (ca. 44 cm)',
      weight: 'Ca. 1,9 kg',
      description: 'Barnet øver vejrtrækning intensivt. Immunforsvaret styrkes fortsat via overférte antistoffer. Hjernen modnes fortsat. Pupillerne kan nu trækkes sammen og udvides. Fedtlaget under huden er godt udviklat.',
      milestones: ['Intensiveret vejrtrækningsøvelse', 'Pupillernes reagerer på lys', 'Immunstoffer overføres aktivt', 'Fedtlag næsten komplet'],
    },
    mom: {
      symptoms: ['Trykken nedad i bækkenet', 'Hyppig vandladning', 'Søvnkvalitet på lavpunkt', 'Lændesmerter', 'Mavebrynd'],
      body: 'Den mentale forberedelse til fødslen starter nu for alvor. Mange kvinder oplever en ulidelig utålmodighed blandet med frygt for selve fødslen. Begge følelser er normale.',
    },
    nutrition: 'Lette, hyppige måltider. Undgå tunge måltider om aftenen. Tyr til næringsrige snacks: nødder, ost, æbler med jordnøddesmør. Drik rigeligt vand.',
    tips: [
      'Øv fødselsstillinger: huk, på alle fire, siddende – find hvad der er behageligt',
      'Overvej akupunktur til fødselsforberedelse og mod smerter',
      'Pakketjek på barseltasken – har du alt?',
      'Tal med din partner om hvad han/hun skal gøre i de første timer',
    ],
    emotional: 'Fødselsfrygt (tokofofbi) er meget udbredt – op til 14% af alle gravide oplever det. Det er en reel tilstand der kan behandles. Tal med din jordemoder hvis frygten er overvældende.',
    warning: 'Fødselsfrygt skal tages alvorligt. Der er psykologisk støtte og specialiserede forløb tilgængeligt via din jordemoder.',
  },
  34: {
    title: 'Uge 34 – Lungerne næsten modne',
    intro: 'Dine barns lunger er nu næsten fuldt modne. En præmatur fødsel i uge 34 kræver stadig intensiv behandling, men overlevelseschancerne er nu meget gode (over 99%).',
    baby: {
      size: 'Cantaloupe melon (ca. 45 cm)',
      weight: 'Ca. 2,1 kg',
      description: 'Lungerne er næsten modne. Søvn/vågne-cyklussen ligner nu en nyfødt babys. Central nervesystemet modnes. Bevægelserne er stadig kraftige men lidt mere rolige pga. pladsmangel.',
      milestones: ['Lunger næsten fuldt modne', 'Søvn/vågne-cyklus som nyfødt', 'CNS-modning', 'Bevægelserne ændrer karakter'],
    },
    mom: {
      symptoms: ['Bækkentryk', 'Kortåndethed', 'Forstoppelse', 'Søvnbesvær', 'Uro og utålmodighed'],
      body: 'Cervi (livmoderhals) begynder langsomt at modnes og blødgøres – en proces der kan tage uger. Slimproppen begynder at løsne sig delvist.',
    },
    nutrition: 'Spis for energi og modstandskraft. Undgå store måltider. Drik koldt vand ved feber eller overophedning.',
    tips: [
      'Akupunktur er videnskabeligt dokumenteret til at fremme fødselsforberedelse',
      'Raspberry leaf-te fra uge 36 kan hjælpe livmoderen til at kontrahere effektivt',
      'Forbered hjemmet: vaskede og stuede tøjsæt, bleer på plads',
      'Aftal hvem der passer ældre børn og kæledyr ved fødsel',
    ],
    emotional: 'Mange kvinder føler sig nu klar – eller næsten klar. Det er et godt tegn. Stol på at din krop ved hvad den skal. Millioner af kvinder har gjort dette før dig.',
    warning: 'Kontakt hospitalet straks ved: regelmæssige veer (6+ pr. time), vandafgang, kraftig blødning, eller kraftig ændring i barnets bevægelsesmønster.',
  },
  35: {
    title: 'Uge 35 – Råmælken er klar',
    intro: 'Din krop producerer nu colostrum (råmælk) i mængder der er klar til dit nyfødte barn. Colostrum er ikke bare mad – det er dit barns første immunvaccine, fyldt med antistoffer og vækstfaktorer.',
    baby: {
      size: 'Honningmelon (ca. 46 cm)',
      weight: 'Ca. 2,4 kg',
      description: 'Næsten al knogle- og organudvikling er komplet. Barnet fylder nu hele livmoderen. Vernix-laget er tykt. Bevægelserne er markante men begrænset af pladsen.',
      milestones: ['Organudvikling næsten komplet', 'Fylder hele livmoderen', 'Kraftige bevægelser i trangt rum', 'Vernix på max'],
    },
    mom: {
      symptoms: ['Trykken nedad – barnet er ved at synke', 'Søvnbesvær', 'Hyppig vandladning', 'Træthed', 'Colostrum kan lække fra brysterne'],
      body: 'Mange kvinder oplever nu en lettelse i åndenød når barnet synker ned i bækkenet – men dette ledsages af øget pres på blæren. Vandladning bliver endnu hyppigere.',
    },
    nutrition: 'Forbered kroppen til amning: spis varieret og næringsrigt. Havresuppletter, ingefær og fennikél siges traditionelt at støtte mælkeproduktionen – men det videnskabelige bevis er begrænset.',
    tips: [
      'Hvil dig så meget du kan – du sparer til en energireserve',
      'Læs om amning og hav realistiske forventninger – de første dage kan være svære',
      'Tal med venner/familie der har ammet om deres oplevelse',
      'Book ammerådgiver fra hospitalet til efter fødslen',
    ],
    emotional: 'Du er tæt på nu. Mange kvinder oplever den stærkeste "redelyst" i disse uger – en overvældende trang til at forberede hjemmet. Det er instinktivt og normalt.',
    warning: 'Mærk efter tegn på fødsel: regelmæssige veer (5–7 min interval), vandafgang (klart eller farvet), slimet blødning (slimproppen afgår). Ring til hospitalet ved tvivl.',
  },
  36: {
    title: 'Uge 36 – Snart fuldbåren',
    intro: 'Om en uge er dit barn officielt fuldbåren (uge 37). Nedsynkning sker nu for mange – barnet synker ned i bækkenet, og du kan pludselig trække vejret lettere – men vandladningsbehovet øges markant.',
    baby: {
      size: 'Papaya (ca. 47–48 cm)',
      weight: 'Ca. 2,6 kg',
      description: 'Huden er nu glat og fyldig. Fedtlaget er komplet. Mekonium (dit barns første afføring) samles i tarmen. Immunstoffer overføres fortsat. Barnet er nu mentalt og fysisk næsten klar.',
      milestones: ['Fedtlag og hud komplet', 'Mekonium samles i tarm', 'Immunstoffer fortsat overføres', 'Næsten klar til livet udenfor'],
    },
    mom: {
      symptoms: ['Nedsynkning giver lettelse i åndenød men øget blærepres', 'Symfyseløsning ved gang', 'Tiltagende træthed', 'Utålmodighed – klar til at møde babyen'],
      body: 'Cervix modnes fortsat. Slimproppen kan afgå delvist – det er normalt. En blodig slimafgang er tegn på at cervix åbner sig, men det er ikke nødvendigvis tegn på umiddelbar fødsel.',
    },
    nutrition: 'Spis for energi. Undgå tunge, fedtrige måltider der giver halsbrand. Drik rigeligt vand – det støtter fostervandsniveauet.',
    tips: [
      'Lær tegn på aktiv fødsel: veerne er regelmæssige, stærke og kortere end 5 minutter fra start til start',
      'Hav hospitalet nummeret klar',
      'Sørg for at bilen er tanket og ruten til hospitalet er klar',
      'Hvil dig MANGE gange i løbet af dagen',
    ],
    emotional: 'For mange er denne uge præget af en stille, intens forventning. Dit barn er snart her. Det er normalt at føle sig en blanding af klar og slet ikke klar – på samme tid.',
    warning: 'Kontakt hospitalet straks ved: vandafgang (ligegyldigt mængde), kraftig blødning, manglende bevægelser, regelmæssige veer.',
  },
  37: {
    title: 'Uge 37 – FULDBÅREN! 🌟',
    intro: 'Tillykke – dit barn er nu officielt fuldbåren! En fuldbåren baby i uge 37 er klar til livet udenfor livmoderen. Alle organer er modne og funktionelle. Nu handler det om at vente – og det er lettere sagt end gjort!',
    baby: {
      size: 'Ca. 48–49 cm',
      weight: 'Ca. 2,9 kg',
      description: 'Fuldbåren! Alle organer er modne. Lungerne er klar. Hjernen er klar. Immunsystemet er aktivt. Barnet øver sugebevægelser fortsat. Vernix tyndes ud. Klar til at møde verden.',
      milestones: ['FULDBÅREN – alle organer modne', 'Lungerne er klar til selvstændig vejrtrækning', 'Immunsystem aktivt', 'Klar til liv udenfor'],
    },
    mom: {
      symptoms: ['Veer kan starte – Braxton Hicks er intense', 'Bækkentryk og trykken nedad', 'Hyppig vandladning', 'Søvnbesvær', 'Slimet vaginaludflåd'],
      body: 'Din krop frigiver nu oxytocin og prostaglandiner der forbereder livmoderen og cervix til fødslen. Denne proces kan tage uger, eller det kan ske hurtigt.',
    },
    nutrition: 'Spis næringsrigt og let fordøjeligt. Drik rigeligt vand. Undgå store måltider der giver halsbrand og ubehag.',
    tips: [
      'Hold barseltasken klar ved indgangen',
      'Aftal kørsel til hospitalet – hvem kører, hvornår tager I af sted',
      'Lær veer at kende: aktive fødselsveer er regelmæssige (5 min mellemrum), stærke og varer 45–60 sek',
      'Brug tiden på afslapning, gåture og hygge med din partner',
      '🎁 Hent Lalatoto\'s gratis pakkeliste til hospitalstasken – se download-link nedenfor',
    ],
    emotional: 'At nå den fuldbårne milepæl er en enorm lettelse for mange. Nu er det op til babyen at bestemme hvornår det er tid. Overgivelse til processen er dit vigtigste redskab nu.',
    warning: 'Ring til hospitalet ved: veer 5 min ad gangen i 1 time, vandafgang, kraftig blødning, barnet er meget stille.',
  },
  38: {
    title: 'Uge 38 – Klar til mødet',
    intro: 'Din baby er fuldt klar – det er nu blot et spørgsmål om hvornår. Gåture, kærlighedsliv og hindbærblads-te siges at fremme fødslen – men videnskaben er ikke enig. Din krop ved hvad den skal.',
    baby: {
      size: 'Ca. 50 cm',
      weight: 'Ca. 3,1 kg',
      description: 'Vernix-laget er meget tyndt nu. Hår og negle er fuldt udviklede – mange nyfødte har lange negle der skal klippes med det samme. Barnet er mentalt og fysisk fuldt klar. Bevægelserne er kraftige men begrænset.',
      milestones: ['Hår og negle fuldt udviklede', 'Vernix tyndes ud', 'Mekonium i tarmen', 'Mentalt og fysisk klar'],
    },
    mom: {
      symptoms: ['Træthed', 'Utålmodighed', 'Søvnbesvær', 'Bækkentryk og trykken nedad', 'Nedre rygsmerter'],
      body: 'Din livmoderhals åbner sig langsomt. Mange kvinder er begyndt at være 1–2 cm åbne og 50–80% effacerede (udslettede) allerede nu – uden at mærke det.',
    },
    nutrition: 'Spis hvad du har lyst til. Der er ingen kostanbefalinger der fremmer fødslen videnskabeligt. Nyd et godt måltid med din partner.',
    tips: [
      'Gåture hjælper barnet at sætte sig i bækkenet og fremmer cervix-modning',
      'Hvil dig – du har brug for energi til veerne',
      'Akupunktur kan hjælpe på fødselsforberedelse',
      'Nyd de stille timer med din partner – snart er I tre',
    ],
    emotional: 'At vente på fødslen er en af livets sværeste øvelser. Stol på at din krop og dit barn ved hvad de gør. Prøv at leve i nuet frem for at fokusere på terminen.',
    warning: 'Fortæl din jordemoder ved faldende bevægelsesmønster – det kræver altid en vurdering.',
  },
  39: {
    title: 'Uge 39 – Enhver dag nu',
    intro: 'Du er over-terminen – endnu. Men statistisk set er du i den periode hvor flest kvinder føder. Vær opmærksom på alle tegn på fødsel og hold kontakten til din jordemoder.',
    baby: {
      size: 'Vandmelon (ca. 50–51 cm)',
      weight: 'Ca. 3,3 kg',
      description: 'Barnet er fuldt udviklet og klar. Fedtlagene er maksimale. Hjernen modnes fortsat (og gør det faktisk de første tre år!). Barnet er aktivt og reagerer på stimuli.',
      milestones: ['Fuldt klar', 'Hjernen modnes fortsat', 'Aktive bevægelser', 'Fedtlag maksimalt'],
    },
    mom: {
      symptoms: ['Intensiverede tegn på nær fødsel', 'Slimproppen afgår', 'Braxton Hicks er intense', 'Utålmodighed på maksimum'],
      body: 'Cervix modnes og åbner sig mere og mere. Slimproppen kan afgå som en blodblandet klat – det er et tegn på at kroppen er på vej, men fødslen kan stadig være dage borte.',
    },
    nutrition: 'Spis let og næringsrigt. Undgå tunge måltider. Hav energigivende snacks klar til veerne.',
    tips: [
      'Kend dine veersymptomer og aftal med hospitalet hvornår du skal møde op',
      'Mærk barnets bevægelser – de bør fortsat være aktive og regelmæssige',
      'Hold mobilen ladet og tæt på',
      'Opsæt en "automatisk svar" hvis du er travl med at føde',
    ],
    emotional: 'Den sene graviditet er psykologisk krævende. Sæt ord på din utålmodighed – det er legitimt. Fortæl folk at du gerne vil have ro fra spørgsmålet "har du ikke født endnu?"',
    warning: 'Kontakt jordemoder straks ved faldende bevægelser, vandafgang, blødning eller regelmæssige veer.',
  },
  40: {
    title: 'Uge 40 – TERMINEN! 👶',
    intro: 'TERMINEN er nået! Kun ca. 5% af babyer fødes præcist på terminen. Det er normalt at føde op til 2 uger over terminen. Din krop og din baby er i dialog – og snart er de klar.',
    baby: {
      size: 'Lille græskar (ca. 51 cm)',
      weight: 'Ca. 3,4 kg',
      description: 'Terminsbabyen er perfekt udviklet. Alt er klar. Barnet venter blot på de rigtige hormonsignaler. Vernix er næsten væk. Huden er glat. Øjnene er åbne. Klar til at møde dig.',
      milestones: ['Fuldt klar og terminsmoden', 'Hormonsignaler starter fødslen', 'Alt er på plads', 'Venter på mødet med dig'],
    },
    mom: {
      symptoms: ['Utålmodighed', 'Bækkentryk', 'Søvnbesvær', 'Braxton Hicks'],
      body: 'Kroppen frigiver nu store mængder oxytocin og prostaglandiner. Cervix åbner sig aktivt. Fødslens start kan snart komme.',
    },
    nutrition: 'Spis for energi og stamina. Datoer siges i folkemunde at "blødgøre" cervix – videnskabelige beviser er begrænsede men interessante.',
    tips: [
      'Stol på din krop – den ved hvad den gør',
      'Gå til jordemoder-kontrol hvis terminen er passeret',
      'Vær klar til hospitalet med pakket taske og booket køretøj',
      'Nyd de sidste stille timer som to',
    ],
    emotional: 'At ramme terminen uden fødsel er mentalt hårdt. Husk at terminen er en estimeret dato, ikke en deadline. Dit barn venter på det rette øjeblik.',
    warning: 'Scanning og CTG (barnets hjertelydsovervågning) tilbydes nu for at sikre barnets velvære. Mød op til alle aftalte kontroller.',
  },
  41: {
    title: 'Uge 41 – Lidt tålmodighed endnu',
    intro: 'Du er nu over terminen, men det er stadig normalt og forventeligt. Jordemoderen vil tilbyde tæt opfølgning med scanning og CTG. Igangsættelse kan diskuteres og planlægges.',
    baby: {
      size: 'Ca. 51–52 cm',
      weight: 'Ca. 3,5–3,7 kg',
      description: 'Barnet er stadig trygt. Moderkagen fungerer godt for de fleste. Negle og hår er meget lange. Barnets hud kan se lidt tør ud efter terminen.',
      milestones: ['Stadig trygt i livmoderen', 'Moderkagen fungerer normalt', 'Aktive bevægelser', 'Langt hår og negle'],
    },
    mom: {
      symptoms: ['Utålmodighed og frustration', 'Hyppige jordemoderkontroller', 'Tætere overvågning'],
      body: 'Din jordemoder og dit plejeteam overvåger nu dig og barnet tættere. Induktion (igangsættelse) vil typisk diskuteres og evt. planlægges ved uge 41–42.',
    },
    nutrition: 'Fortsæt med at spise næringsrigt. Din krop har brug for energireserver.',
    tips: [
      'Mød op til ALLE aftalte kontroller',
      'Bliv ved med at mærke barnets bevægelser dagligt',
      'Diskuter induktions-muligheder med din jordemoder',
      'Aftal klart med plejeteamet hvad der sker næste',
    ],
    emotional: 'At gå over terminen er mentalt udtømmende. Lad dine nærmeste støtte dig. Undgå at se for mange nyheder om komplikationer – det øger angsten unødvendigt.',
    warning: 'Igangsættelse er en sikker procedure. Tal åbent med din jordemoder om dine bekymringer og præferencer.',
  },
  42: {
    title: 'Uge 42 – Igangsættelse',
    intro: 'Ved 42 uger vil igangsættelse (induktion) typisk tilbydes eller anbefales stærkt. Det er en sikker og standard procedure der bruges af mange gravide. Snart møder du din baby!',
    baby: {
      size: 'Ca. 51–52 cm',
      weight: 'Ca. 3,6–4 kg',
      description: 'Post-terme babyer er fuldt udviklede og klar. Huden kan virke lidt tør og afskallet. Negle er meget lange. Barnet er fortsat aktivt.',
      milestones: ['Post-terme – fuldt klar', 'Aktive bevægelser', 'Huden kan virke tør', 'Klar til verden'],
    },
    mom: {
      symptoms: ['Tæt overvågning', 'Igangsættelse planlagt eller igangsat', 'Intensiv forventning'],
      body: 'Igangsættelse kan foregå ved ballonkateter, prostaglandin-gel i cervix, kunstig vandafgang eller drop med oxytocin. Det er alle sikre metoder.',
    },
    nutrition: 'Spis et godt måltid inden du tager på hospitalet til induktion – du vil have brug for energi!',
    tips: [
      'Spis et godt måltid inden hospitalsindlæggelsen',
      'Hav musik og afspænding klar til igangssættelsesfasen',
      'Din partner er din vigtigste støtteperson – involver ham/hende aktivt',
      'Snak med personalet – de er der for dig',
    ],
    emotional: 'Du er i mål. Dit barn vil snart være i dine arme. Alle de uger du har ventet, alt det du har båret – det hele var det værd.',
    warning: 'Kontakt hospitalet ved enhver bekymring. Du er i gode hænder.',
  },
};

export default function PregnancyWeekDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const week = parseInt(urlParams.get('week') || '12', 10);
  const data = WEEK_DATA[week];

  const prevWeek = week > 4 ? week - 1 : null;
  const nextWeek = week < 42 ? week + 1 : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Ingen data for uge {week}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/app" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            🤰 Graviditet
          </span>
          <div className="flex gap-1">
            {prevWeek && (
              <Link to={`/PregnancyWeekDetail?week=${prevWeek}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
            )}
            {nextWeek && (
              <Link to={`/PregnancyWeekDetail?week=${nextWeek}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
            {data.title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{data.intro}</p>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Baby className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Babyen denne uge</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Størrelse</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{data.baby.size}</p>
              </div>
              <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vægt</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{data.baby.weight}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.baby.description}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Milepæle</p>
              {data.baby.milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5" style={{ color: 'var(--color-cappuccino)' }}>✦</span>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{m}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Din krop & dine symptomer</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.mom.body}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Typiske symptomer</p>
              {data.mom.symptoms.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5" style={{ color: 'var(--color-cappuccino)' }}>•</span>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Apple className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Kost & ernæring</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.nutrition}</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Tips til ugen</span>
          </div>
          <div className="px-4 py-4 space-y-2">
            {data.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-sm font-medium flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-cappuccino)' }}>{i + 1}</span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Følelser & velvære</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.emotional}</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#FCA5A5' }}>
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-semibold text-rose-700">Kontakt jordemoder hvis...</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-rose-800">{data.warning}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {prevWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${prevWeek}`} className="rounded-2xl p-4 flex items-center gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Forrige</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Uge {prevWeek}</p>
              </div>
            </Link>
          ) : <div />}
          {nextWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${nextWeek}`} className="rounded-2xl p-4 flex items-center justify-end gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Næste</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Uge {nextWeek}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          ) : <div />}
        </div>

        {week === 37 && (
          <a
            href="https://media.base44.com/files/public/699f47a86e7e0a874d1159ed/34c43112a_DenUltimativepakkelistetilhospitalstasken.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center justify-between w-full rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <div>
              <p className="text-sm font-semibold">📋 Den Ultimative Pakkeliste</p>
              <p className="text-xs opacity-80 mt-0.5">Hent gratis PDF fra Lalatoto of Denmark</p>
            </div>
            <span className="text-xs font-medium px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Download</span>
          </a>
        )}

      </div>
    </div>
  );
}