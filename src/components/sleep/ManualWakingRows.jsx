import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

const inputCls = 'w-full rounded-xl px-3 py-2 border';
const inputStyle = { backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

export default function ManualWakingRows({ wakings, onChange }) {
  const { t } = useLanguage();
  const update = (i, patch) => onChange(wakings.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  const remove = (i) => onChange(wakings.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {wakings.map((w, i) => (
        <div key={i} className="flex items-end gap-2">
          <label className="flex-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t.manualWakingFrom}
            <input type="time" value={w.from} onChange={e => update(i, { from: e.target.value })} className={inputCls} style={inputStyle} />
          </label>
          <label className="flex-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t.manualWakingTo}
            <input type="time" value={w.to} onChange={e => update(i, { to: e.target.value })} className={inputCls} style={inputStyle} />
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={t.manualRemoveWaking}
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}