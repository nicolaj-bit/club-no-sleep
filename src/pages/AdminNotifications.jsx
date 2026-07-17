import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, Pencil, Trash2, Send, Bell, Clock, Calendar, BookOpen, Moon, MessageSquare, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

const getTriggerTypes = (t) => [
  { value: 'manual', label: t.adminNotificationsManual, description: t.adminNotificationsManualDesc, icon: Send },
  { value: 'scheduled', label: t.adminNotificationsScheduled, description: t.adminNotificationsScheduledDesc, icon: Clock },
  { value: 'calendar_event', label: t.adminNotificationsCalendar, description: t.adminNotificationsCalendarDesc, icon: Calendar },
  { value: 'new_blog', label: t.adminNotificationsBlog, description: t.adminNotificationsBlogDesc, icon: BookOpen },
  { value: 'sleep_log', label: t.adminNotificationsSleep, description: t.adminNotificationsSleepDesc, icon: Moon },
  { value: 'new_question', label: t.adminNotificationsQuestion, description: t.adminNotificationsQuestionDesc, icon: MessageSquare },
];

const getDays = (t) => [t.daySun, 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];

const emptyRule = {
  name: '',
  trigger_type: 'manual',
  schedule_time: '09:00',
  schedule_days: [],
  title: '',
  message: '',
  url: '',
  target_segment: 'all',
  is_active: true,
};

