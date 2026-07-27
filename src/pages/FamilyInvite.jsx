import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Check, Mail, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useLanguage } from '@/components/ui/LanguageContext';

const getTitleSuggestions = (t) => [t.titleFar, t.titleFarmor, t.titleFarfar, t.titleMormor, t.titleMorfar, t.titleSoster, t.titleBror, t.titleVeninde, t.titleVen];

const getPermissions = (t) => [
  { key: 'can_see_sleep_log', label: t.familySleepLog, emoji: '😴' },
  { key: 'can_see_wonder_weeks', label: t.familyWonderWeeks, emoji: '🐯' },
  { key: 'can_see_calendar', label: t.familyCalendar, emoji: '📅' },
  { key: 'can_see_milestones', label: t.familyMilestones, emoji: '📸' },
  { key: 'can_see_knowledge', label: t.familyKnowledge, emoji: '📚' },
];

const getNotifications = (t) => [
  { key: 'notify_wonder_weeks', label: t.familyNotifWonderWeeks, emoji: '🐯' },
  { key: 'notify_sleep', label: t.familyNotifSleepLog, emoji: '😴' },
  { key: 'notify_calendar', label: t.familyNotifAppointments, emoji: '📅' },
];

export default function FamilyInvite() {
  const [user, setUser] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvite, setEditingInvite] = useState(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { t, lang } = useLanguage();
  const TITLE_SUGGESTIONS = getTitleSuggestions(t);
  const PERMISSIONS = getPermissions(t);
  const NOTIFICATIONS = getNotifications(t);

  const [form, setForm] = useState({
    invitee_email: '',
    invitee_title: '',
    can_see_sleep_log: true,
    can_see_wonder_weeks: true,
    can_see_calendar: true,
    can_see_milestones: true,
    can_see_knowledge: false,
    notify_wonder_weeks: true,
    notify_sleep: false,
    notify_calendar: true,
  });

  const hasActiveInvite = invites.some(i => i.status === 'pending' || i.status === 'accepted');

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [data, configs] = await Promise.all([
          base44.entities.FamilyInvite.filter({ inviter_email: u.email }),
          base44.entities.AppConfig.filter({ key: 'sharing_page' }),
        ]);
        setInvites(data);
        if (configs[0]) setPageConfig(configs[0]);
      } catch {
        showInAppLogin('/FamilyInvite');
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
    can_see_milestones: true,
    can_see_knowledge: false,
    notify_wonder_weeks: true,
    notify_sleep: false,
    notify_calendar: true,
  });

  const openEditSheet = (invite) => {
    setEditingInvite(invite);
    setEditForm({
      can_see_sleep_log: invite.can_see_sleep_log !== false,
      can_see_wonder_weeks: invite.can_see_wonder_weeks !== false,
      can_see_calendar: invite.can_see_calendar !== false,
      can_see_milestones: invite.can_see_milestones !== false,
      can_see_knowledge: invite.can_see_knowledge === true,
      notify_wonder_weeks: invite.notify_wonder_weeks !== false,
      notify_sleep: invite.notify_sleep === true,
      notify_calendar: invite.notify_calendar !== false,
    });
    setEditSheetOpen(true);
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const res = await base44.functions.invoke('updateFamilyInvite', {
        invite_id: editingInvite.id,
        permissions: editForm,
      });
      const updated = res.data?.invite || res?.invite;
      setInvites(prev => prev.map(i => i.id === editingInvite.id ? { ...i, ...updated } : i));
      setEditSheetOpen(false);
      setEditingInvite(null);
      toast.success(t.saved || 'Gemt');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSend = async () => {
    if (!form.invitee_email || !form.invitee_title) {
      toast.error(t.fillEmailAndTitle);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.invitee_email)) {
      toast.error(t.enterValidEmail);
      return;
    }
    setSaving(true);
    let invite;
    try {
      const res = await base44.functions.invoke('sendFamilyInvite', {
        ...form,
        inviter_email: user.email,
        inviter_name: user.full_name || user.email,
      });
      invite = res.data.invite;
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message);
      setSaving(false);
      return;
    }

    setInvites(prev => [invite, ...prev]);
    setSheetOpen(false);
    resetForm();
    setSaving(false);
    toast.success(`Invitation sendt til ${form.invitee_email} 🎉`);
  };

  const handleDelete = async (id) => {
    await base44.entities.FamilyInvite.delete(id);
    setInvites(prev => prev.filter(i => i.id !== id));
    toast.success(t.invitationDeleted);
  };

  const statusBadge = (status) => {
    if (status === 'accepted') return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t.statusAccepted}</span>;
    if (status === 'declined') return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{t.statusDeclined}</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{t.statusPending}</span>;
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
          {t.sharingAndAccess}
        </h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Intro */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {pageConfig?.intro_text || "Du er ikke alene, heller ikke i appen.\nDel rejsen med en, der betyder noget for dig. Du vælger selv, hvad personen skal kunne se og modtage notifikationer om."}
          </p>
        </div>

        {/* Invite button — hidden if active invite exists */}
        {!hasActiveInvite && (
          <Button
            className="w-full gap-2 h-12 text-base"
            onClick={() => { resetForm(); setSheetOpen(true); }}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <UserPlus className="w-5 h-5" />
            {pageConfig?.invite_button_label || 'Invitér en medbruger'}
          </Button>
        )}

        {/* Existing invites */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>
              {t.sentInvitations}
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
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {(invite.status === 'pending' || invite.status === 'accepted') && (
                    <button
                      onClick={() => openEditSheet(invite)}
                      className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
                      style={{ background: 'var(--color-bg-subtle)' }}
                    >
                      <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(invite.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
                    style={{ background: 'var(--color-bg-subtle)' }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {invites.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.noInvitationsYet}</p>
          </div>
        )}
      </div>

      {/* Invite Bottom Sheet */}
      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title={t.inviteFamilyMember}>
        <div className="px-5 py-2 space-y-5 pb-8">

          {/* Email */}
          <div className="space-y-1.5">
            <Label>{t.familyMemberEmailLabel}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <Input
                type="email"
                placeholder={t.familyMemberEmailPlaceholder}
                value={form.invitee_email}
                onChange={e => setForm({ ...form, invitee_email: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Titel */}
          <div className="space-y-1.5">
            <Label>{t.titleLabel}</Label>
            <Input
              placeholder={t.titlePlaceholder}
              value={form.invitee_title}
              onChange={e => setForm({ ...form, invitee_title: e.target.value })}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {TITLE_SUGGESTIONS.map(title => (
                <button
                  key={title}
                  onClick={() => setForm({ ...form, invitee_title: title })}
                  className="px-3 py-1 rounded-full text-xs border transition-all active:scale-95"
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
            <Label>{t.whatToShare}</Label>
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
            <Label>{t.notifications}</Label>
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
            {saving ? t.sending : t.sendInvitation}
          </Button>
        </div>
      </BottomSheet>

      {/* Edit Invite Bottom Sheet */}
      <BottomSheet open={editSheetOpen} onOpenChange={setEditSheetOpen} title={t.editPermissions}>
        <div className="px-5 py-2 space-y-5 pb-8">
          {editingInvite && (
            <div className="rounded-xl p-3 border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {editingInvite.invitee_title}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {editingInvite.invitee_email}
              </p>
            </div>
          )}

          {/* Adgang */}
          <div className="space-y-1.5">
            <Label>{t.whatToShare}</Label>
            <div className="rounded-2xl overflow-hidden border divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {PERMISSIONS.map(p => (
                <div key={p.key} className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{p.emoji} {p.label}</span>
                  <Switch
                    checked={editForm[p.key] ?? false}
                    onCheckedChange={val => setEditForm(prev => ({ ...prev, [p.key]: val }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifikationer */}
          <div className="space-y-1.5">
            <Label>{t.notifications}</Label>
            <div className="rounded-2xl overflow-hidden border divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {NOTIFICATIONS.map(n => (
                <div key={n.key} className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{n.emoji} {n.label}</span>
                  <Switch
                    checked={editForm[n.key] ?? false}
                    onCheckedChange={val => setEditForm(prev => ({ ...prev, [n.key]: val }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleEditSave}
            disabled={editSaving}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <Check className="w-5 h-5" />
            {editSaving ? (t.saving || 'Gemmer...') : (t.saveChanges || 'Gem ændringer')}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}