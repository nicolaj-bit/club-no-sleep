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
      className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        <UserAvatar 
          src={expert.profile_image}
          name={expert.name}
          size="xl"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900">{expert.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{expert.title}</p>
          
          <div className="flex items-center gap-3 mt-2">
            {expert.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-700">
                  {expert.rating.toFixed(1)}
                </span>
                {expert.review_count > 0 && (
                  <span className="text-sm text-slate-400">
                    ({expert.review_count})
                  </span>
                )}
              </div>
            )}
            {expert.city && (
              <div className="flex items-center gap-1 text-slate-400">
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
                  className="bg-slate-100 text-slate-600 font-normal text-xs"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        {expert.contact_email && (
          <a
            href={`mailto:${expert.contact_email}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            {expert.contact_email}
          </a>
        )}
        {expert.contact_phone && (
          <a
            href={`tel:${expert.contact_phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Phone className="w-4 h-4 text-slate-400" />
            {expert.contact_phone}
          </a>
        )}
        {expert.opening_hours && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            {expert.opening_hours}
          </div>
        )}
        {expert.hourly_rate && (
          <div className="pt-1">
            <span className="text-base font-semibold text-slate-900">{expert.hourly_rate} kr</span>
            <span className="text-sm text-slate-400"> / time</span>
          </div>
        )}
      </div>
    </Link>
  );
}