export default function AdminNotifications() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') showInAppLogin();
      else setUser(u);
    }).catch(() => showInAppLogin());
  }, []);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['pushRules'],
    queryFn: () => base44.entities.PushNotificationRule.list('-created_date', 50),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isNew) return base44.entities.PushNotificationRule.create(data);
      return base44.entities.PushNotificationRule.update(editing.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pushRules']);
      toast.success(t.save);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PushNotificationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pushRules']);
      toast.success(t.adminEditorDeleted);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PushNotificationRule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['pushRules']),
  });

  const handleSendNow = async (rule) => {
    setSending(rule.id);
    const res = await base44.functions.invoke('processPushRules', { rule_id: rule.id, send_now: true });
    setSending(null);
    if (res.data?.success) {
      toast.success(`Sendt til ${res.data.recipients ?? '?'} modtagere`);
    } else {
      toast.error('Fejl ved afsendelse');
    }
  };

  if (!user) return null;

  // ── EDIT VIEW ──────────────────────────────────────────────
  if (editing) {
    const TRIGGER_TYPES = getTriggerTypes(t);
    const triggerInfo = TRIGGER_TYPES.find(tr => tr.value === editing.trigger_type);

    return (
      <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? t.adminNotificationsNew : t.adminNotificationsEdit}
          </h1>
          <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {saveMutation.isPending ? t.adminEditorSaving : t.save}
          </Button>
        </div>

        <div className="p-4 space-y-5 max-w-lg mx-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminNotificationsName}</Label>
            <Input
              value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
              placeholder={t.adminNotificationsNamePlaceholder}
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Trigger type */}
          <div className="space-y-2">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminNotificationsTrigger}</Label>
            <div className="space-y-2">
              {TRIGGER_TYPES.map(tr => {
                const Icon = tr.icon;
                const selected = editing.trigger_type === tr.value;
                return (
                  <button
                    key={tr.value}
                    onClick={() => setEditing({ ...editing, trigger_type: tr.value })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all"
                    style={{
                      backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                      borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: selected ? 'var(--color-bg)' : 'var(--color-accent)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: selected ? 'var(--color-bg)' : 'var(--color-text-primary)' }}>{tr.label}</p>
                      <p className="text-xs" style={{ color: selected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>{tr.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduled options */}
          {editing.trigger_type === 'scheduled' && (
            <div className="space-y-4 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>{t.adminNotificationsScheduled}</Label>
                <Input
                  type="time"
                  value={editing.schedule_time || '09:00'}
                  onChange={e => setEditing({ ...editing, schedule_time: e.target.value })}
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--color-text-secondary)' }}>Ugedage (tom = alle dage)</Label>
                <div className="flex gap-2 flex-wrap">
                  {getDays(t).map((day, i) => {
                    const active = (editing.schedule_days || []).includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const days = editing.schedule_days || [];
                          setEditing({
                            ...editing,
                            schedule_days: active ? days.filter(d => d !== i) : [...days, i],
                          });
                        }}
                        className="w-10 h-10 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-card)',
                          color: active ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                          border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Calendar event tip */}
          {editing.trigger_type === 'calendar_event' && (
            <div className="p-3 rounded-2xl text-xs" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
              💡 Du kan bruge <strong>{'{title}'}</strong> og <strong>{'{date}'}</strong> i titlen og beskeden — de erstattes automatisk med aftaleoplysningerne.
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Notifikationens titel</Label>
            <Input
              value={editing.title}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              placeholder="fx Ny aftale i din kalender 📅"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.pushNotificationSenderMessage}</Label>
            <textarea
              value={editing.message}
              onChange={e => setEditing({ ...editing, message: e.target.value })}
              rows={3}
              placeholder="fx {title} er tilføjet til din kalender"
              className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label style={{ color: 'var(--color-text-secondary)' }}>{t.pushNotificationSenderLink}</Label>
            <Input
              value={editing.url || ''}
              onChange={e => setEditing({ ...editing, url: e.target.value })}
              placeholder="fx /Calendar"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Target segment */}
          <div className="space-y-2">
            <Label style={{ color: 'var(--color-text-secondary)' }}>Modtagere</Label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Alle brugere' },
                { value: 'moms', label: 'Kun mødre' },
                { value: 'dads', label: 'Kun fædre' },
              ].map(seg => {
                const selected = (editing.target_segment || 'all') === seg.value;
                return (
                  <button
                    key={seg.value}
                    type="button"
                    onClick={() => setEditing({ ...editing, target_segment: seg.value })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all"
                    style={{
                      backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                      borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                      color: selected ? 'var(--color-bg)' : 'var(--color-text-primary)',
                    }}
                  >
                    <span className="text-sm font-medium">{seg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Aktiv</span>
            <Switch
              checked={editing.is_active !== false}
              onCheckedChange={v => setEditing({ ...editing, is_active: v })}
            />
          </div>

          <Button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending} className="w-full"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            {saveMutation.isPending ? t.adminEditorSaving : t.save}
          </Button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  const TRIGGER_TYPES = getTriggerTypes(t);
  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <Link to="/Settings">
          <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{t.adminNotificationsTitle}</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Regler & automatiske udsendelser</p>
        </div>
        <button
          onClick={() => { setIsNew(true); setEditing({ ...emptyRule }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <Plus className="w-4 h-4" /> {t.adminEditorNewBtn}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.adminEditorLoading}</p>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen regler endnu</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Opret din første notifikationsregel</p>
          </div>
        ) : (
          rules.map(rule => {
            const triggerInfo = TRIGGER_TYPES.find(t => t.value === rule.trigger_type);
            const Icon = triggerInfo?.icon || Zap;
            return (
              <div key={rule.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: rule.is_active ? 'var(--color-bg-subtle)' : 'var(--color-bg-subtle)' }}>
                    <Icon className="w-4 h-4" style={{ color: rule.is_active ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{rule.name || rule.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {triggerInfo?.label}
                      {rule.trigger_type === 'scheduled' && rule.schedule_time && ` · kl. ${rule.schedule_time}`}
                      {rule.last_triggered_at && ` · Senest: ${new Date(rule.last_triggered_at).toLocaleDateString('da-DK')}`}
                    </p>
                  </div>
                  <Switch
                    checked={rule.is_active !== false}
                    onCheckedChange={v => toggleMutation.mutate({ id: rule.id, is_active: v })}
                  />
                </div>

                <div className="flex border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    onClick={() => handleSendNow(rule)}
                    disabled={sending === rule.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-opacity active:opacity-60"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending === rule.id ? t.sending : t.adminLandingSyncNow}
                  </button>
                  <div className="w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                  <button
                    onClick={() => { setIsNew(false); setEditing({ ...rule }); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-opacity active:opacity-60"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> {t.adminEditorEditPrefix}
                  </button>
                  <div className="w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                  <button
                    onClick={() => { if (confirm(t.areYouSure)) deleteMutation.mutate(rule.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-opacity active:opacity-60 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Slet
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}