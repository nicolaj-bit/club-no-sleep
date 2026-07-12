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
import { useLanguage } from '@/components/ui/LanguageContext';
import PageHeader from '@/components/ui/PageHeader';

export default function ExpertDetail() {
  const { t } = useLanguage();
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
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>{t.expertDetailNotFound}</p>
      </div>
    );
  }

  const dayNames = [t.weekdaysShort[6], t.weekdaysShort[0], t.weekdaysShort[1], t.weekdaysShort[2], t.weekdaysShort[3], t.weekdaysShort[4], t.weekdaysShort[5]];
  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title={t.expertDetailProfile} backUrl={createPageUrl('Community')} />

      {/* Profile */}
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <UserAvatar 
            src={expert.profile_image}
            name={expert.name}
            size="2xl"
          />
          <h1 className="text-xl font-bold mt-4" style={{ color: 'var(--color-text-primary)' }}>{expert.name}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{expert.title}</p>
          
          <div className="flex items-center gap-4 mt-3">
            {expert.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{expert.rating.toFixed(1)}</span>
                {expert.review_count > 0 && (
                  <span style={{ color: 'var(--color-text-muted)' }}>({expert.review_count})</span>
                )}
              </div>
            )}
            {expert.city && (
              <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin className="w-4 h-4" />
                <span>{expert.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Specialties */}
        {expert.specialties?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{t.expertDetailSpecialties}</h3>
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((specialty, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-full"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {expert.bio && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{t.expertDetailAbout}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{expert.bio}</p>
          </div>
        )}

        {/* Availability */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{t.expertDetailAvailability}</h3>
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            {Object.entries(groupedAvailability).length === 0 ? (
              <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>{t.expertDetailNoTimes}</p>
            ) : (
              Object.entries(groupedAvailability)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, slots]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {dayNames[Number(day)]}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot, i) => (
                        <span key={i} className="text-sm px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>
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
        <div className="mt-6 rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div>
            <p className="text-sm" style={{ color: 'var(--color-bg)', opacity: 0.7 }}>{t.expertDetailConsultation}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-bg)' }}>{expert.hourly_rate} kr<span className="text-base font-normal"> {t.expertDetailPerHour}</span></p>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <Link to={createPageUrl(`Booking?expertId=${expertId}`)}>
          <Button className="w-full h-12 rounded-full text-base font-semibold gap-2" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
            <Calendar className="w-5 h-5" />
            {t.expertDetailBookConsultation}
          </Button>
        </Link>
      </div>
    </div>
  );
}