import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Slide-out burger drawer til AdminEditor. Lister alle admin-sektioner med ikoner,
// fremhæver den aktive, og viser ekstra side-links (Support/Notifikationer) i bunden.
export default function AdminNavDrawer({ open, onClose, items, activeTab, onSelect, footerItems = [] }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[82vw] flex flex-col"
            style={{ backgroundColor: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b safe-top" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Admin</h2>
              <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }} aria-label="Luk">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { onSelect(item.key); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors"
                    style={active
                      ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                      : { color: 'var(--color-text-secondary)' }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {footerItems.length > 0 && (
              <div className="px-3 py-3 border-t space-y-1 safe-bottom" style={{ borderColor: 'var(--color-border)' }}>
                {footerItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      onClick={onClose}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}