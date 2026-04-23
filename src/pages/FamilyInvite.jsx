import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';

const TITLES = ['Far', 'Farmor', 'Farfar', 'Mormor', 'Morfar', 'Søster', 'Bror', 'Veninde', 'Ven', 'Andet'];

const PERMISSIONS = [
  { key: 'can_see_sleep_log', label: 'Se søvnlog', emoji: '😴' },
  { key: 'can_see_wonder_weeks', label: 'Se tigerspring', emoji: '🐯' },
  { key: 'can_see_calendar', label: 'Se kalender', emoji: '📅' },
  { key: 'can_see_knowledge', label: 'Se viden & artikler', emoji: '📚' },
];

const NOTIFICATIONS = [
  { key: 'notify_wonder_weeks', label: 'Notifikationer om tigerspring', emoji: '🐯' },
  { key: 'notify_sleep', label: 'Notifikationer om søvnlog', emoji: '😴' },
  { key: 'notify_calendar', label: 'Notifikationer om aftaler', emoji: '📅' },
];

export default function FamilyInvite() {
  const [user, setUser] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invitee_email: '',
    invitee_title: '',
    can_see_sleep_log: true,
    can_see_wonder_weeks: true,
    can_see_calendar: true,
    can_see_knowledge: false,
    notify_wonder_weeks: true,
    notify_sleep: false,
    notify_calendar: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const data = await base44.entities.FamilyInvite.filter({ inviter_email: u.email });
        setInvites(data);
      } catch {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => setForm({
    invitee_email: '',
    invitee_title: '',
    can_see_sleep_log: true,
    can_see_wonder_weeks: true,
    can_see_calendar: true,
    can_see_knowledge: false,
    notify_wonder_weeks: true,
    notify_sleep: false,
    notify_calendar: true,
  });

  const handleSend = async () => {
    if (!form.invitee_email || !form.invitee_title) {
      toast.error('Udfyld email og vælg en titel');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.invitee_email)) {
      toast.error('Indtast en gyldig email');
      return;
    }
    setSaving(true);
    try {
      const invite = await base44.entities.FamilyInvite.create({
        ...form,
        inviter_email: user.email,
        status: 'pending',
      });

      // Send invite email
      await base44.functions.invoke('sendFamilyInvite', {
        invitee_email: form.invitee_email,
        invitee_title: form.invitee_title,
        inviter_name: user.full_name || user.email,
      });

      setInvites(prev => [invite, ...prev]);
      setSheetOpen(false);
      resetForm();
      toast.success(`Invitation sendt til ${form.invitee_email} 🎉`);
    } catch (e) {
      toast.error('Noget gik galt. Prøv igen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.FamilyInvite.delete(id);
    setInvites(prev => prev.filter(i => i.id !== id));
    toast.success('Invitation slettet');
  };

  const statusBadge = (status) => {
    if (status === 'accepted') return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Accepteret</span>;
    if (status === 'declined') return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Afvist</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Afventer</span>;
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-5 flex items-center gap-3 relative">
        <Link to={createPageUrl('Profile')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg-card)' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="text-3xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}>
          Familieadgang
        </h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Intro */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Invitér et familiemedlem til at følge med — de får adgang til præcis det, du vælger, og kan modtage notifikationer om barnets milepæle.
          </p>
        </div>

        {/* Invite button */}
        <Button
          className="w-full gap-2 h-12 text-base"
          onClick={() => { resetForm(); setSheetOpen(true); }}
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <UserPlus className="w-5 h-5" />
          Invitér familiemedlem
        </Button>

        {/* Existing invites */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>
              Sendte invitationer
            </p>
            {invites.map(invite => (
              <div
                key={invite.id}
                className="rounded-2xl p-4 border flex items-start gap-3"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: 'var(--color-bg-subtle)' }}>
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {invite.invitee_title}
                    </span>
                    {statusBadge(invite.status)}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {invite.invitee_email}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {PERMISSIONS.filter(p => invite[p.key]).map(p => (
                      <span key={p.key} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                        {p.emoji} {p.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(invite.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-60"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {invites.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen invitationer endnu</p>
          </div>
        )}
      </div>

      {/* Invite Bottom Sheet */}
      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Invitér familiemedlem">
        <div className="px-5 py-2 space-y-5 pb-8">

          {/* Email */}
          <div className="space-y-1.5">
            <Label>Email på familiemedlem</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <Input
                type="email"
                placeholder="fx farmor@gmail.com"
                value={form.invitee_email}
                onChange={e => setForm({ ...form, invitee_email: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Titel */}
          <div className="space-y-1.5">
            <Label>Titel</Label>
            <div className="flex flex-wrap gap-2">
              {TITLES.map(title => (
                <button
                  key={title}
                  onClick={() => setForm({ ...form, invitee_title: title })}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95"
                  style={{
                    backgroundColor: form.invitee_title === title ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                    borderColor: form.invitee_title === title ? 'var(--color-primary)' : 'var(--color-border)',
                    color: form.invitee_title === title ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  }}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Adgang */}
          <div className="space-y-1.5">
            <Label>Hvad må de se?</Label>
            <div className="rounded-2xl overflow-hidden border divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {PERMISSIONS.map(p => (
                <div key={p.key} className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{p.emoji} {p.label}</span>
                  <Switch
                    checked={form[p.key]}
                    onCheckedChange={val => setForm({ ...form, [p.key]: val })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifikationer */}
          <div className="space-y-1.5">
            <Label>Notifikationer</Label>
            <div className="rounded-2xl overflow-hidden border divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {NOTIFICATIONS.map(n => (
                <div key={n.key} className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{n.emoji} {n.label}</span>
                  <Switch
                    checked={form[n.key]}
                    onCheckedChange={val => setForm({ ...form, [n.key]: val })}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleSend}
            disabled={saving}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <Check className="w-5 h-5" />
            {saving ? 'Sender…' : 'Send invitation'}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}