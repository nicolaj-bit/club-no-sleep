import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';

export default function AddProfileSheet({ open, onClose }) {
  const { isDark } = useTheme();
  const { allProfiles, refreshProfiles, switchProfile } = useActiveProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Bestem hvilken label der mangler
  const existingLabels = allProfiles.map(p => p.profile_label);
  const missingLabel = existingLabels.includes('mor') ? 'far' : 'mor';

  const [form, setForm] = useState({
    display_name: '',
    username: '',
    profile_image: '',
    city: '',
    child_birthdate: '',
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_image: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.display_name.trim() || !form.username.trim()) {
      toast.error('Navn og brugernavn er påkrævet');
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const newProfile = await base44.entities.UserProfile.create({
        ...form,
        profile_label: missingLabel,
        gender: missingLabel === 'mor' ? 'female' : 'male',
        user_email: user.email,
      });
      await refreshProfiles();
      // Find den nye profil og skift til den
      const updated = await base44.entities.UserProfile.filter({ user_email: user.email });
      const created = updated.find(p => p.id === newProfile.id) || updated.find(p => p.profile_label === missingLabel);
      if (created) switchProfile(created);
      toast.success(`${missingLabel === 'mor' ? 'Mor' : 'Far'}-profil oprettet!`);
      onClose();
    } catch {
      toast.error('Noget gik galt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: isDark ? '#111111' : '#FFFFFF',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: isDark ? '#3A3A3A' : '#E0D8D0' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                  Opret {missingLabel === 'mor' ? '🤍 Mor' : '💙 Far'}-profil
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Separat profil med egne søvnlogs
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>

            <div className="px-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    {form.profile_image
                      ? <img src={form.profile_image} alt="profil" className="w-full h-full object-cover" />
                      : <span className="text-3xl">{missingLabel === 'mor' ? '👩' : '👨'}</span>
                    }
                  </div>
                  <label
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <Camera className="w-3 h-3 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {uploading ? 'Uploader...' : 'Tilføj profilbillede'}
                </p>
              </div>

              {/* Navn */}
              <div className="space-y-1.5">
                <Label>Navn</Label>
                <Input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder={missingLabel === 'mor' ? 'Mors navn' : 'Fars navn'}
                  style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none' }}
                />
              </div>

              {/* Brugernavn */}
              <div className="space-y-1.5">
                <Label>Brugernavn</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>@</span>
                  <Input
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                    placeholder="brugernavn"
                    className="pl-7"
                    style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none' }}
                  />
                </div>
              </div>

              {/* Barnets fødselsdato */}
              <div className="space-y-1.5">
                <Label>Barnets fødselsdato (valgfrit)</Label>
                <Input
                  type="date"
                  value={form.child_birthdate}
                  onChange={e => setForm(f => ({ ...f, child_birthdate: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none' }}
                />
              </div>

              <Button
                className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff', border: 'none' }}
                onClick={handleSave}
                disabled={saving || uploading}
              >
                {saving ? 'Opretter...' : (
                  <>
                    Opret profil <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}