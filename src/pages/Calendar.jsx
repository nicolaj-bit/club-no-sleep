import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';
import { getDynamicItemsForDay, getCalendarMode, getPregnancyWeek, getBabyAgeInMonths } from '@/components/calendar/calendarUtils';
import { WONDER_WEEKS, getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';

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
  const { activeChild } = useActiveChild();
  const navigate = useNavigate();
  const dateLocale = lang === 'en' ? enUS : da;
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_datetime: '', end_datetime: '', category: 'andet', notify_day_before: true, notify_30min_before: false });

  const CATEGORIES = [
    { key: 'jordemoder', label: lang === 'en' ? 'Midwife' : 'Jordemoder', color: '#C29A73' },
    { key: 'scanning', label: lang === 'en' ? 'Scan' : 'Scanning', color: '#8B5E3C' },
    { key: 'læge', label: lang === 'en' ? 'Doctor' : 'Læge', color: '#B08D72' },
    { key: 'sundhedsplejerske', label: lang === 'en' ? 'Health nurse' : 'Sundhedsplejerske', color: '#D8B89A' },
    { key: 'osteopat', label: lang === 'en' ? 'Osteopath' : 'Osteopat', color: '#A0785A' },
    { key: 'barselscafé', label: lang === 'en' ? 'Maternity café' : 'Barselscafé', color: '#C8A882' },
    { key: 'mødregruppe', label: lang === 'en' ? 'Mom group' : 'Mødregruppe', color: '#7A665A' },
    { key: 'vaccination', label: lang === 'en' ? 'Vaccination' : 'Vaccination', color: '#5B3F2B' },
    { key: 'fødselsforberedelse', label: lang === 'en' ? 'Birth prep' : 'Fødselsforberedelse', color: '#DCC1B0' },
    { key: 'andet', label: lang === 'en' ? 'Other' : 'Andet', color: '#B7A79A' },
  ];

  const getCategoryColor = (cat) => CATEGORIES.find(c => c.key === cat)?.color ?? '#B7A79A';
  const getItemColor = (item) => {
    if (item.id) return getCategoryColor(item.category);
    if (item.type === 'pregnancy_week') return '#C29A73';
    if (item.type === 'wonder_week') return '#8B5E3C';
    if (item.type === 'age_milestone') return '#D8B89A';
    if (item.type === 'birthday') return '#B08D72';
    return '#B7A79A';
  };
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

  // Determine dates from active child or user profile
  const dueDate = activeChild?.due_date || user?.child_due_date;
  const birthDate = activeChild?.birthdate || user?.child_birthdate;
  const calendarMode = getCalendarMode(dueDate, birthDate);

  // Calculate dynamic items for any given day
  const dynamicItemsOnDay = (day) => {
    return getDynamicItemsForDay(dueDate, birthDate, day);
  };

  // All items on a day (user events + dynamic)
  const allItemsOnDay = (day) => {
    const userEvents = events.filter((e) => isSameDay(parseISO(e.start_datetime), day));
    const dynamic = dynamicItemsOnDay(day);
    return [...userEvents, ...dynamic];
  };

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (startOfMonth(currentMonth).getDay() + 6) % 7;
  const blanks = Array(startWeekday).fill(null);

  const selectedDayItems = allItemsOnDay(selectedDay);

  // Status banner info
  const pregnancyWeek = calendarMode === 'pregnancy' ? getPregnancyWeek(dueDate) : null;
  const babyAgeMonths = calendarMode === 'baby' ? getBabyAgeInMonths(birthDate) : null;
  const wwAge = dueDate ? getAgeInWeeks(dueDate, birthDate) : null;
  const currentWW = wwAge !== null ? getCurrentWonderWeek(wwAge) : null;

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

  const handleItemClick = (item) => {
    if (item.link) navigate(item.link);
  };

  const renderDayDot = (day) => {
    const items = allItemsOnDay(day);
    if (items.length === 0) return null;
    const dots = items.slice(0, 3);
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {dots.map((item, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getItemColor(item) }} />
        ))}
        {items.length > 3 && (
          <span className="text-[8px] leading-none ml-0.5" style={{ color: 'var(--color-text-muted)' }}>+</span>
        )}
      </div>
    );
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
        {/* Status banner */}
        {calendarMode !== 'none' && (
          <div className="mx-5 mb-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: calendarMode === 'pregnancy' ? '#C29A73' : '#D8B89A' }}>
                <span className="w-3 h-3 rounded-full bg-white/80" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  {calendarMode === 'pregnancy' ? (lang === 'en' ? 'Pregnancy mode' : 'Graviditetsmode') : (lang === 'en' ? 'Baby mode' : 'Babymode')}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {calendarMode === 'pregnancy'
                    ? (lang === 'en' ? `Week ${pregnancyWeek}` : `Uge ${pregnancyWeek}`)
                    : (lang === 'en' ? `${babyAgeMonths} months old` : `${babyAgeMonths} måneder gammel`)}
                </p>
              </div>
            </div>
            {currentWW && currentWW.status !== 'complete' && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentWW.status === 'active'
                    ? (lang === 'en' ? `Wonder week ${currentWW.number} — active now` : `Tigerspring ${currentWW.number} — aktiv nu`)
                    : (lang === 'en' ? `Wonder week ${currentWW.number} in ${currentWW.weeksUntil} weeks` : `Tigerspring ${currentWW.number} om ${currentWW.weeksUntil} uger`)}
                </p>
              </div>
            )}
          </div>
        )}

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
            const dayItems = allItemsOnDay(day);
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
                <div className="mt-0.5 h-3 flex items-center justify-center">
                  {dayItems.length > 0 && renderDayDot(day)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected day items */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-secondary)' }}>
              {format(selectedDay, lang === 'en' ? 'EEEE, MMMM d' : "EEEE 'd.' d. MMMM", { locale: dateLocale })}
            </h3>
            <button onClick={prefillTime} className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              <Plus className="w-3.5 h-3.5" /> {t.addEvent}
            </button>
          </div>

          {selectedDayItems.length === 0 ?
          <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>{t.noEventsToday}</p> :

          <div className="space-y-2">
            {selectedDayItems.map((item, idx) => {
              const isUserEvent = !!item.id;
              const isDynamic = !isUserEvent;
              return (
                <div
                  key={item.id || `dyn-${idx}`}
                  className={`flex items-start gap-3 rounded-2xl p-4 border ${isDynamic ? 'cursor-pointer active:opacity-70' : ''}`}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  onClick={() => isDynamic && handleItemClick(item)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getItemColor(item) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {isUserEvent ? item.title : item.headline || item.title}
                    </p>
                    {isUserEvent && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {format(parseISO(item.start_datetime), 'HH:mm')}
                          {item.end_datetime && ` – ${format(parseISO(item.end_datetime), 'HH:mm')}`}
                        </span>
                      </div>
                    )}
                    {isDynamic && item.message && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.message}</p>
                    )}
                    {isUserEvent && item.description &&
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                    }
                  </div>
                  {isUserEvent && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteEvent.mutate(item.id); }}
                      className="p-1.5 rounded-lg active:opacity-60"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
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
            style={{ backgroundColor: 'var(--color-bg-card)', maxHeight: '92dvh', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>

              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.newEvent}</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6">
              <form onSubmit={handleSubmit} className="space-y-4 pb-4">
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
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }} /> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="!space-y-1.5">
                  <Label>{t.eventTitle}</Label>
                  <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t.eventTitlePlaceholder}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="!space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventStart}</Label>
                  <Input
                  type="datetime-local"
                  value={form.start_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="!space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventEnd}</Label>
                  <Input
                  type="datetime-local"
                  value={form.end_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="!space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>{t.eventDescription}</Label>
                   <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t.eventDescPlaceholder}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Bell className="w-3.5 h-3.5" /> {lang === 'da' ? 'Notifikationer' : 'Notifications'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'da' ? 'Dagen før' : 'Day before'}
                    </span>
                    <Switch
                      checked={form.notify_day_before}
                      onCheckedChange={(v) => setForm(f => ({ ...f, notify_day_before: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'da' ? '30 min før' : '30 min before'}
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