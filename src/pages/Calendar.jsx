import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Bell, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';

// Native calendar helper — kun aktiv i Capacitor (iOS/Android)
const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;

async function addToNativeCalendar(event) {
  if (!isCapacitor) return;
  try {
    const { CapacitorCalendar } = await import('@capgo/capacitor-calendar');
    const perm = await CapacitorCalendar.requestWriteOnlyCalendarAccess();
    if (perm.result !== 'granted') return;
    const start = new Date(event.start_datetime).getTime();
    const end = event.end_datetime ? new Date(event.end_datetime).getTime() : start + 60 * 60 * 1000;
    await CapacitorCalendar.createEvent({
      title: event.title,
      notes: event.description || '',
      startDate: start,
      endDate: end,
    });
  } catch (e) {
    console.warn('Native calendar sync fejlede:', e);
  }
}

export default function Calendar() {
  const { t, lang } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const dateLocale = lang === 'en' ? enUS : da;
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_datetime: '', end_datetime: '', category: 'andet', notify_day_before: true, notify_30min_before: false });

  const CATEGORIES = [
    { key: 'jordemoder', label: lang === 'en' ? 'Midwife' : 'Jordemoder', emoji: '🤱' },
    { key: 'scanning', label: lang === 'en' ? 'Scan' : 'Scanning', emoji: '🔬' },
    { key: 'læge', label: lang === 'en' ? 'Doctor' : 'Læge', emoji: '🩺' },
    { key: 'legeaftale', label: lang === 'en' ? 'Playdate' : 'Legeaftale', emoji: '🧸' },
    { key: 'mødregruppe', label: lang === 'en' ? 'Mom group' : 'Mødregruppe', emoji: '👩‍👧' },
    { key: 'vaccination', label: lang === 'en' ? 'Vaccination' : 'Vaccination', emoji: '💉' },
    { key: 'andet', label: lang === 'en' ? 'Other' : 'Andet', emoji: '📅' },
  ];

  const getCategoryEmoji = (cat) => CATEGORIES.find(c => c.key === cat)?.emoji ?? '📅';
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['calendarEvents', user?.email],
    queryFn: () => base44.entities.CalendarEvent.filter({ user_email: user.email }, 'start_datetime'),
    enabled: !!user?.email
  });

  const createEvent = useMutation({
    mutationFn: (data) => base44.entities.CalendarEvent.create({ ...data, user_email: user.email }),
    onSuccess: async (savedEvent, variables) => {
      queryClient.invalidateQueries(['calendarEvents', user?.email]);
      setShowForm(false);
      setForm({ title: '', description: '', start_datetime: '', end_datetime: '', category: 'andet', notify_day_before: true, notify_30min_before: false });
      toast.success(t.eventCreated);
      // Sync til telefonens native kalender (kun i native app)
      await addToNativeCalendar({ ...variables, user_email: user.email });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => base44.entities.CalendarEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents', user?.email]);
      toast.success(t.eventDeleted);
    }
  });

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (startOfMonth(currentMonth).getDay() + 6) % 7; // Monday-first
  const blanks = Array(startWeekday).fill(null);

  const eventsOnDay = (day) => events.filter((e) => isSameDay(parseISO(e.start_datetime), day));
  const selectedDayEvents = eventsOnDay(selectedDay);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.start_datetime) {
      toast.error(t.fillTitleAndTime);
      return;
    }
    createEvent.mutate(form);
  };

  const prefillTime = () => {
    const d = format(selectedDay, 'yyyy-MM-dd');
    setForm((f) => ({ ...f, start_datetime: `${d}T09:00`, end_datetime: `${d}T10:00`, category: 'andet', notify_day_before: true, notify_30min_before: false }));
    setShowForm(true);
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader 
        title={t.calendarTitle}
        rightAction={
          <button
            onClick={prefillTime}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-5 h-5" style={{ color: 'var(--color-primary-foreground)' }} />
          </button>
        }
      />

      <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="500px">
      {/* Month navigation */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="p-2 rounded-full active:opacity-60" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <h2 className="text-base font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
        </h2>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="p-2 rounded-full active:opacity-60" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="px-5 grid grid-cols-7 mb-1">
        {t.weekdaysShort.map((d) =>
        <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="px-5 grid grid-cols-7 gap-1 mb-6">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {monthDays.map((day) => {
          const dayEvents = eventsOnDay(day);
          const isSelected = isSameDay(day, selectedDay);
          const todayDay = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center justify-start py-1.5 rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: isSelected ?
                'var(--color-primary)' :
                todayDay ? 'var(--color-bg-subtle)' : 'transparent',
                minHeight: '52px'
              }}>
              
              <span className="text-sm font-medium" style={{
                color: isSelected ? 'var(--color-bg)' : todayDay ? 'var(--color-accent)' : 'var(--color-text-primary)'
              }}>
                {format(day, 'd')}
              </span>
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                {dayEvents.slice(0, 3).map((_, i) =>
                <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-accent)' }} />
                )}
              </div>
            </button>);

        })}
      </div>

      {/* Selected day events */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-secondary)' }}>
            {format(selectedDay, lang === 'en' ? 'EEEE, MMMM d' : "EEEE 'd.' d. MMMM", { locale: dateLocale })}
          </h3>
          <button onClick={prefillTime} className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
            <Plus className="w-3.5 h-3.5" /> {t.addEvent}
          </button>
        </div>

        {selectedDayEvents.length === 0 ?
        <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>{t.noEventsToday}</p> :

        <div className="space-y-2">
            {selectedDayEvents.map((event) =>
          <div
          key={event.id}
          className={`flex items-start gap-3 rounded-2xl p-4 border ${event.category === 'milepæl' ? 'cursor-pointer active:opacity-70' : ''}`}
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          onClick={() => event.category === 'milepæl' && navigate(`/Milestones${event.milestone_id?.startsWith('age-') ? `?open=${event.milestone_id}` : ''}`)}>

              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                {getCategoryEmoji(event.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {format(parseISO(event.start_datetime), 'HH:mm')}
                      {event.end_datetime && ` – ${format(parseISO(event.end_datetime), 'HH:mm')}`}
                    </span>
                  </div>
                  {event.description &&
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{event.description}</p>
              }
                </div>
                <button
              onClick={() => deleteEvent.mutate(event.id)}
              className="p-1.5 rounded-lg active:opacity-60"
              style={{ color: 'var(--color-text-muted)' }}>
              
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
          )}
          </div>
        }
      </div>
      </ContentLock>

      {/* Add event bottom sheet */}
      <AnimatePresence>
        {showForm &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowForm(false)} />
          
            <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="rounded-t-3xl fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
            style={{ maxHeight: '92dvh', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            
              {/* Fixed header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.newEvent}</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-6">
              <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                {/* Category picker */}
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{lang === 'da' ? 'Kategori' : 'Category'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={form.category === cat.key
                          ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
                          : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.eventTitle}</Label>
                  <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t.eventTitlePlaceholder}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventStart}</Label>
                  <Input
                  type="datetime-local"
                  value={form.start_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventEnd}</Label>
                  <Input
                  type="datetime-local"
                  value={form.end_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventDescription}</Label>
                   <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t.eventDescPlaceholder}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                {/* Notification toggles */}
                <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Bell className="w-3.5 h-3.5" /> {lang === 'da' ? 'Notifikationer' : 'Notifications'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'da' ? '📲 Dagen før' : '📲 Day before'}
                    </span>
                    <Switch
                      checked={form.notify_day_before}
                      onCheckedChange={(v) => setForm(f => ({ ...f, notify_day_before: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'da' ? '⏰ 30 min før' : '⏰ 30 min before'}
                    </span>
                    <Switch
                      checked={form.notify_30min_before}
                      onCheckedChange={(v) => setForm(f => ({ ...f, notify_30min_before: v }))}
                    />
                  </div>
                </div>

                <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                disabled={createEvent.isPending}>
                
                  {createEvent.isPending ? t.saving : t.saveEvent}
                </Button>
              </form>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}