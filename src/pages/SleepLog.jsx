import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Moon, Sun, Clock, ChevronLeft, Sparkles, BookOpen, RefreshCw, X } from 'lucide-react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { Link, useNavigate } from 'react-router-dom';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTheme } from '@/components/ui/ThemeProvider';



function TimeInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-all"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{title}</h2>
    </div>
  );
}

function Chip({ label, color }) {
  const colors = {
    blue: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
    green: { backgroundColor: '#F0FDF4', color: '#15803D' },
    yellow: { backgroundColor: '#FEFCE8', color: '#A16207' },
    red: { backgroundColor: '#FEF2F2', color: '#B91C1C' },
  };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={colors[color] || colors.blue}>
      {label}
    </span>
  );
}

export default function SleepLog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const headerVisible = useScrollDirection();
  const { activeProfile } = useActiveProfile();
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();
  const dateLocale = lang === 'en' ? enUS : da;

  const SLEEP_METHODS = [
    { value: 'selv', label: t.sleepMethodSelf, emoji: '🧸' },
    { value: 'amning', label: t.sleepMethodNursing, emoji: '🤱' },
    { value: 'flaske', label: t.sleepMethodBottle, emoji: '🍼' },
    { value: 'vugning', label: t.sleepMethodRocking, emoji: '🎵' },
    { value: 'barnevogn', label: t.sleepMethodPram, emoji: '🚗' },
    { value: 'med_forælder', label: t.sleepMethodParent, emoji: '🫶' },
  ];
  const MOODS = [
    { value: 'frisk', label: t.moodFresh, emoji: '😊' },
    { value: 'lidt_træt', label: t.moodLittleTired, emoji: '😴' },
    { value: 'meget_træt', label: t.moodVeryTired, emoji: '😪' },
    { value: 'overtræt', label: t.moodOvertired, emoji: '😩' },
  ];
  const WAKING_METHODS = [t.wakingMethodNursing, t.wakingMethodBottle, t.wakingMethodRocking, t.wakingMethodSing, t.wakingMethodPram, t.wakingMethodSelf];
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [view, setView] = useState('log');
  const [aiCard, setAiCard] = useState(null); // null | 'loading' | { title, message, pattern }


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

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
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

  const profileId = activeProfile?.id;

  const { data: todayLog } = useQuery({
    queryKey: ['sleeplog-today', user?.email, profileId, today],
    queryFn: () => base44.entities.SleepLog.filter({ user_email: user.email, profile_id: profileId || null, date: today }),
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
    queryKey: ['sleeplog-history', user?.email, profileId],
    queryFn: () => base44.entities.SleepLog.filter({ user_email: user.email, profile_id: profileId || null }, '-date', 30),
    enabled: !!user && view === 'history',
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let mts = null;
      if (data.bedtime && data.sleep_time) {
        const [bh, bm] = data.bedtime.split(':').map(Number);
        const [sh, sm] = data.sleep_time.split(':').map(Number);
        mts = (sh * 60 + sm) - (bh * 60 + bm);
        if (mts < 0) mts += 24 * 60;
      }
      const payload = { ...data, user_email: user.email, profile_id: profileId || null, minutes_to_sleep: mts };
      const existing = todayLog?.[0];
      if (existing) return base44.entities.SleepLog.update(existing.id, payload);
      return base44.entities.SleepLog.create(payload);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries(['sleeplog-today']);
      const prev = queryClient.getQueryData(['sleeplog-today', user?.email, profileId, today]);
      // Optimistically update the cache
      queryClient.setQueryData(['sleeplog-today', user?.email, profileId, today], old => {
        if (old?.length > 0) return [{ ...old[0], ...data }];
        return [{ ...data, id: '__optimistic__' }];
      });
      return { prev };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['sleeplog-today', user?.email, profileId, today], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sleeplog-today']);
      queryClient.invalidateQueries(['sleeplog-history']);
      toast.success(t.sleepLogSaved);
    }
  });

  const fetchAiAnalysis = async () => {
    setAiCard('loading');
    try {
      const res = await base44.functions.invoke('analyzeSleepLogs', {});
      setAiCard(res.data);
    } catch (e) {
      setAiCard({ title: t.aiErrorTitle, message: t.aiErrorMsg, pattern: null });
    }
  };

  const calcNightMinutes = () => {
    if (!form.bedtime || !form.wake_time) return null;
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [wh, wm] = form.wake_time.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const calcFallAsleep = () => {
    if (!form.bedtime || !form.sleep_time) return null;
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [sh, sm] = form.sleep_time.split(':').map(Number);
    let diff = (sh * 60 + sm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const nightMinutes = calcNightMinutes();
  const fallAsleepMinutes = calcFallAsleep();

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b px-4 pt-10 pb-2 flex items-center justify-between transition-transform duration-300"
        style={{
          background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)',
          borderColor: isDark ? 'var(--color-border)' : '#E8DDD2',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Link to={createPageUrl('Home')} className="p-1.5 rounded-full" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}>{t.sleepLogTitle}</h1>
        </div>
        <button
          onClick={() => setView(v => v === 'log' ? 'history' : 'log')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ background: 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', border: '1px solid #E8DDD2', color: 'var(--color-text-secondary)' }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {view === 'log' ? t.historyBtn : t.logTodayBtn}
        </button>
      </div>

      {view === 'history' ? (
        <HistoryView history={history} t={t} lang={lang} dateLocale={dateLocale} MOODS={MOODS} />
      ) : (
        <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">

          {/* Hero gradient card */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C8A882 0%, #A0785A 100%)' }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-10 bg-white translate-y-5 -translate-x-5" />
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">{t.todayLog}</p>
            <p className="text-white font-semibold text-lg relative z-10">
              {format(new Date(form.date), lang === 'en' ? "EEEE, MMMM d" : "EEEE 'd.' d. MMMM", { locale: dateLocale })}
            </p>
            {nightMinutes !== null && (
              <p className="text-white/80 text-sm mt-1 relative z-10">
                🌙 {Math.floor(nightMinutes / 60)}h {nightMinutes % 60}m {t.nightNap}
              </p>
            )}
          </div>

          {/* Date + Age */}
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.date}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.ageMonths}</label>
                <input
                  type="number"
                  value={form.child_age_months}
                  onChange={(e) => setForm(f => ({ ...f, child_age_months: e.target.value }))}
                  placeholder={t.agePlaceholder}
                  className="px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>
          </Card>

          {/* Night sleep */}
          <Card>
            <SectionTitle icon={<Moon className="w-4 h-4" />} title={t.nightSleep} />
            <div className="grid grid-cols-3 gap-3">
              <TimeInput label={t.bedtime} value={form.bedtime} onChange={(v) => setForm(f => ({ ...f, bedtime: v }))} />
              <TimeInput label={t.fellAsleep} value={form.sleep_time} onChange={(v) => setForm(f => ({ ...f, sleep_time: v }))} />
              <TimeInput label={t.wokeUp} value={form.wake_time} onChange={(v) => setForm(f => ({ ...f, wake_time: v }))} />
            </div>
            {(nightMinutes !== null || fallAsleepMinutes !== null) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {nightMinutes !== null && (
                  <Chip label={`🌙 ${Math.floor(nightMinutes / 60)}h ${nightMinutes % 60}m`} color="blue" />
                )}
                {fallAsleepMinutes !== null && (
                  <Chip
                    label={`${t.felAsleepIn} ${fallAsleepMinutes} min`}
                    color={fallAsleepMinutes > 30 ? 'red' : fallAsleepMinutes > 15 ? 'yellow' : 'green'}
                  />
                )}
              </div>
            )}
          </Card>

          {/* Night wakings */}
          <Card>
            <SectionTitle icon={<Moon className="w-4 h-4 opacity-40" />} title={t.nightWakings} />
            <div className="space-y-2">
              {form.night_wakings.map((w, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={w.time}
                    onChange={(e) => {
                      const updated = [...form.night_wakings];
                      updated[i] = { ...updated[i], time: e.target.value };
                      setForm(f => ({ ...f, night_wakings: updated }));
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-1.5">
                      {WAKING_METHODS.map(m => {
                        const sel = w.method === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              const updated = [...form.night_wakings];
                              updated[i] = { ...updated[i], method: sel ? '' : m };
                              setForm(f => ({ ...f, night_wakings: updated }));
                            }}
                            className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
                            style={sel
                              ? { background: 'linear-gradient(135deg,#C8A882,#A0785A)', color: '#fff', borderColor: 'transparent' }
                              : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                          >{m}</button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, night_wakings: f.night_wakings.filter((_, idx) => idx !== i) }))}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, night_wakings: [...f.night_wakings, { time: '', method: '' }] }))}
              className="flex items-center gap-2 text-sm mt-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Plus className="w-4 h-4" /> {t.addWaking}
            </button>
          </Card>

          {/* Naps */}
          <Card>
            <SectionTitle icon={<Sun className="w-4 h-4" />} title={t.naps} />
            <div className="space-y-2">
              {form.naps.map((nap, i) => {
                let mins = null;
                if (nap.start && nap.end) {
                  const [sh, sm] = nap.start.split(':').map(Number);
                  const [eh, em] = nap.end.split(':').map(Number);
                  const diff = (eh * 60 + em) - (sh * 60 + sm);
                  if (diff > 0) mins = diff;
                }
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs w-10 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{t.nap} {i + 1}</span>
                    <input
                      type="time"
                      value={nap.start}
                      onChange={(e) => {
                        const updated = [...form.naps];
                        updated[i] = { ...updated[i], start: e.target.value };
                        setForm(f => ({ ...f, naps: updated }));
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                    <input
                      type="time"
                      value={nap.end}
                      onChange={(e) => {
                        const updated = [...form.naps];
                        updated[i] = { ...updated[i], end: e.target.value };
                        setForm(f => ({ ...f, naps: updated }));
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                    {mins && <span className="text-xs w-10 text-right" style={{ color: 'var(--color-text-muted)' }}>{mins}m</span>}
                    <button
                      onClick={() => setForm(f => ({ ...f, naps: f.naps.filter((_, idx) => idx !== i) }))}
                      className="p-2 rounded-full"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            {form.naps.length < 4 && (
              <button
                onClick={() => setForm(f => ({ ...f, naps: [...f.naps, { start: '', end: '' }] }))}
                className="flex items-center gap-2 text-sm mt-2"
                style={{ color: 'var(--color-text-muted)' }}
                >
                <Plus className="w-4 h-4" /> {t.addNap}
              </button>
            )}
          </Card>

          {/* Sleep method */}
          <Card>
            <SectionTitle icon={<Clock className="w-4 h-4" />} title={t.howDidBabyFallAsleep} />
            <div className="flex flex-wrap gap-2">
              {SLEEP_METHODS.map(m => {
                const active = form.sleep_method === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setForm(f => ({ ...f, sleep_method: f.sleep_method === m.value ? '' : m.value }))}
                    className="px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5"
                    style={active
                      ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff', borderColor: 'transparent' }
                      : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    <span>{m.emoji}</span> {m.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Mood */}
          <Card>
            <SectionTitle icon={<span className="text-sm">😊</span>} title={t.moodBeforeBed} />
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => {
                const active = form.bedtime_mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setForm(f => ({ ...f, bedtime_mood: f.bedtime_mood === m.value ? '' : m.value }))}
                    className="px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5"
                    style={active
                      ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff', borderColor: 'transparent' }
                      : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <SectionTitle icon={<span className="text-sm">📝</span>} title={t.notes} />
            <textarea
              value={form.parent_note}
              onChange={(e) => setForm(f => ({ ...f, parent_note: e.target.value }))}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </Card>

          {/* AI Card */}
          {aiCard && (
            <div
              className="rounded-2xl p-5 relative"
              style={{ background: 'linear-gradient(135deg, #FDF6EC 0%, #F5E8D4 100%)', border: '1px solid #E8D5B7' }}
            >
              <button
                onClick={() => setAiCard(null)}
                className="absolute top-3 right-3 p-1 rounded-full opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <X className="w-4 h-4" />
              </button>
              {aiCard === 'loading' ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.aiAnalyzing}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-sm" style={{ color: '#5C3A1E', fontFamily: 'Georgia, serif' }}>{aiCard.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A4F2F' }}>{aiCard.message}</p>
                  <button
                    onClick={fetchAiAnalysis}
                    className="flex items-center gap-1.5 mt-3 text-xs"
                    style={{ color: '#A0785A' }}
                  >
                    <RefreshCw className="w-3 h-3" /> {t.updateAnalysis}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}
            >
              {saveMutation.isPending ? t.saving : t.saveSleepLog}
            </button>

            <button
              onClick={fetchAiAnalysis}
              disabled={aiCard === 'loading'}
              className="w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              {aiCard && aiCard !== 'loading' ? t.updateAiAdvice : t.getAiAdvice}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryView({ history, t, lang, dateLocale, MOODS }) {
  if (!history) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-text-secondary)' }} />
    </div>
  );

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--color-text-muted)' }}>
      <Moon className="w-10 h-10 opacity-30" />
      <p className="text-sm">{t.noLogsYet}</p>
    </div>
  );

  return (
    <div className="px-4 py-5 space-y-3 max-w-lg mx-auto">
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

        const mood = MOODS.find(m => m.value === log.bedtime_mood);

        return (
          <div
            key={log.id}
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {mood && <span className="text-lg">{mood.emoji}</span>}
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {format(new Date(log.date), lang === 'en' ? 'MMMM d' : 'd. MMMM', { locale: dateLocale })}
                </span>
              </div>
              {log.bedtime && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.bedAt} {log.bedtime}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nightMins !== null && <Chip label={`🌙 ${Math.floor(nightMins / 60)}t ${nightMins % 60}m`} color="blue" />}
              {(log.night_wakings?.length || 0) > 0 && <Chip label={`${log.night_wakings.length} ${log.night_wakings.length === 1 ? t.wakings : t.wakingsPlural}`} color="yellow" />}
              {totalNapMins > 0 && <Chip label={`☀️ ${Math.floor(totalNapMins / 60)}h ${totalNapMins % 60}m ${t.napTotal}`} color="green" />}
              {log.minutes_to_sleep != null && <Chip label={`${t.felAsleepIn} ${log.minutes_to_sleep}m`} color={log.minutes_to_sleep > 30 ? 'red' : 'green'} />}
            </div>
            {log.parent_note && (
              <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>"{log.parent_note}"</p>
            )}
          </div>
        );
      })}
    </div>
  );
}