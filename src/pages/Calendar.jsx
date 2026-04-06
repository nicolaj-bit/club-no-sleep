import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { da } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_datetime: '', end_datetime: '' });
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
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents', user?.email]);
      setShowForm(false);
      setForm({ title: '', description: '', start_datetime: '', end_datetime: '' });
      toast.success('Aftale oprettet');
    }
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => base44.entities.CalendarEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents', user?.email]);
      toast.success('Aftale slettet');
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
      toast.error('Udfyld titel og starttidspunkt');
      return;
    }
    createEvent.mutate(form);
  };

  const prefillTime = () => {
    const d = format(selectedDay, 'yyyy-MM-dd');
    setForm((f) => ({ ...f, start_datetime: `${d}T09:00`, end_datetime: `${d}T10:00` }));
    setShowForm(true);
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Kalender</h1>
        <button
          onClick={prefillTime}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
          
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Month navigation */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="p-2 rounded-full active:opacity-60" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <h2 className="text-base font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: da })}
        </h2>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="p-2 rounded-full active:opacity-60" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="px-5 grid grid-cols-7 mb-1">
        {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((d) =>
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
            {format(selectedDay, "EEEE 'd.' d. MMMM", { locale: da })}
          </h3>
          <button onClick={prefillTime} className="text-xs flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
            <Plus className="w-3.5 h-3.5" /> Tilføj
          </button>
        </div>

        {selectedDayEvents.length === 0 ?
        <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>Ingen aftaler denne dag</p> :

        <div className="space-y-2">
            {selectedDayEvents.map((event) =>
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            
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
            transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="bg-transparent p-6 rounded-t-3xl fixed bottom-0 left-0 right-0 z-50"

            style={{ backgroundColor: 'var(--color-bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ny aftale</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Titel *</Label>
                  <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Fx lægebesøg, vaccination..."
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>Start *</Label>
                  <Input
                  type="datetime-local"
                  value={form.start_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>Slut (valgfrit)</Label>
                  <Input
                  type="datetime-local"
                  value={form.end_datetime}
                  onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--color-text-primary)' }}>Beskrivelse (valgfrit)</Label>
                  <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Evt. adresse eller noter..."
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                
                </div>
                <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                disabled={createEvent.isPending}>
                
                  {createEvent.isPending ? 'Gemmer...' : 'Gem aftale'}
                </Button>
              </form>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
                📲 Du får besked dagen før og 30 min før aftalen
              </p>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}