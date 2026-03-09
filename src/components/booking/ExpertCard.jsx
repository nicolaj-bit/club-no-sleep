import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin, Mail, Phone, Clock } from 'lucide-react';
import UserAvatar from '@/components/community/UserAvatar';
import { Badge } from '@/components/ui/badge';

export default function ExpertCard({ expert }) {
  return (
    <Link 
      to={createPageUrl(`ExpertDetail?id=${expert.id}`)}
      className="block rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex gap-4">
        <UserAvatar 
          src={expert.profile_image}
          name={expert.name}
          size="xl"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{expert.name}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{expert.title}</p>
          
          <div className="flex items-center gap-3 mt-2">
            {expert.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {expert.rating.toFixed(1)}
                </span>
                {expert.review_count > 0 && (
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    ({expert.review_count})
                  </span>
                )}
              </div>
            )}
            {expert.city && (
              <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{expert.city}</span>
              </div>
            )}
          </div>
          
          {expert.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {expert.specialties.slice(0, 3).map((specialty, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="font-normal text-xs"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
        {expert.contact_email && (
          <a
            href={`mailto:${expert.contact_email}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Mail className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            {expert.contact_email}
          </a>
        )}
        {expert.contact_phone && (
          <a
            href={`tel:${expert.contact_phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Phone className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            {expert.contact_phone}
          </a>
        )}
        {expert.opening_hours && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            {expert.opening_hours}
          </div>
        )}

      </div>
    </Link>
  );
}