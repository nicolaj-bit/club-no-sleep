import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useTheme } from '@/components/ui/ThemeProvider';
import UserAvatar from '@/components/community/UserAvatar';
import AddProfileSheet from '@/components/profile/AddProfileSheet';

export default function ProfileSwitcher() {
  const { isDark } = useTheme();
  const { activeProfile, allProfiles, switchProfile } = useActiveProfile();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const canAddProfile = allProfiles.length < 2;
  const otherProfiles = allProfiles.filter(p => p.id !== activeProfile?.id);

  return (
    <>
      <div className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{
            backgroundColor: isDark ? '#1A1A1A' : '#F0E9E0',
            border: `1px solid ${isDark ? '#2A2A2A' : '#E8DDD4'}`,
          }}
        >
          <UserAvatar
            src={activeProfile?.profile_image}
            name={activeProfile?.display_name || activeProfile?.username}
            size="xs"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {activeProfile?.profile_label === 'mor' ? '🤍 Mor' : '💙 Far'}
          </span>
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{
              color: 'var(--color-text-muted)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden min-w-48"
                style={{
                  backgroundColor: isDark ? '#161616' : '#FFFFFF',
                  boxShadow: isDark
                    ? '0 8px 40px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06)'
                    : '0 8px 40px rgba(44,26,14,0.14), 0 0 0 0.5px rgba(44,26,14,0.06)',
                }}
              >
                <div className="px-4 pt-3 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Skift profil
                  </p>
                </div>

                {/* Active profile */}
                <div className="px-3 pb-1">
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl"
                    style={{ backgroundColor: isDark ? '#1A1A1A' : '#F7F2EC' }}
                  >
                    <UserAvatar
                      src={activeProfile?.profile_image}
                      name={activeProfile?.display_name || activeProfile?.username}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {activeProfile?.display_name || activeProfile?.username}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {activeProfile?.profile_label === 'mor' ? '🤍 Mor-profil' : '💙 Far-profil'}
                      </p>
                    </div>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                  </div>
                </div>

                {/* Other profiles */}
                {otherProfiles.map(profile => (
                  <div key={profile.id} className="px-3 pb-1">
                    <button
                      onClick={() => { switchProfile(profile); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] text-left"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <UserAvatar
                        src={profile.profile_image}
                        name={profile.display_name || profile.username}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {profile.display_name || profile.username}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {profile.profile_label === 'mor' ? '🤍 Mor-profil' : '💙 Far-profil'}
                        </p>
                      </div>
                    </button>
                  </div>
                ))}

                {/* Add profile */}
                {canAddProfile && (
                  <>
                    <div className="mx-3 my-1" style={{ height: '1px', backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }} />
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => { setOpen(false); setAddOpen(true); }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }}
                        >
                          <Plus className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          Tilføj {allProfiles.some(p => p.profile_label === 'mor') ? 'far' : 'mor'}-profil
                        </p>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AddProfileSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}