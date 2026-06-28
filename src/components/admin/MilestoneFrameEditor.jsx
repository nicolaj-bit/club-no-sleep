import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Upload, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

const EMPTY = {
  milestone_id: '',
  category: 'Baby',
  label: '',
  emoji: '🤍',
  headline: '',
  subline: '',
  bg_color: '#F5EFE6',
  accent_color: '#C8A882',
  text_color: '#2B1F16',
  sticker_image: '',
  order: 0,
  is_active: true,
};

const CATEGORIES = ['Graviditet', 'Baby', 'Øjeblikke'];

export default function MilestoneFrameEditor() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: frames = [], isLoading } = useQuery({
    queryKey: ['adminMilestoneFrames'],
    queryFn: () => base44.entities.MilestoneFrame.list('order', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isNew
        ? base44.entities.MilestoneFrame.create(data)
        : base44.entities.MilestoneFrame.update(editing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMilestoneFrames']);
      queryClient.invalidateQueries(['milestoneFrames']);
      toast.success(t('admin.milestone.toast.saved'));
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MilestoneFrame.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMilestoneFrames']);
      queryClient.invalidateQueries(['milestoneFrames']);
      toast.success(t('admin.milestone.toast.deleted'));
    },
  });

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing((prev) => ({ ...prev, sticker_image: file_url }));
    setUploading(false);
  };

  // ── EDIT VIEW ──
  if (editing) {
    return (
      <div>
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h2 className="flex-1 font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? t('admin.milestone.header.new') : t('admin.milestone.header.edit')}
          </h2>
          <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {saveMutation.isPending ? t('admin.milestone.form.saving') : t('admin.milestone.form.save')}
          </Button>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Preview */}
          <div className="rounded-2xl p-5 flex flex-col items-center gap-2 border"
            style={{ backgroundColor: editing.bg_color || '#F5EFE6', borderColor: 'var(--color-border)' }}>
            {editing.sticker_image ? (
              <img src={editing.sticker_image} alt="sticker" className="w-24 h-24 object-contain rounded-full" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4"
                style={{ borderColor: editing.accent_color || '#C8A882', backgroundColor: `${editing.accent_color}22` }}>
                {editing.emoji}
              </div>
            )}
            <p className="font-bold text-lg text-center" style={{ color: editing.text_color || '#2B1F16' }}>{editing.headline || 'Headline'}</p>
            <p className="text-sm text-center opacity-70" style={{ color: editing.text_color || '#2B1F16' }}>{editing.subline || 'Subline'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.id')}</Label>
              <Input value={editing.milestone_id} onChange={e => setEditing({ ...editing, milestone_id: e.target.value })}
                placeholder="fx preg-12" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
            </div>
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.category')}</Label>
              <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.label')}</Label>
              <Input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })}
                placeholder="fx 1 år" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
            </div>
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.emoji')}</Label>
              <Input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })}
                placeholder="🎂" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
            </div>
          </div>

          <div className="space-y-1">
            <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.headline')}</Label>
            <Input value={editing.headline} onChange={e => setEditing({ ...editing, headline: e.target.value })}
              placeholder="fx 1 år 🎉" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
          </div>

          <div className="space-y-1">
            <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.subline')}</Label>
            <Input value={editing.subline} onChange={e => setEditing({ ...editing, subline: e.target.value })}
              placeholder="fx Tillykke med fødselsdagen!" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.bg_color')}</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.bg_color || '#F5EFE6'} onChange={e => setEditing({ ...editing, bg_color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <Input value={editing.bg_color || ''} onChange={e => setEditing({ ...editing, bg_color: e.target.value })}
                  className="text-xs" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
              </div>
            </div>
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.accent_color')}</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.accent_color || '#C8A882'} onChange={e => setEditing({ ...editing, accent_color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <Input value={editing.accent_color || ''} onChange={e => setEditing({ ...editing, accent_color: e.target.value })}
                  className="text-xs" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
              </div>
            </div>
            <div className="space-y-1">
              <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.text_color')}</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.text_color || '#2B1F16'} onChange={e => setEditing({ ...editing, text_color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <Input value={editing.text_color || ''} onChange={e => setEditing({ ...editing, text_color: e.target.value })}
                  className="text-xs" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
              </div>
            </div>
          </div>

          {/* Sticker image */}
          <div className="space-y-2">
            <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.sticker_image')}</Label>
            {editing.sticker_image && (
              <div className="flex items-center gap-3">
                <img src={editing.sticker_image} alt="sticker" className="w-16 h-16 object-contain rounded-xl border"
                  style={{ borderColor: 'var(--color-border)' }} />
                <button onClick={() => setEditing({ ...editing, sticker_image: '' })}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                  {t('admin.milestone.form.remove_image')}
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm w-fit"
              style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <Upload className="w-4 h-4" />
              {uploading ? t('admin.milestone.form.uploading') : t('admin.milestone.form.upload_image')}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUploadImage} />
            </label>
          </div>

          <div className="space-y-1">
            <Label style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{t('admin.milestone.form.order')}</Label>
            <Input type="number" value={editing.order ?? 0} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })}
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: editing.is_active ? '#22c55e20' : 'var(--color-bg-subtle)',
                color: editing.is_active ? '#16a34a' : 'var(--color-text-muted)'
              }}>
              {editing.is_active ? `✓ ${t('admin.milestone.form.active')}` : `○ ${t('admin.milestone.form.hidden')}`}
            </button>
          </div>

          <Button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {saveMutation.isPending ? 'Gemmer...' : 'Gem milepæl'}
          </Button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = frames.filter(f => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setIsNew(true); setEditing({ ...EMPTY }); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          <Plus className="w-4 h-4" /> {t('admin.milestone.list.new_button')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('admin.milestone.list.loading')}</p>
      ) : frames.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('admin.milestone.list.empty')}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('admin.milestone.list.empty_hint')}</p>
        </div>
      ) : (
        CATEGORIES.map(cat => grouped[cat]?.length > 0 && (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>{cat}</p>
            <div className="space-y-2">
              {grouped[cat].map(frame => (
                <div key={frame.id} className="flex items-center gap-3 p-3 rounded-2xl border"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2"
                    style={{ backgroundColor: frame.bg_color || '#F5EFE6', borderColor: frame.accent_color || '#C8A882' }}>
                    {frame.sticker_image
                      ? <img src={frame.sticker_image} alt="" className="w-8 h-8 object-contain rounded-full" />
                      : frame.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{frame.headline}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{frame.label} · {frame.is_active ? t('admin.milestone.list.active') : t('admin.milestone.list.hidden')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsNew(false); setEditing({ ...frame }); }}
                      className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                      <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                    <button onClick={() => { if (confirm(t('admin.milestone.dialog.confirm_delete'))) deleteMutation.mutate(frame.id); }}
                      className="p-2 rounded-xl" style={{ backgroundColor: '#fee2e2' }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}