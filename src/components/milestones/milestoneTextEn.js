// Engelske tekster til milepaelsrammerne.
//
// Rammerne kommer to steder fra: entiteten MilestoneFrame (det er dem, der
// vises i praksis) og den indbyggede liste i milestonesData.jsx, som bruges
// hvis databasen er tom. Begge saet indeholder de samme danske tekster, saa i
// stedet for at skrive engelsk to steder slaar vi op paa den danske tekst.
//
// Skriver en administrator en engelsk tekst direkte paa rammen (label_en,
// headline_en, subline_en), vinder den over opslaget her.

// Faste vendinger, der ikke foelger et moenster.
const PHRASES = {
  // Graviditet
  'Positiv test': 'Positive test',
  'En ny rejse begynder': 'A new journey begins',
  '12 ugers scanning': '12-week scan',
  '20 ugers scanning': '20-week scan',
  'Hej baby!': 'Hello, baby!',
  'Hej igen baby!': 'Hello again, baby!',
  'Første spark': 'First kick',
  'I dag mærkede jeg dig': 'Today I felt you',
  'I dag mærkede jeg dig for første gang': 'Today I felt you for the first time',
  'For første gang': 'For the first time',
  'Halvvejs! 🌟': 'Halfway! 🌟',
  '3. trimester starter': 'Third trimester begins',
  'Snart fuldbåren!': 'Almost full term!',
  'Terminen er her!': 'The due date is here!',

  // Baby
  'Kom til verden': 'Came into the world',
  'I dag kom jeg til verden': 'Today I came into the world',
  'Velkommen, lille en 🤍': 'Welcome, little one 🤍',
  'Første smil': 'First smile',
  'I dag smilede jeg': 'Today I smiled',
  'I dag smilede jeg for første gang': 'Today I smiled for the first time',
  'Første grin': 'First laugh',
  'I dag grinte jeg': 'Today I laughed',
  'I dag grinte jeg for første gang': 'Today I laughed for the first time',
  'Rullede mave→ryg': 'Rolled front to back',
  'Rullede ryg→mave': 'Rolled back to front',
  'I dag rullede jeg': 'Today I rolled over',
  'I dag rullede jeg fra mave til ryg': 'Today I rolled from front to back',
  'I dag rullede jeg fra ryg til mave': 'Today I rolled from back to front',
  'Fra mave til ryg': 'From front to back',
  'Fra ryg til mave': 'From back to front',
  'Sad selv': 'Sat up alone',
  'I dag sad jeg selv': 'Today I sat up by myself',
  'I dag sad jeg selv for første gang': 'Today I sat up by myself for the first time',
  'Opdagede fødderne': 'Found my feet',
  'I dag opdagede jeg': 'Today I discovered',
  'I dag opdagede jeg mine fødder': 'Today I discovered my feet',
  'Mine fødder': 'My feet',
  'Første kravl': 'First crawl',
  'I dag kravlede jeg': 'Today I crawled',
  'I dag lærte jeg at kravle': 'Today I learned to crawl',
  'Første mad': 'First food',
  'I dag smagte jeg': 'Today I tasted',
  'I dag smagte jeg min første mad': 'Today I tasted my first food',
  'Min første mad': 'My first food',
  'Drak af kop': 'Drank from a cup',
  'I dag drak jeg selv af kop': 'Today I drank from a cup by myself',
  'Første tand': 'First tooth',
  'Jeg har fået min første tand': 'My first tooth has arrived',
  'Lille perletand!': 'A little pearl!',
  'Første ord': 'First word',
  'I dag sagde jeg mit første ord': 'Today I said my first word',
  'Sagde "mor"': 'Said "mum"',
  "Sagde 'mor'": "Said 'mum'",
  'I dag sagde jeg "mor"': 'Today I said "mum"',
  "I dag sagde jeg 'mor' for første gang": "Today I said 'mum' for the first time",
  'Sagde "far"': 'Said "dad"',
  "Sagde 'far'": "Said 'dad'",
  'I dag sagde jeg "far"': 'Today I said "dad"',
  "I dag sagde jeg 'far' for første gang": "Today I said 'dad' for the first time",
  'Første skridt': 'First steps',
  'I dag gik jeg mine første skridt': 'Today I took my first steps',
  'Nu er der ingen vej tilbage!': 'No going back now!',
  'Startede i vuggestue': 'Started nursery',
  'I dag startede jeg i vuggestue': 'Today I started nursery',
  'Startede i børnehave': 'Started preschool',
  'I dag startede jeg i børnehave': 'Today I started preschool',
  'Første ferie': 'First holiday',
  'Min første ferie': 'My first holiday',
  'Første jul': 'First Christmas',
  'Min første jul': 'My first Christmas',
  'Første nytår': 'First New Year',
  'Mit første nytår': 'My first New Year',

  // Alder
  'Halvt et år! 🌟': 'Half a year! 🌟',
  'Tillykke! 🎉': 'Happy birthday! 🎉',
};

const ORDINAL = { 1: '1st', 2: '2nd', 3: '3rd' };

// Moenstre, der kun adskiller sig ved et tal.
const PATTERNS = [
  [/^(\d+) uger i maven$/, (n) => `${n} weeks along`],
  [/^(\d+) uge i maven$/, (n) => `${n} week along`],
  [/^(\d+) uger gammel$/, (n) => `${n} weeks old`],
  [/^(\d+) uge gammel$/, (n) => `${n} week old`],
  [/^(\d+) uger$/, (n) => `${n} weeks`],
  [/^(\d+) uge$/, (n) => `${n} week`],
  [/^(\d+) måneder gammel$/, (n) => `${n} months old`],
  [/^(\d+) måned gammel$/, (n) => `${n} month old`],
  [/^(\d+) måneder$/, (n) => `${n} months`],
  [/^(\d+) måned$/, (n) => `${n} month`],
  [/^(\d+) års fødselsdag$/, (n) => `${ORDINAL[n] || n + 'th'} birthday`],
  [/^(\d+) år gammel$/, (n) => `${n} years old`],
];

/**
 * Oversaet én dansk milepaelstekst. Kendes teksten ikke, returneres den
 * uaendret — saa forsvinder en ny ramme ikke, den staar bare paa dansk.
 */
export function milestoneTextEn(text) {
  if (!text) return text;
  const trimmed = String(text).trim();
  if (PHRASES[trimmed]) return PHRASES[trimmed];
  for (const [re, build] of PATTERNS) {
    const m = trimmed.match(re);
    if (m) return build(Number(m[1]));
  }
  return text;
}

/**
 * Laeg engelsk oven paa en ramme. En engelsk tekst skrevet direkte paa rammen
 * vinder; ellers slaas den danske tekst op. Paa dansk roeres rammen ikke.
 */
export function localizeFrame(frame, lang) {
  if (!frame || lang !== 'en') return frame;
  return {
    ...frame,
    label: frame.label_en || milestoneTextEn(frame.label),
    headline: frame.headline_en || milestoneTextEn(frame.headline),
    subline: frame.subline_en || milestoneTextEn(frame.subline),
  };
}

export default localizeFrame;
