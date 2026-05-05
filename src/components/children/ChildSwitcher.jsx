import React, { useState } from 'react';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Plus, Baby } from 'lucide-react';
import AddChildSheet from './AddChildSheet';

export default function ChildSwitcher({ compact = false }) {
  const { children, activeChild, setActiveChildId, refetch } = useActiveChild();
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  if (!activeChild && children.length === 0) {
    return (
      <>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tilføj barn
        </button>
        <AddChildSheet open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refetch(); }} />
      </>
    );
  }

  const getChildLabel = (child) => {
    if (child.birthdate) return child.name;
    if (child.due_date) return `${child.name} 🤰`;
    return child.name;
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>{activeChild ? getChildLabel(activeChild) : 'Vælg barn'}</span>
          {children.length > 1 && <ChevronDown className="w-3 h-3" />}
        </button>

        {open && (
          <div
            className="absolute top-full mt-1 left-0 rounded-xl shadow-lg z-50 py-1 min-w-[160px]"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => { setActiveChildId(child.id); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
                style={{
                  color: activeChild?.id === child.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  background: activeChild?.id === child.id ? 'var(--color-bg-subtle)' : 'transparent'
                }}
              >
                <Baby className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{getChildLabel(child)}</span>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
            <button
              onClick={() => { setOpen(false); setShowAdd(true); }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tilføj barn
            </button>
          </div>
        )}
      </div>

      <AddChildSheet open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refetch(); }} />
    </>
  );
}