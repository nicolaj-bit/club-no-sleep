import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Moon, Sun, Clock, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { toast } from 'sonner';

const SLEEP_METHODS = [
  { value: 'selv', label: 'Selv' },
  { value: 'amning', label: 'Amning' },
  { value: 'flaske', label: 'Flaske' },
  { value: 'vugning', label: 'Vugning' },
  { value: 'barnevogn', label: 'Barnevogn' },
  { value: 'med_forælder', label: 'Med forælder' },
];

const MOODS = [
  { value: 'frisk', label: 'Frisk', emoji: '😊' },
  { value: 'lidt_træt', label: 'Lidt træt', emoji: '😴' },
  { value: 'meget_træt', label: 'Meget træt', emoji: '😪' },
  { value: 'overtræt', label: 'Overtræt', emoji: '😩' },
];

const WAKING_METHODS = ['Amning', 'Flaske', 'Vugning', 'Sig i søvn', 'Barnevogn', 'Sov selv'];

function TimeInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
      />
    </div>
  );
}

export default function SleepLog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({
    date: today,
    child_age_months: '',
    bedtime: '',
    sleep_time: '',
    wake_time: '',
    night_wakings: [],
    naps: [],
    sleep_method: '',
    bedtime_mood: '',
    parent_note: '',
  });

  const [view, setView] = useState('log'); // 'log' | 'history'

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      // Auto-calculate child age from profile
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      const profile = profiles?.[0];
      if (profile?.child_birthdate) {
        const birth = new Date(profile.child_birthdate);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        setForm(f => ({ ...f, child_age_months: Math.max(0, months) }));
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  // Load today's log if exists
  const { data: todayLog } = useQuery({
    queryKey: ['sleeplog-today', user?.email, today],
    queryFn: () => base44.entities.SleepLog.filter({ user_email: user.email, date: today }),
    enabled: !!user,
    onSuccess: (data) => {
      if (data?.length > 0) {
        const log = data[0];
        setForm({
          date: log.date || today,
          child_age_months: log.child_age_months || '',
          bedtime: log.bedtime || '',
          sleep_time: log.sleep_time || '',
          wake_time: log.wake_time || '',
          night_wakings: log.night_wakings || [],
          naps: log.naps || [],
          sleep_method: log.sleep_method || '',
          bedtime_mood: log.bedtime_mood || '',
          parent_note: log.parent_note || '',
        });
      }
    }
  });

  const { data: history } = useQuery({
    queryKey: ['sleeplog-history', user?.email],
    queryFn: () => base44.entities.SleepLog.filter({ user_email: user.email }, '-date', 30),
    enabled: !!user && view === 'history',
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate minutes_to_sleep
      let mts = null;
      if (data.bedtime && data.sleep_time) {
        const [bh, bm] = data.bedtime.split(':').map(Number);
        const [sh, sm] = data.sleep_time.split(':').map(Number);
        mts = (sh * 60 + sm) - (bh * 60 + bm);
        if (mts < 0) mts += 24 * 60;
      }
      const payload = { ...data, user_email: user.email, minutes_to_sleep: mts };
      const existing = todayLog?.[0];
      if (existing) {
        return base44.entities.SleepLog.update(existing.id, payload);
      } else {
        return base44.entities.SleepLog.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sleeplog-today']);
      queryClient.invalidateQueries(['sleeplog-history']);
      toast.success('Søvnlog gemt ✓');
    }
  });

  const addWaking = () => {
    setForm(f => ({ ...f, night_wakings: [...f.night_wakings, { time: '', method: '' }] }));
  };

  const removeWaking = (i) => {
    setForm(f => ({ ...f, night_wakings: f.night_wakings.filter((_, idx) => idx !== i) }));
  };

  const updateWaking = (i, field, val) => {
    setForm(f => {
      const updated = [...f.night_wakings];
      updated[i] = { ...updated[i], [field]: val };
      return { ...f, night_wakings: updated };
    });
  };

  const addNap = () => {
    if (form.naps.length >= 4) return;
    setForm(f => ({ ...f, naps: [...f.naps, { start: '', end: '' }] }));
  };

  const removeNap = (i) => {
    setForm(f => ({ ...f, naps: f.naps.filter((_, idx) => idx !== i) }));
  };

  const updateNap = (i, field, val) => {
    setForm(f => {
      const updated = [...f.naps];
      updated[i] = { ...updated[i], [field]: val };
      return { ...f, naps: updated };
    });
  };

  const calcNapMinutes = (nap) => {
    if (!nap.start || !nap.end) return null;
    const [sh, sm] = nap.start.split(':').map(Number);
    const [eh, em] = nap.end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : null;
  };

  const calcNightMinutes = () => {
    if (!form.bedtime || !form.wake_time) return null;
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [wh, wm] = form.wake_time.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const calcSleepToSleep = () => {
    if (!form.bedtime || !form.sleep_time) return null;
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [sh, sm] = form.sleep_time.split(':').map(Number);
    let diff = (sh * 60 + sm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const nightMinutes = calcNightMinutes();
  const fallAsleepMinutes = calcSleepToSleep();

  const openAIWithLogs = async () => {
    navigate(createPageUrl('AIChat') + '?with_logs=1');
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-4 pt-12 pb-3 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')} className="p-2 rounded-full" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Søvnlog</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(v => v === 'log' ? 'history' : 'log')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {view === 'log' ? 'Historik' : 'Log i dag'}
          </button>
        </div>
      </div>

      {view === 'history' ? (
        <HistoryView history={history} />
      ) : (
        <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
          {/* Date + Age */}
          <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Dato</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Alder (måneder)</label>
                <input
                  type="number"
                  value={form.child_age_months}
                  onChange={(e) => setForm(f => ({ ...f, child_age_months: e.target.value }))}
                  placeholder="f.eks. 8"
                  className="px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Night sleep */}
          <Section icon={<Moon className="w-4 h-4" />} title="Nat">
            <div className="grid grid-cols-3 gap-3">
              <TimeInput label="Sengetid" value={form.bedtime} onChange={(v) => setForm(f => ({ ...f, bedtime: v }))} />
              <TimeInput label="Faldt i søvn" value={form.sleep_time} onChange={(v) => setForm(f => ({ ...f, sleep_time: v }))} />
              <TimeInput label="Vågnede" value={form.wake_time} onChange={(v) => setForm(f => ({ ...f, wake_time: v }))} />
            </div>
            {/* Stats */}
            <div className="flex gap-3 mt-3">
              {nightMinutes !== null && (
                <Chip label={`Nat: ${Math.floor(nightMinutes / 60)}t ${nightMinutes % 60}m`} color="blue" />
              )}
              {fallAsleepMinutes !== null && (
                <Chip
                  label={`Sovnet på: ${fallAsleepMinutes} min`}
                  color={fallAsleepMinutes > 30 ? 'red' : fallAsleepMinutes > 15 ? 'yellow' : 'green'}
                />
              )}
            </div>
          </Section>

          {/* Night wakings */}
          <Section icon={<Moon className="w-4 h-4 opacity-50" />} title="Natlige opvågninger">
            {form.night_wakings.map((w, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="time"
                  value={w.time}
                  onChange={(e) => updateWaking(i, 'time', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <select
                  value={w.method}
                  onChange={(e) => updateWaking(i, 'method', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="">Metode...</option>
                  {WAKING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button onClick={() => removeWaking(i)} className="p-2 hover:text-red-500" style={{ color: 'var(--color-text-muted)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addWaking} className="flex items-center gap-2 text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              <Plus className="w-4 h-4" /> Tilføj opvågning
            </button>
          </Section>

          {/* Naps */}
          <Section icon={<Sun className="w-4 h-4" />} title="Lure">
            {form.naps.map((nap, i) => {
              const mins = calcNapMinutes(nap);
              return (
                <div key={i} className="flex gap-2 items-center">
                  <div className="text-xs w-12 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>Lur {i + 1}</div>
                  <input
                    type="time"
                    value={nap.start}
                    onChange={(e) => updateNap(i, 'start', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <input
                    type="time"
                    value={nap.end}
                    onChange={(e) => updateNap(i, 'end', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  {mins && <span className="text-xs w-12 text-right" style={{ color: 'var(--color-text-muted)' }}>{mins}m</span>}
                  <button onClick={() => removeNap(i)} className="p-2 hover:text-red-500" style={{ color: 'var(--color-text-muted)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {form.naps.length < 4 && (
              <button onClick={addNap} className="flex items-center gap-2 text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                <Plus className="w-4 h-4" /> Tilføj lur
              </button>
            )}
          </Section>

          {/* Sleep method */}
          <Section icon={<Clock className="w-4 h-4" />} title="Hvordan faldt barnet i søvn?">
            <div className="flex flex-wrap gap-2">
              {SLEEP_METHODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setForm(f => ({ ...f, sleep_method: f.sleep_method === m.value ? '' : m.value }))}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={form.sleep_method === m.value
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'var(--color-primary)' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Mood */}
          <Section icon={<span className="text-base">😊</span>} title="Humør før sengetid">
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setForm(f => ({ ...f, bedtime_mood: f.bedtime_mood === m.value ? '' : m.value }))}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5"
                  style={form.bedtime_mood === m.value
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'var(--color-primary)' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section icon={<span className="text-base">📝</span>} title="Noter">
            <textarea
              value={form.parent_note}
              onChange={(e) => setForm(f => ({ ...f, parent_note: e.target.value }))}
              placeholder="Hvad skete der i dag? Urolig aften? Ny tand?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
              style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </Section>

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #A0785A, #7A5535)' }}
            >
              {saveMutation.isPending ? 'Gemmer...' : 'Gem søvnlog'}
            </button>

            <button
              onClick={openAIWithLogs}
              className="w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Få AI-analyse af min søvndata
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm space-y-3" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Chip({ label, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[color] || colors.blue}`}>{label}</span>
  );
}

function HistoryView({ history }) {
  if (!history) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-text-secondary)' }} /></div>;

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
      <Moon className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm">Ingen logs endnu</p>
    </div>
  );

  return (
    <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
      {history.map(log => {
        const totalNapMins = (log.naps || []).reduce((sum, n) => {
          if (!n.start || !n.end) return sum;
          const [sh, sm] = n.start.split(':').map(Number);
          const [eh, em] = n.end.split(':').map(Number);
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          return sum + (diff > 0 ? diff : 0);
        }, 0);

        let nightMins = null;
        if (log.bedtime && log.wake_time) {
          const [bh, bm] = log.bedtime.split(':').map(Number);
          const [wh, wm] = log.wake_time.split(':').map(Number);
          let diff = (wh * 60 + wm) - (bh * 60 + bm);
          if (diff < 0) diff += 24 * 60;
          nightMins = diff;
        }

        return (
          <div key={log.id} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {format(new Date(log.date), 'd. MMM', { locale: da })}
              </span>
              {log.bedtime_mood && (
                <span className="text-lg">{MOODS.find(m => m.value === log.bedtime_mood)?.emoji}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {log.bedtime && <Chip label={`Seng: ${log.bedtime}`} color="blue" />}
              {nightMins !== null && <Chip label={`Nat: ${Math.floor(nightMins / 60)}t ${nightMins % 60}m`} color="green" />}
              {(log.night_wakings?.length || 0) > 0 && <Chip label={`${log.night_wakings.length} opvågning${log.night_wakings.length > 1 ? 'er' : ''}`} color="yellow" />}
              {totalNapMins > 0 && <Chip label={`Lure: ${Math.floor(totalNapMins / 60)}t ${totalNapMins % 60}m`} color="blue" />}
              {log.minutes_to_sleep != null && <Chip label={`Sovnet: ${log.minutes_to_sleep}m`} color={log.minutes_to_sleep > 30 ? 'red' : 'green'} />}
            </div>
            {log.parent_note && <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>"{log.parent_note}"</p>}
          </div>
        );
      })}
    </div>
  );
}