import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddChildSheet({ open, onClose, onSaved, editChild = null }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(editChild?.name || '');
      setBirthdate(editChild?.birthdate || '');
      setDueDate(editChild?.due_date || '');
      setError('');
      setConfirmDelete(false);
    }
  }, [open, editChild]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) { setError('Indtast barnets navn'); return; }
    if (!birthdate && !dueDate) { setError('Angiv fødselsdato eller terminsdato'); return; }

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

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await base44.entities.Child.delete(editChild.id);
      onSaved();
    } catch (e) {
      setError('Kunne ikke slette. Prøv igen.');
    } finally {
      setDeleting(false);
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
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Terminsdato</label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Bruges til beregning af tigerspring 🐯</p>
          </div>

          {error && <p className="text-xs" style={{ color: '#e55' }}>{error}</p>}

          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            className="w-full"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {saving ? 'Gemmer…' : editChild ? 'Gem ændringer' : 'Tilføj barn'}
          </Button>

          {editChild && (
            <>
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }} />
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium"
                  style={{ color: '#c44' }}
                >
                  <Trash2 className="w-4 h-4" /> Slet barn
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
                    Slet {editChild.name}? Dette kan ikke fortrydes.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="flex-1"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      Annuller
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1"
                      style={{ background: '#c44', color: '#fff' }}
                    >
                      {deleting ? 'Sletter…' : 'Ja, slet'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}