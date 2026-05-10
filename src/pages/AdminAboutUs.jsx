import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTION_LABELS = {
  hero: 'Hero-tekst',
  team_member: 'Teammedlem',
  partner: 'Samarbejdspartner',
};

const DEFAULT_ENTRY = {
  section: 'hero',
  key: '',
  title: '',
  subtitle: '',
  body: '',
  image_url: '',
  link: '',
  order: 0,
  is_active: true,
};

function EntryCard({ entry, onSave, onDelete }) {
  const [data, setData] = useState(entry);
  const set = (field, val) => setData(d => ({ ...d, [field]: val }));

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}>
          {SECTION_LABELS[data.section] || data.section}
        </span>
        <button onClick={() => onDelete(entry.id)} className="text-red-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Sektion</label>
          <select
            value={data.section}
            onChange={e => set('section', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 border"
            style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="hero">Hero-tekst</option>
            <option value="team_member">Teammedlem</option>
            <option value="partner">Samarbejdspartner</option>
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Nøgle (unik ID)</label>
          <Input placeholder="fx sara, nicolaj, main" value={data.key} onChange={e => set('key', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Titel / Navn</label>
        <Input placeholder="Titel eller navn" value={data.title} onChange={e => set('title', e.target.value)} />
      </div>

      {data.section !== 'hero' && (
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Undertitel / Rolle</label>
          <Input placeholder="fx CEO & Co-Founder" value={data.subtitle} onChange={e => set('subtitle', e.target.value)} />
        </div>
      )}

      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
          {data.section === 'hero' ? 'Brødtekst (afsnit adskilles med blank linje)' : 'Fun facts (én per linje)'}
        </label>
        <Textarea
          rows={data.section === 'hero' ? 8 : 5}
          placeholder={data.section === 'hero' ? 'Afsnit 1...\n\nAfsnit 2...' : 'Jeg elsker kaffe\nJeg sover med åbent vindue'}
          value={data.body}
          onChange={e => set('body', e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Billede URL</label>
        <Input placeholder="https://..." value={data.image_url} onChange={e => set('image_url', e.target.value)} />
      </div>

      {data.section === 'partner' && (
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Eksternt link</label>
          <Input placeholder="https://..." value={data.link} onChange={e => set('link', e.target.value)} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Rækkefølge</label>
          <Input type="number" value={data.order} onChange={e => set('order', Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id={`active-${entry.id}`} checked={data.is_active} onChange={e => set('is_active', e.target.checked)} />
          <label htmlFor={`active-${entry.id}`} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Aktiv</label>
        </div>
      </div>

      <Button onClick={() => onSave(data)} className="w-full gap-2">
        <Save className="w-4 h-4" /> Gem ændringer
      </Button>
    </div>
  );
}

export default function AdminAboutUs() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newEntry, setNewEntry] = useState(DEFAULT_ENTRY);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['about-us-content'],
    queryFn: () => base44.entities.AboutUsContent.list('order', 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.AboutUsContent.update(data.id, data)
      : base44.entities.AboutUsContent.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['about-us-content'] }); toast.success('Gemt!'); setShowNew(false); setNewEntry(DEFAULT_ENTRY); },
    onError: () => toast.error('Fejl ved gemning'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AboutUsContent.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['about-us-content'] }); toast.success('Slettet'); },
  });

  const grouped = {
    hero: entries.filter(e => e.section === 'hero'),
    team_member: entries.filter(e => e.section === 'team_member'),
    partner: entries.filter(e => e.section === 'partner'),
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(247,242,236,0.92)', borderColor: 'var(--color-border)' }}>
        <Link to="/AdminEditor">
          <Button variant="ghost" size="icon" className="-ml-2"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-xl font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>Om os – rediger</h1>
        <Button size="sm" onClick={() => setShowNew(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Tilføj
        </Button>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">

        {/* New entry form */}
        {showNew && (
          <div className="rounded-2xl border-2 border-dashed p-4 space-y-3" style={{ borderColor: 'var(--color-accent)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-accent)' }}>Nyt indhold</p>
            <EntryCard
              entry={{ ...newEntry, id: null }}
              onSave={data => saveMutation.mutate(data)}
              onDelete={() => setShowNew(false)}
            />
          </div>
        )}

        {isLoading && <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Indlæser...</p>}

        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>{SECTION_LABELS[section]}</h2>
            {items.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen indhold endnu. Tryk "+ Tilføj" for at oprette.</p>
            )}
            <div className="space-y-4">
              {items.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onSave={data => saveMutation.mutate(data)}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}