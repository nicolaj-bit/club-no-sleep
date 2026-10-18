import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/components/ui/LanguageContext';
import { computeSessionTotals, formatHoursMinutes } from '@/lib/sleepSessionTotals';
import { useSleepSession } from './useSleepSession';
import ManualWakingRows from './ManualWakingRows';
import { emptyForm, formFromLog, resolveForm } from './manualSleepForm';

const inputStyle = { backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };
const labelStyle = { color: 'var(--color-text-muted)' };

export default function ManualSleepDialog({ open, onOpenChange, user, activeChild, editLog }) {
  const { t } = useLanguage();
  const { addManualSession } = useSleepSession(user);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editLog ? formFromLog(editLog) : emptyForm());
      setError('');
    }
  }, [open, editLog]);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const r = resolveForm(form);
  const totals = r.valid ? computeSessionTotals({ periods: r.periods }) : null;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await addManualSession({
        child_id: editLog ? editLog.child_id || undefined : activeChild?.id,
        sleep_type: form.sleepType,
        session_start: r.startIso,
        session_end: r.endIso,
        wakings: r.wakings,
        parent_note: form.note,
        local_date: form.date,
        existing_id: editLog?.id,
      });
      onOpenChange(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
        <DialogHeader>
          <DialogTitle>{editLog ? t.manualEditSleep : t.manualAddSleep}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            {[['night', t.nightSleep], ['nap', t.nap]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => set({ sleepType: key })}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: form.sleepType === key ? 'var(--color-accent)' : 'var(--color-bg-subtle)',
                  color: form.sleepType === key ? 'var(--theme-text-on-dark, #FFFDF9)' : 'var(--color-text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block text-xs" style={labelStyle}>
            {t.manualDate}
            <input type="date" value={form.date} max={format(new Date(), 'yyyy-MM-dd')} onChange={e => set({ date: e.target.value })} className="w-full rounded-xl px-3 py-2 border" style={inputStyle} />
          </label>

          <div className="flex gap-2">
            <label className="flex-1 text-xs" style={labelStyle}>
              {t.manualStartTime}
              <input type="time" value={form.startTime} onChange={e => set({ startTime: e.target.value })} className="w-full rounded-xl px-3 py-2 border" style={inputStyle} />
            </label>
            <label className="flex-1 text-xs" style={labelStyle}>
              {t.manualEndTime}
              <input type="time" value={form.endTime} onChange={e => set({ endTime: e.target.value })} className="w-full rounded-xl px-3 py-2 border" style={inputStyle} />
            </label>
          </div>
          {r.endsNextDay && (
            <p className="text-xs -mt-2" style={labelStyle}>{r.endsEarly ? t.manualEndsTomorrowMorning : t.manualEndsTomorrow}</p>
          )}

          <ManualWakingRows wakings={form.wakings} onChange={(wakings) => set({ wakings })} />
          <button
            type="button"
            onClick={() => set({ wakings: [...form.wakings, { from: '', to: '' }] })}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            <Plus className="w-4 h-4" /> {t.manualAddWaking}
          </button>

          <label className="block text-xs" style={labelStyle}>
            {t.manualNote}
            <textarea value={form.note} onChange={e => set({ note: e.target.value })} rows={2} className="w-full rounded-xl px-3 py-2 border" style={inputStyle} />
          </label>

          {totals && (
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.manualTotal} {formatHoursMinutes(totals.totalSleepMs)} {t.sleepSuffix}, {totals.wakeCount} {totals.wakeCount === 1 ? t.wakings : t.wakingsPlural}
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={save}
            disabled={!r.valid || saving}
            className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: 'var(--theme-text-on-dark, #FFFDF9)' }}
          >
            {saving ? t.manualSaving : t.manualSave}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}