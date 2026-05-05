import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddChildSheet({ open, onClose, onSaved, editChild = null }) {
  const [name, setName] = useState(editChild?.name || '');
  const [birthdate, setBirthdate] = useState(editChild?.birthdate || '');
  const [dueDate, setDueDate] = useState(editChild?.due_date || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) { setError('Indtast barnets navn'); return; }
    if (!birthdate && !dueDate) { setError('Angiv enten fødselsdato eller terminsdato'); return; }

    setSaving(true);
    setError('');
    try {
      const user = await base44.auth.me();
      const data = {
        user_email: user.email,
        name: name.trim(),
        birthdate: birthdate || null,
        due_date: dueDate || null,
      };

      if (editChild) {
        await base44.entities.Child.update(editChild.id, data);
      } else {
        await base44.entities.Child.create(data);
      }
      onSaved();
    } catch (e) {
      setError('Kunne ikke gemme. Prøv igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl p-6 pb-10"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {editChild ? 'Rediger barn' : 'Tilføj barn'}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Navn *</label>
            <Input
              placeholder="Barnets navn"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Fødselsdato</label>
            <Input
              type="date"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div>
            <p className="text-xs text-center my-1" style={{ color: 'var(--color-text-muted)' }}>— eller —</p>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Terminsdato (hvis ikke født endnu)</label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#e55' }}>{error}</p>}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {saving ? 'Gemmer…' : editChild ? 'Gem ændringer' : 'Tilføj barn'}
          </Button>
        </div>
      </div>
    </div>
  );
}