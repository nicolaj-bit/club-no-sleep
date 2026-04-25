import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, BookHeart, Camera, Smile, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

const MOODS = [
  { value: 'strålende', emoji: '🌟', label: 'Strålende' },
  { value: 'god', emoji: '😊', label: 'God' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'træt', emoji: '😴', label: 'Træt' },
  { value: 'hård', emoji: '😢', label: 'Hård dag' },
];

function getPregnancyWeek(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  const daysLeft = differenceInDays(due, today);
  if (daysLeft < 0) return null;
  const weeksLeft = Math.ceil(daysLeft / 7);
  return Math.max(1, Math.min(42, 40 - weeksLeft));
}

function DiaryEntryCard({ entry, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(90deg, #5C3317 0%, #A0785A 100%)' }}>
        <div className="flex items-center gap-2">
          <BookHeart className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white">Uge {entry.week}</span>
          {entry.mood && (
            <span className="text-base">{MOODS.find(m => m.value === entry.mood)?.emoji}</span>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(entry)} className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Save className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={() => onDelete(entry.id)} className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Belly image */}
      {entry.belly_image && (
        <div className="relative">
          <img src={entry.belly_image} alt={`Mave uge ${entry.week}`} className="w-full object-cover" style={{ maxHeight: 260 }} />
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
            📸 Uge {entry.week}
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {entry.note && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', lineHeight: '1.6' }}>
            {entry.note}
          </p>
        )}
        {entry.symptoms && (
          <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>Symptomer</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{entry.symptoms}</p>
          </div>
        )}
        {entry.baby_kicks_count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm">👶</span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{entry.baby_kicks_count} spark noteret</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DiaryForm({ week, initialData, onSave, onCancel }) {
  const [note, setNote] = useState(initialData?.note || '');
  const [mood, setMood] = useState(initialData?.mood || '');
  const [symptoms, setSymptoms] = useState(initialData?.symptoms || '');
  const [kicks, setKicks] = useState(initialData?.baby_kicks_count || '');
  const [bellyImage, setBellyImage] = useState(initialData?.belly_image || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBellyImage(file_url);
      toast.success('Billede uploadet ✓');
    } catch {
      toast.error('Kunne ikke uploade billede');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        note,
        mood,
        symptoms,
        baby_kicks_count: kicks ? Number(kicks) : undefined,
        belly_image: bellyImage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Humør i uge {week}
          </p>
        </div>
        <div className="px-4 py-3 flex gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value === mood ? '' : m.value)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all active:scale-95"
              style={{
                backgroundColor: mood === m.value ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                borderColor: mood === m.value ? 'var(--color-primary)' : 'var(--color-border)',
                color: mood === m.value ? 'var(--color-bg)' : 'var(--color-text-primary)',
              }}
            >
              <span>{m.emoji}</span>
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mavebillede */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            📸 Mavebillede uge {week}
          </p>
        </div>
        <div className="p-4">
          {bellyImage ? (
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img src={bellyImage} alt="Mave" className="w-full object-cover rounded-xl" style={{ maxHeight: 220 }} />
              <button
                onClick={() => setBellyImage('')}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer py-8 transition-opacity active:opacity-60"
              style={{ borderColor: 'var(--color-border)' }}>
              <Camera className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {uploading ? 'Uploader...' : 'Tilføj mavebillede'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            ✍️ Min refleksion
          </p>
        </div>
        <div className="p-4">
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Hvad tænker du på? Hvordan har du det? Hvad glæder du dig til?"
            className="border-0 p-0 text-sm resize-none bg-transparent focus-visible:ring-0 min-h-[100px]"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', lineHeight: '1.7' }}
          />
        </div>
      </div>

      {/* Symptomer */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Symptomer denne uge</p>
        </div>
        <div className="p-4">
          <Textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="Kvalme, træthed, rygsmerte..."
            className="border-0 p-0 text-sm resize-none bg-transparent focus-visible:ring-0 min-h-[60px]"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      {/* Spark */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>👶 Spark i dag</p>
        </div>
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => setKicks(k => Math.max(0, (Number(k) || 0) - 1))} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)' }}>−</button>
          <span className="text-2xl font-light flex-1 text-center" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
            {kicks || 0}
          </span>
          <button onClick={() => setKicks(k => (Number(k) || 0) + 1)} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>+</button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Annuller</Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {saving ? 'Gemmer...' : 'Gem i dagbog ✓'}
        </Button>
      </div>
    </div>
  );
}

export default function PregnancyDiary() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formWeek, setFormWeek] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const weekParam = urlParams.get('week');

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, diaryEntries] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: u.email }),
          base44.entities.PregnancyDiary.filter({ user_email: u.email }, '-week'),
        ]);
        setProfile(profiles[0] || null);
        setEntries(diaryEntries);

        if (weekParam) {
          const w = parseInt(weekParam, 10);
          setFormWeek(w);
          const existing = diaryEntries.find(e => e.week === w);
          if (existing) {
            setEditingEntry(existing);
          }
          setShowForm(true);
        }
      } catch {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentWeek = profile?.child_due_date ? getPregnancyWeek(profile.child_due_date) : null;

  const handleSave = async (data) => {
    const week = formWeek || currentWeek || 12;
    if (editingEntry) {
      const updated = await base44.entities.PregnancyDiary.update(editingEntry.id, {
        ...data,
        user_email: user.email,
        week,
      });
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...data } : e));
      toast.success('Dagbog opdateret ✓');
    } else {
      const created = await base44.entities.PregnancyDiary.create({
        ...data,
        user_email: user.email,
        week,
      });
      setEntries(prev => [created, ...prev]);
      toast.success('Gemt i dagbogen ✓');
    }
    setShowForm(false);
    setEditingEntry(null);
    setFormWeek(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.PregnancyDiary.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Slettet');
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormWeek(entry.week);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setFormWeek(currentWeek || 12);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Min graviditetsdagbog</p>
          </div>
          {!showForm && (
            <button
              onClick={openNewEntry}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus className="w-5 h-5" style={{ color: 'var(--color-bg)' }} />
            </button>
          )}
          {showForm && <div className="w-9" />}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {showForm ? (
          <>
            <div>
              <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
                {editingEntry ? `Rediger uge ${formWeek}` : `Ny note – uge ${formWeek}`}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Skriv dine tanker, upload et mavebillede og gem dine minder.
              </p>
            </div>
            <DiaryForm
              week={formWeek}
              initialData={editingEntry}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingEntry(null); setFormWeek(null); }}
            />
          </>
        ) : (
          <>
            {/* Hero */}
            <div className="rounded-3xl p-6" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
              <div className="flex items-center gap-3 mb-3">
                <BookHeart className="w-6 h-6 text-white/80" />
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Graviditetsdagbog</p>
              </div>
              <h1 className="text-3xl font-light text-white leading-snug mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Dine minder fra graviditeten
              </h1>
              <p className="text-white/60 text-sm">
                {entries.length > 0
                  ? `${entries.length} ${entries.length === 1 ? 'note' : 'noter'} gemt`
                  : 'Ingen noter endnu — start din dagbog'}
              </p>
              {currentWeek && (
                <p className="text-white/50 text-xs mt-2">Du er i uge {currentWeek}</p>
              )}
            </div>

            {/* Week shortcuts */}
            {currentWeek && entries.length === 0 && (
              <div className="rounded-2xl border p-4 text-center" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>Start med at tilføje en note til den aktuelle uge</p>
                <Button
                  onClick={openNewEntry}
                  className="gap-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  <Plus className="w-4 h-4" />
                  Uge {currentWeek} – Tilføj note
                </Button>
              </div>
            )}

            {/* Entries */}
            {entries.length > 0 && (
              <div className="space-y-4">
                {entries.sort((a, b) => a.week - b.week).map(entry => (
                  <DiaryEntryCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {entries.length > 0 && (
              <Button
                onClick={openNewEntry}
                variant="outline"
                className="w-full gap-2 h-12"
              >
                <Plus className="w-4 h-4" />
                Tilføj ny note
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}