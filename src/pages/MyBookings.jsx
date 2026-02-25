import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Calendar, Clock, MapPin, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isAfter, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyBookings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter(
      { client_email: user.email },
      '-date'
    ),
    enabled: !!user?.email,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => base44.entities.Booking.update(bookingId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myBookings']);
      toast.success('Booking aflyst');
    },
  });

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const bookingDate = parseISO(`${b.date}T${b.start_time}`);
    return isAfter(bookingDate, now) && b.status !== 'cancelled';
  });
  const pastBookings = bookings.filter(b => {
    const bookingDate = parseISO(`${b.date}T${b.start_time}`);
    return !isAfter(bookingDate, now) || b.status === 'cancelled';
  });

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-500',
    completed: 'bg-blue-100 text-blue-700',
  };

  const statusLabels = {
    pending: 'Afventer',
    confirmed: 'Bekræftet',
    cancelled: 'Aflyst',
    completed: 'Gennemført',
  };

  const BookingCard = ({ booking, showCancel }) => (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{booking.expert_name}</h3>
          {booking.service_type && (
            <p className="text-sm text-slate-500">{booking.service_type}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </span>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          {format(parseISO(booking.date), 'EEEE d. MMMM yyyy', { locale: da })}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          {booking.start_time} - {booking.end_time}
        </div>
      </div>
      
      {booking.notes && (
        <p className="mt-3 text-sm text-slate-500 italic">"{booking.notes}"</p>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="font-semibold text-slate-900">{booking.price} kr</span>
        
        {showCancel && booking.status !== 'cancelled' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                <X className="w-4 h-4 mr-1" />
                Aflys
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Aflys booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  Er du sikker på at du vil aflyse denne booking? Dette kan ikke fortrydes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuller</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => cancelMutation.mutate(booking.id)}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  Aflys booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Mine bookinger</h1>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="flex-1 rounded-lg">
              Kommende ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-lg">
              Tidligere ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Ingen kommende bookinger</p>
                <Link to={createPageUrl('Community')}>
                  <Button className="mt-4">Find en ekspert</Button>
                </Link>
              </div>
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} showCancel />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : pastBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Ingen tidligere bookinger</p>
              </div>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}