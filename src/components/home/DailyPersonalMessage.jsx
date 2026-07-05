import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

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

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return 'nat';
  if (h < 10) return 'morgen';
  if (h < 14) return 'formiddag';
  if (h < 18) return 'eftermiddag';
  return 'aften';
}

function formatDateDa() {
  return new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
}

function buildPrompt(profile) {
  const motherName = profile?.display_name || profile?.username || '';
  const babyAge = (() => {
    const bd = profile?.child_birthdate || profile?.child_due_date;
    if (!bd) return null;
    const months = Math.floor((Date.now() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return months >= 0 ? `${months} måneder` : null;
  })();

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
Tidspunkt på dagen: ${getTimeOfDay()}

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

export default function DailyPersonalMessage({ userEmail, profile }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userEmail || !profile || fetchedRef.current) return;
    fetchedRef.current = true;

    const cacheKey = `daily-msg-${userEmail}-${new Date().toDateString()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setMessage(cached);
      setLoading(false);
      return;
    }

    const prompt = buildPrompt(profile);
    base44.integrations.Core.InvokeLLM({ prompt }).then(text => {
        const msg = typeof text === 'string' ? text.trim() : '';
        if (msg) {
          setCache(cacheKey, msg);
          setMessage(msg);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [userEmail, profile]);

  if (loading || !message) return null;

  return (
    <div className="mx-5 mb-5">
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', border: '1px solid var(--color-border)' }}
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: '#808072' }}>Daglig affirmation</p>
        <p
          className="text-[16px] font-light leading-relaxed"
          style={{ textWrap: 'pretty', fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: '1.55', color: '#2B1F16' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}