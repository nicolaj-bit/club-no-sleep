import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, value } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch { return null; }
}

function setCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
  } catch {}
}

function getTimeOfDay(lang) {
  const h = new Date().getHours();
  const da = ['nat', 'morgen', 'formiddag', 'eftermiddag', 'aften'];
  const en = ['night', 'morning', 'late morning', 'afternoon', 'evening'];
  const words = lang === 'en' ? en : da;
  if (h < 6) return words[0];
  if (h < 10) return words[1];
  if (h < 14) return words[2];
  if (h < 18) return words[3];
  return words[4];
}

function formatDateDa() {
  return new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
}

function buildPrompt(profile, lang) {
  const motherName = profile?.display_name || profile?.username || '';
  const babyAge = (() => {
    const bd = profile?.child_birthdate || profile?.child_due_date;
    if (!bd) return null;
    const months = Math.floor((Date.now() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return months >= 0 ? `${months} måneder` : null;
  })();

  if (lang !== 'en') {
    return `Du skriver en kort daglig affirmation til forsiden af en dansk app for mødre med babyer og småbørn.
Affirmationen vises, når brugeren logger ind. Den skal føles som en enkel, varm og styrkende sætning, moderen kan tage med sig ind i dagen.
Formålet er at give moderen et lille øjeblik af ro, selvværd, mod og kærlig bekræftelse.
Affirmationen skal være positiv, men ikke amerikansk, overdrevet, cheesy eller kunstig.
Den skal være: dansk, kort, varm, jordnær, rolig, styrkende, menneskelig, blød, ikke klinisk, ikke spirituel, ikke terapeutisk, ikke som en coach, ikke som en reklame, ikke som en selvhjælpsplakat.
Skriv i jeg form.
Affirmationen skal helst lyde som noget, en dansk mor faktisk kan sige til sig selv uden at krumme tæer.

Undgå formuleringer som: "Jeg er en supermor", "Jeg kan klare alt", "Jeg stråler af guddommelig energi", "Jeg vælger lykken", "Jeg manifesterer ro", "Alt sker af en grund", "Jeg er perfekt", "Jeg elsker hvert øjeblik", "Jeg håndterer alt med elegance og overskud", "Jeg er fantastisk på alle måder", "Jeg er stærkest når jeg aldrig giver op".

Skriv ikke gode råd. Skriv ikke forklaringer. Skriv ikke som en analyse. Skriv ikke om konkrete symptomer. Skriv ikke om sygdom. Skriv ikke en lang tekst.

Format: 1 til 2 sætninger. Maks 25 ord. Ingen emojis. Ingen udråbstegn. Ingen engelske vendinger. Ingen bindestreger. Ingen overskrift. Returner kun selve affirmationen.

Affirmationen må gerne være mildt poetisk, men den skal stadig være enkel og naturlig.

Inputdata (bruges kun meget diskret til stemning):
Mors navn: ${motherName || 'ukendt'}
Barnets alder: ${babyAge || 'ukendt'}
Tidspunkt på dagen: ${getTimeOfDay(lang)}

Gode eksempler på ønsket tone:
"Jeg er nok, også når dagen ikke bliver, som jeg havde håbet."
"Jeg må gerne tale til mig selv med samme varme, som jeg giver mit barn."
"Jeg stoler på, at jeg kender mit barn bedst."
"Jeg er mere end det, jeg når i dag."
"Jeg lærer at være mor, mens mit barn lærer verden at kende."
"Jeg må gerne bede om hjælp. Det gør mig ikke mindre stærk."
"Jeg er en tryg base, også når jeg selv er træt."
"Jeg behøver ikke være perfekt for at være en god mor."
"Jeg kan være både træt og taknemmelig på samme tid."
"Jeg gør det bedre, end jeg selv kan se lige nu."`;
  }

  // Den engelske udgave skal ville det samme som den danske: varm, jordnaer,
  // og netop ikke amerikansk selvhjaelp. Derfor er den skrevet som en egen
  // tekst og ikke som en oversaettelse af den danske saetning for saetning.
  return `You are writing a short daily affirmation for the home screen of an app for mothers with babies and small children.
The affirmation is shown when the user opens the app. It should feel like a simple, warm, steadying sentence she can carry into her day.
The purpose is to give her a small moment of calm, self-worth, courage and kind reassurance.
It should be positive, but never American self-help, exaggerated, cheesy or artificial.
It should be: short, warm, grounded, calm, steadying, human, soft, not clinical, not spiritual, not therapeutic, not like a coach, not like an advertisement, not like a motivational poster.
Write in the first person.
It should sound like something a tired mother could actually say to herself without cringing.

Avoid phrasings such as: "I am a supermum", "I can handle anything", "I radiate divine energy", "I choose happiness", "I manifest calm", "Everything happens for a reason", "I am perfect", "I love every moment", "I handle everything with grace and ease", "I am amazing in every way", "I am strongest when I never give up".

Do not write advice. Do not write explanations. Do not write an analysis. Do not write about specific symptoms. Do not write about illness. Do not write a long text.

Format: 1 to 2 sentences. 25 words maximum. No emojis. No exclamation marks. No dashes. No heading. Return only the affirmation itself.

The affirmation may be mildly poetic, but it must stay simple and natural.

Mother's name: ${motherName || 'unknown'}
Child's age: ${babyAge || 'unknown'}
Time of day: ${getTimeOfDay(lang)}

Good examples of the tone we want:
"I am enough, even on the days that do not turn out as I hoped."
"I may speak to myself with the same warmth I give my child."
"I trust that I know my child best."
"I am more than what I get done today."
"I am learning to be a mother while my child is learning the world."
"I am allowed to ask for help. It does not make me any less strong."
"I am a safe place, even when I am tired myself."
"I do not have to be perfect to be a good mother."
"I can be tired and grateful at the same time."
"I am doing better than I can see right now."`;
}

export default function DailyPersonalMessage({ userEmail, profile }) {
  const { t, lang } = useLanguage();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userEmail || !profile || fetchedRef.current === lang) return;
    fetchedRef.current = lang;

    // Sproget er med i noeglen: ellers ville en gemt dansk affirmation blive
    // vist, efter at brugeren har skiftet til engelsk.
    const cacheKey = `daily-msg-${lang}-${userEmail}-${new Date().toDateString()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setMessage(cached);
      setLoading(false);
      return;
    }

    const prompt = buildPrompt(profile, lang);
    base44.integrations.Core.InvokeLLM({ prompt }).then(text => {
        const msg = typeof text === 'string' ? text.trim() : '';
        if (msg) {
          setCache(cacheKey, msg);
          setMessage(msg);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [userEmail, profile, lang]);

  if (loading || !message) return null;

  return (
    <div className="mx-5 mb-5">
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', border: '1px solid var(--color-border)' }}
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--color-text-muted)' }}>{t.dailyAffirmation}</p>
        <p
          className="text-[16px] font-light leading-relaxed"
          style={{ textWrap: 'pretty', fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: '1.55', color: 'var(--color-text-primary)' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}