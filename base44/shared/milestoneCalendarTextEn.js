// Engelske overskrifter til de milepaels-kalenderaftaler, backend opretter.
//
// Aftalerne gemmes i databasen med teksten skrevet ind, saa teksten vaelges
// paa det tidspunkt, aftalen oprettes — ud fra ejerens sprog.
//
// Aldersmilepaelene foelger et moenster og klares med regler. Graviditets-
// ugerne har hver sin overskrift og staar derfor i et opslag.

const WEEK_HEADLINES = {
  'Uge 4 – Det begynder!': 'Week 4 – It begins!',
  'Uge 5 – Hjertet slår': 'Week 5 – The heart is beating',
  'Uge 6 – Arme og ben spirer': 'Week 6 – Arms and legs are budding',
  'Uge 7 – Hjernen vokser': 'Week 7 – The brain is growing',
  'Uge 8 – Alle organer anlagt': 'Week 8 – All organs have formed',
  'Uge 9 – Barnet bevæger sig': 'Week 9 – Baby is moving',
  'Uge 10 – Knoglerne hærder': 'Week 10 – The bones are hardening',
  'Uge 11 – Næsten ud af første trimester': 'Week 11 – Almost out of the first trimester',
  'Uge 12 – Fingeraftryk dannes': 'Week 12 – Fingerprints are forming',
  'Uge 13 – Andet trimester!': 'Week 13 – Second trimester!',
  'Uge 14 – Negle og tænder': 'Week 14 – Nails and teeth',
  'Uge 15 – Du kan snart mærke bevægelser': 'Week 15 – You may soon feel movement',
  'Uge 16 – Barnet kan høre dig': 'Week 16 – Baby can hear you',
  'Uge 17 – Fedt aflejres': 'Week 17 – Fat is being laid down',
  'Uge 18 – Bevægelser mærkes nu': 'Week 18 – Movements can be felt now',
  'Uge 19 – Midt i graviditeten': 'Week 19 – Midway through the pregnancy',
  'Uge 20 – HALVVEJS! 🎉': 'Week 20 – HALFWAY! 🎉',
  'Uge 21 – Smagssansen aktiv': 'Week 21 – The sense of taste is active',
  'Uge 22 – Fingeraftryk er unikt': 'Week 22 – The fingerprints are unique',
  'Uge 23 – Lungerne modnes': 'Week 23 – The lungs are maturing',
  'Uge 24 – En vigtig milepæl': 'Week 24 – An important milestone',
  'Uge 25 – Barnet kan gribe': 'Week 25 – Baby can grasp',
  'Uge 26 – Øjnene åbner sig': 'Week 26 – The eyes are opening',
  'Uge 27 – Tredje trimester snart': 'Week 27 – Third trimester soon',
  'Uge 28 – 1 kg!': 'Week 28 – 1 kg!',
  'Uge 29 – Hjernen vokser hurtigt': 'Week 29 – The brain is growing fast',
  'Uge 30 – Snart der!': 'Week 30 – Almost there!',
  'Uge 31 – Alle sanser aktive': 'Week 31 – All the senses are active',
  'Uge 32 – Barnet vender sig': 'Week 32 – Baby is turning',
  'Uge 33 – Øver vejrtrækning': 'Week 33 – Practising breathing',
  'Uge 34 – Lungerne næsten modne': 'Week 34 – The lungs are nearly mature',
  'Uge 35 – Råmælk kan starte': 'Week 35 – Colostrum may start',
  'Uge 36 – Snart fuldbåren': 'Week 36 – Almost full term',
  'Uge 37 – FULDBÅREN! 🌟': 'Week 37 – FULL TERM! 🌟',
  'Uge 38 – Klar til mødet': 'Week 38 – Ready to meet you',
  'Uge 39 – Enhver dag nu': 'Week 39 – Any day now',
  'Uge 40 – TERMINEN! 👶': 'Week 40 – THE DUE DATE! 👶',
  'Uge 41 – Lidt tålmodighed endnu': 'Week 41 – A little more patience',
  'Uge 42 – Snart tid for igangsætning': 'Week 42 – Induction may be near',
};

const AGE_PATTERNS = [
  [/^(\d+) uge gammel$/, (n) => `${n} week old`],
  [/^(\d+) uger gammel$/, (n) => `${n} weeks old`],
  [/^(\d+) måned gammel$/, (n) => `${n} month old`],
  [/^(\d+) måneder gammel$/, (n) => `${n} months old`],
  [/^(\d+) måneder gammel — Halvt et år! 🌟$/, (n) => `${n} months old — Half a year! 🌟`],
  [/^(\d+) års fødselsdag — Tillykke! 🎉$/, (n) => `${['', '1st', '2nd', '3rd'][n] || n + 'th'} birthday — Happy birthday! 🎉`],
];

/**
 * Oversaet én dansk milepaelsoverskrift. Kendes den ikke, returneres den
 * uaendret, saa en ny milepael ikke forsvinder — den staar bare paa dansk.
 */
export function milestoneHeadlineEn(headline) {
  if (!headline) return headline;
  const t = String(headline).trim();
  if (WEEK_HEADLINES[t]) return WEEK_HEADLINES[t];
  for (const [re, build] of AGE_PATTERNS) {
    const m = t.match(re);
    if (m) return build(Number(m[1]));
  }
  return headline;
}

/** Overskriften paa det valgte sprog. */
export function milestoneHeadline(headline, lang) {
  return lang === 'en' ? milestoneHeadlineEn(headline) : headline;
}

export default milestoneHeadline;
