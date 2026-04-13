import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Branded expert avatar — matches LALATOTO's warm sand & chocolate palette
function ExpertAvatar({ src, name }) {
  if (src) {
    return (
      <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-2xl object-cover"
          style={{ border: '2px solid var(--color-border)' }}
        />
      </div>
    );
  }
  // Illustrated placeholder
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden"
      style={{
        width: 72, height: 72,
        background: 'linear-gradient(145deg, #F3EDE4 0%, #E8D9C8 100%)',
        border: '2px solid var(--color-border)',
      }}
    >
      {/* Decorative arc / halo */}
      <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full" aria-hidden>
        <circle cx="36" cy="36" r="34" fill="none" stroke="#C8A882" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        <circle cx="36" cy="36" r="26" fill="none" stroke="#C8A882" strokeWidth="0.5" opacity="0.35" />
      </svg>
      {/* Person silhouette */}
      <svg viewBox="0 0 40 44" width="36" height="40" style={{ color: '#A0785A', position: 'relative', zIndex: 1 }} fill="currentColor">
        {/* Head */}
        <ellipse cx="20" cy="10" rx="7.5" ry="8" opacity="0.9" />
        {/* Shoulders / body */}
        <path d="M4 38 C4 28 8 24 20 24 C32 24 36 28 36 38" opacity="0.75" />
        {/* Small leaf / heart accent */}
        <path d="M17 14 Q20 10 23 14 Q20 18 17 14Z" fill="#C8A882" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function ExpertCard({ expert }) {
  return (
    <Link 
      to={createPageUrl(`ExpertDetail?id=${expert.id}`)}
      className="block rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex gap-4">
        <ExpertAvatar src={expert.profile_image} name={expert.name} />
        
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