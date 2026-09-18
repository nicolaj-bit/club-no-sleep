import { Preferences } from '@capacitor/preferences';

// Kortspils-udvælgelse af daglig affirmation: hele bunken blandes tilfældigt,
// og der trækkes ét kort om dagen. Bunken gemmes pr. enhed/bruger i Preferences.
const DECK_KEY = 'cns_affirmation_deck';
const INDEX_KEY = 'cns_affirmation_index';
const DATE_KEY = 'cns_affirmation_date';

function todayStr() {
  return new Date().toDateString();
}

// Fisher-Yates. Hvis avoidFirst er sat, må det tal ikke blive det første kort.
function shuffledIndices(count, avoidFirst) {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (avoidFirst != null && arr.length > 1 && arr[0] === avoidFirst) {
    const swapWith = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[swapWith]] = [arr[swapWith], arr[0]];
  }
  return arr;
}

async function persist(deck, position, date) {
  try {
    await Promise.all([
      Preferences.set({ key: DECK_KEY, value: JSON.stringify(deck) }),
      Preferences.set({ key: INDEX_KEY, value: String(position) }),
      Preferences.set({ key: DATE_KEY, value: date }),
    ]);
  } catch {}
}

// Returnerer indexet (0..count-1) af dagens affirmation i den aktuelle liste.
export async function getDailyAffirmationCardIndex(count) {
  if (!count || count <= 0) return 0;

  let deck = null;
  let position = 0;
  let lastDate = null;

  try {
    const [deckRes, indexRes, dateRes] = await Promise.all([
      Preferences.get({ key: DECK_KEY }),
      Preferences.get({ key: INDEX_KEY }),
      Preferences.get({ key: DATE_KEY }),
    ]);
    deck = deckRes.value ? JSON.parse(deckRes.value) : null;
    position = indexRes.value ? parseInt(indexRes.value, 10) : 0;
    lastDate = dateRes.value || null;
  } catch {}

  const today = todayStr();
  const deckValid = Array.isArray(deck) && deck.length === count
    && deck.every(n => Number.isInteger(n) && n >= 0 && n < count);

  // Ingen gyldig bunke endnu (første gang, eller listen har ændret størrelse) — bland en ny.
  if (!deckValid) {
    const lastShown = Array.isArray(deck) && deck.length > 0 ? deck[Math.min(position, deck.length - 1)] : null;
    deck = shuffledIndices(count, lastShown);
    position = 0;
    await persist(deck, position, today);
    return deck[position];
  }

  // Samme dato — samme kort, skifter ikke ved genåbning af forsiden.
  if (lastDate === today) {
    return deck[Math.min(position, deck.length - 1)];
  }

  // Ny dag — træk næste kort i bunken.
  position += 1;
  if (position >= deck.length) {
    const lastShown = deck[deck.length - 1];
    deck = shuffledIndices(count, lastShown);
    position = 0;
  }
  await persist(deck, position, today);
  return deck[position];
}