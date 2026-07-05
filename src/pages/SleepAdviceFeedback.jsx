import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ui/ThemeProvider';
import { toast } from 'sonner';
import { CheckCircle, ThumbsUp, ThumbsDown, RefreshCw, AlertCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function SleepAdviceFeedback() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const FEEDBACK_OPTIONS = [
    { value: 'helpful', label: `👍 ${t.sleepAdviceFeedbackHelpful}`, desc: t.sleepAdviceFeedbackHelpfulDesc },
    { value: 'already_tried', label: `🔄 ${t.sleepAdviceFeedbackAlreadyTried}`, desc: t.sleepAdviceFeedbackAlreadyTriedDesc },
    { value: 'not_relevant', label: `🤔 ${t.sleepAdviceFeedbackNotRelevant}`, desc: t.sleepAdviceFeedbackNotRelevantDesc },
    { value: 'not_helpful', label: `👎 ${t.sleepAdviceFeedbackNotHelpful}`, desc: t.sleepAdviceFeedbackNotHelpfulDesc },
  ];
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) { setLoading(false); return; }

      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { base44.auth.redirectToLogin(); return; }

        const records = await base44.entities.SleepAdviceFeedback.filter({});
        const found = records.find(r => r.id === id);
        if (found) {
          setAdvice(found);
          if (found.feedback) {
            setSelected(found.feedback);
            setNote(found.feedback_note || '');
            setSubmitted(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!selected || !advice) return;
    setSaving(true);
    try {
      await base44.entities.SleepAdviceFeedback.update(advice.id, {
        feedback: selected,
        feedback_note: note,
      });
      setSubmitted(true);
      toast.success(`${t.sleepAdviceFeedbackThanks} 💛`);
    } catch (e) {
      toast.error(t.sleepAdviceFeedbackError);
    } finally {
      setSaving(false);
    }
  };

  const bg = 'var(--color-bg)';
  const cardBg = 'var(--color-bg-card)';
  const border = 'var(--color-border)';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!advice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: bg }}>
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>{t.sleepAdviceFeedbackNotFound}</p>
        <Link to="/SleepLog" className="text-sm underline" style={{ color: 'var(--color-text-secondary)' }}>{t.sleepAdviceFeedbackGoToLog}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 px-4 pt-6" style={{ background: bg }}>
      {/* Back */}
      <Link to="/SleepLog" className="flex items-center gap-1 mb-6" style={{ color: 'var(--color-text-muted)' }}>
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">{t.sleepLog}</span>
      </Link>

      {/* AI Advice card */}
      <div className="rounded-3xl p-5 mb-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {t.sleepAdviceFeedbackYourAdvice}
        </p>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          {advice.ai_title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {advice.ai_message}
        </p>
        {advice.log_summary && (
          <p className="text-xs mt-3 italic" style={{ color: 'var(--color-text-muted)' }}>
            {t.sleepAdviceFeedbackBasedOn}: {advice.log_summary}
          </p>
        )}
      </div>

      {submitted ? (
        <div className="rounded-3xl p-6 flex flex-col items-center gap-3 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.sleepAdviceFeedbackThanks}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t.sleepAdviceFeedbackThanksDesc} 💛
          </p>
          <Link
            to="/SleepLog"
            className="mt-2 px-5 py-2 rounded-full text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            {t.sleepAdviceFeedbackBackToLog}
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t.sleepAdviceFeedbackDidThisHelp} 🙏
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {FEEDBACK_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl text-left transition-all active:scale-95"
                style={{
                  background: selected === opt.value
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-subtle)',
                  border: `1.5px solid ${selected === opt.value ? 'var(--color-primary)' : border}`,
                }}
              >
                <span className="text-base mt-0.5">{opt.label.split(' ')[0]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: selected === opt.value ? 'var(--color-primary-foreground)' : 'var(--color-text-primary)' }}>
                    {opt.label.split(' ').slice(1).join(' ')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: selected === opt.value ? 'var(--color-primary-foreground)' : 'var(--color-text-muted)' }}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t.sleepAdviceFeedbackNotePlaceholder}
            rows={3}
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none"
            style={{
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              border: `1px solid ${border}`,
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={!selected || saving}
            className="w-full mt-4 py-3 rounded-2xl text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            {saving ? t.saving : t.sleepAdviceFeedbackSendBtn}
          </button>
        </div>
      )}
    </div>
  );
}