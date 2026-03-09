import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, isAfter, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';
import UserAvatar from '@/components/community/UserAvatar';

export default function Booking() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('expertId');
  
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1); // 1: date, 2: time, 3: confirm
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: expert, isLoading: loadingExpert } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: async () => {
      const experts = await base44.entities.Expert.filter({ id: expertId });
      return experts[0];
    },
    enabled: !!expertId,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['expertAvailability', expertId],
    queryFn: () => base44.entities.ExpertAvailability.filter({ 
      expert_id: expertId,
      is_available: true 
    }),
    enabled: !!expertId,
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['expertBookings', expertId, selectedDate],
    queryFn: () => base44.entities.Booking.filter({ 
      expert_id: expertId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: ['pending', 'confirmed']
    }),
    enabled: !!expertId && !!selectedDate,
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const booking = await base44.entities.Booking.create({
        expert_id: expertId,
        expert_name: expert.name,
        client_email: user.email,
        client_name: userProfile?.display_name || user.full_name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        duration_minutes: 60,
        price: expert.hourly_rate,
        notes,
        status: 'pending',
      });
      return booking;
    },
    onSuccess: () => {
      toast.success('Booking bekræftet!');
      window.location.href = createPageUrl('MyBookings');
    },
    onError: () => {
      toast.error('Kunne ikke oprette booking');
    },
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  // Get available slots for selected date
  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    
    const slots = [];
    dayAvailability.forEach(avail => {
      const startHour = parseInt(avail.start_time.split(':')[0]);
      const endHour = parseInt(avail.end_time.split(':')[0]);
      
      for (let h = startHour; h < endHour; h++) {
        const start = `${h.toString().padStart(2, '0')}:00`;
        const end = `${(h + 1).toString().padStart(2, '0')}:00`;
        
        // Check if slot is already booked
        const isBooked = existingBookings.some(b => b.start_time === start);
        
        // Check if slot is in the past
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(h, 0, 0, 0);
        const isPast = !isAfter(slotDateTime, new Date());
        
        if (!isBooked && !isPast) {
          slots.push({ start, end });
        }
      }
    });
    
    return slots;
  };

  const availableSlots = getAvailableSlots();

  if (loadingExpert) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <Link to={createPageUrl(`ExpertDetail?id=${expertId}`)}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Trin {step} af 3
          </span>
          <div className="w-9" />
        </div>
      </header>

      {/* Expert Info */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <UserAvatar 
            src={expert?.profile_image}
            name={expert?.name}
            size="lg"
          />
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{expert?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{expert?.title}</p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Date */}
      {step === 1 && (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Vælg dato</h3>
          
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {format(weekStart, 'd. MMM', { locale: da })} - {format(addDays(weekStart, 6), 'd. MMM yyyy', { locale: da })}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, i) => {
              const dayOfWeek = date.getDay();
              const hasAvailability = availability.some(a => a.day_of_week === dayOfWeek);
              const isPast = !isAfter(date, new Date()) && !isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!isPast && hasAvailability) {
                      setSelectedDate(date);
                    }
                  }}
                  disabled={isPast || !hasAvailability}
                  className="flex flex-col items-center p-2 rounded-xl transition-all"
                  style={isSelected
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                    : isPast || !hasAvailability
                      ? { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }
                      : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }
                  }
                >
                  <span className="text-[10px] font-medium">{dayNames[i]}</span>
                  <span className="text-lg font-semibold">{format(date, 'd')}</span>
                </button>
              );
            })}
          </div>

          <Button 
            className="w-full mt-4"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            disabled={!selectedDate}
            onClick={() => setStep(2)}
          >
            Fortsæt
          </Button>
        </div>
      )}

      {/* Step 2: Select Time */}
      {step === 2 && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {format(selectedDate, 'EEEE d. MMMM', { locale: da })}
            </span>
          </div>

          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Vælg tidspunkt</h3>

          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Ingen ledige tider denne dag</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  className="p-3 rounded-xl text-sm font-medium transition-all"
                  style={selectedSlot?.start === slot.start
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)' }
                  }
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Tilbage
            </Button>
            <Button 
              className="flex-1"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              disabled={!selectedSlot}
              onClick={() => setStep(3)}
            >
              Fortsæt
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Bekræft booking</h3>

          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {format(selectedDate, 'EEEE d. MMMM yyyy', { locale: da })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {selectedSlot?.start} - {selectedSlot?.end}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Noter til eksperten (valgfrit)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Beskriv hvad du gerne vil tale om..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-primary)' }}>
            <span style={{ color: 'var(--color-bg)', opacity: 0.7 }}>Total</span>
            <span className="text-xl font-bold" style={{ color: 'var(--color-bg)' }}>{expert?.hourly_rate} kr</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Tilbage
            </Button>
            <Button 
              className="flex-1 gap-2"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              onClick={() => createBookingMutation.mutate()}
              disabled={createBookingMutation.isPending}
            >
              <Check className="w-5 h-5" />
              Bekræft booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}