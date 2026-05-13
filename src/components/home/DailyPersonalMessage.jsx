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

function buildPrompt(profile, logs) {
  const motherName = profile?.display_name || profile?.username || '';
  const babyName = '';
  const babyAge = (() => {
    const bd = profile?.child_birthdate;
    if (!bd) return 'ukendt';
    const months = Math.floor((Date.now() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return `${months} måneder`;
  })();

  const today = logs[0];
  const prev = logs.slice(1, 4);

  const totalSleep = (() => {
    if (!today?.bedtime || !today?.wake_time) return 'ukendt';
    const [bh, bm] = today.bedtime.split(':').map(Number);
    const [wh, wm] = today.wake_time.split(':').map(Number);
    const bedMins = bh * 60 + bm;
    const wakeMins = wh * 60 + wm;
    const diff = wakeMins < bedMins ? (wakeMins + 1440 - bedMins) : (wakeMins - bedMins);
    return `${Math.floor(diff / 60)}t ${diff % 60}m`;
  })();

  const wakeups = today?.wakings?.length || 0;
  const naps = today?.naps?.length || 0;
  const napDurations = today?.naps?.map(n => {
    if (!n.start || !n.end) return null;
    const [sh, sm] = n.start.split(':').map(Number);
    const [eh, em] = n.end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }).filter(Boolean) || [];
  const shortestNap = napDurations.length ? Math.min(...napDurations) + ' min' : 'ukendt';
  const longestNap = napDurations.length ? Math.max(...napDurations) + ' min' : 'ukendt';
  const manyShortNaps = napDurations.filter(d => d < 30).length >= 2 ? 'ja' : 'nej';

  const avgPrev = prev.length ? (prev.reduce((s, l) => s + (l?.wakings?.length || 0), 0) / prev.length).toFixed(1) : null;
  const severalHardNights = avgPrev && wakeups >= 3 && Number(avgPrev) >= 2.5 ? 'ja' : 'nej';
  const betterThanUsual = avgPrev && wakeups < Number(avgPrev) - 1 ? 'ja' : 'nej';
  const lessSleepThanUsual = 'nej';
  const earlyMorning = today?.wake_time ? parseInt(today.wake_time) < 6 ? 'ja' : 'nej' : 'nej';
  const sleepTrend = prev.length >= 2
    ? ((prev[0]?.wakings?.length || 0) > (prev[prev.length - 1]?.wakings?.length || 0) ? 'faldende' : 'stigende')
    : 'ukendt';

  const userNotes = today?.notes || '';

  return `Du skriver en daglig personlig besked til en mor i en dansk babyapp.

Beskeden vises på forsiden, når brugeren har registreret en baby. Den skal føles som en lille rolig hilsen, der møder moderen dér, hvor hun er.

Inputdata:
Mors navn: ${motherName}
Barnets navn: ${babyName}
Barnets alder: ${babyAge}
Dato: ${formatDateDa()}
Tidspunkt: ${getTimeOfDay()}

Søvn sidste nat:
Samlet søvn: ${totalSleep}
Antal opvågninger: ${wakeups}
Tidlig morgenstart: ${earlyMorning}

Lure:
Antal lure i går: ${naps}
Korteste lur: ${shortestNap}
Længste lur: ${longestNap}
Mange korte lure: ${manyShortNaps}

Mønstre:
Søvntrend seneste 3 dage: ${sleepTrend}
Flere svære nætter i træk: ${severalHardNights}
Bedre nat end normalt: ${betterThanUsual}
Mindre søvn end normalt: ${lessSleepThanUsual}

Brugerens egne noter: ${userNotes || 'ingen'}

---

Vigtige regler:
- Skriv på dansk
- 2 til 4 sætninger, maks 65 ord
- Ingen emojis, ingen udråbstegn, ingen engelske vendinger, ingen bindestreger
- Ingen råd, forslag, løsninger eller opfordringer
- Brug forståelse frem for handling
- Tonen er varm, jordnær, rolig, mildt poetisk — ikke cheesy, ikke motiverende
- Skriv direkte til moderen
- Returner KUN selve beskeden, ingen overskrift, ingen forklaring`;
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

    base44.entities.SleepLog.list('-date', 5).then(logs => {
      logs = logs.filter(l => l.user_email === userEmail);
      if (!logs.length) {
        setLoading(false);
        return;
      }

      const prompt = buildPrompt(profile, logs);

      base44.integrations.Core.InvokeLLM({ prompt }).then(text => {
        const msg = typeof text === 'string' ? text.trim() : '';
        if (msg) {
          setCache(cacheKey, msg);
          setMessage(msg);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [userEmail, profile]);

  if (loading || !message) return null;

  return (
    <div className="mx-5 mb-5">
      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', border: '1px solid var(--color-border)' }}
      >
        <p
          className="text-sm leading-relaxed italic"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'Georgia, serif', lineHeight: '1.7' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}