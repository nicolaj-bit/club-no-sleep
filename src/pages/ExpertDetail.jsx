import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Star, MapPin, Clock, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/community/UserAvatar';

export default function ExpertDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id');

  const { data: expert, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="flex flex-col items-center py-8">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500">Ekspert ikke fundet</p>
      </div>
    );
  }

  const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Community')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-sm font-medium text-slate-500">Ekspert profil</span>
          <div className="w-9" />
        </div>
      </header>

      {/* Profile */}
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <UserAvatar 
            src={expert.profile_image}
            name={expert.name}
            size="2xl"
          />
          <h1 className="text-xl font-bold text-slate-900 mt-4">{expert.name}</h1>
          <p className="text-slate-500">{expert.title}</p>
          
          <div className="flex items-center gap-4 mt-3">
            {expert.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700">{expert.rating.toFixed(1)}</span>
                {expert.review_count > 0 && (
                  <span className="text-slate-400">({expert.review_count})</span>
                )}
              </div>
            )}
            {expert.city && (
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{expert.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Specialties */}
        {expert.specialties?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Specialer</h3>
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((specialty, i) => (
                <Badge 
                  key={i}
                  variant="secondary"
                  className="bg-slate-100 text-slate-600"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {expert.bio && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Om</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{expert.bio}</p>
          </div>
        )}

        {/* Availability */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Tilgængelighed</h3>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            {Object.entries(groupedAvailability).length === 0 ? (
              <p className="text-sm text-slate-500 text-center">Ingen tider sat op</p>
            ) : (
              Object.entries(groupedAvailability)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, slots]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium text-slate-700">
                      {dayNames[Number(day)]}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot, i) => (
                        <span key={i} className="text-sm text-slate-500 bg-white px-2 py-1 rounded-lg">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mt-6 bg-slate-900 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Konsultation</p>
            <p className="text-white text-2xl font-bold">{expert.hourly_rate} kr<span className="text-base font-normal"> / time</span></p>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 safe-area-bottom">
        <Link to={createPageUrl(`Booking?expertId=${expertId}`)}>
          <Button className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-base font-semibold gap-2">
            <Calendar className="w-5 h-5" />
            Book konsultation
          </Button>
        </Link>
      </div>
    </div>
  );
}