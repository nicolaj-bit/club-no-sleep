import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from './UserAvatar';
import { cn } from '@/lib/utils';

export default function NearbyUserCard({ user, distance, onStartChat }) {
  const formattedDistance = distance < 1 
    ? `${Math.round(distance * 1000)} m` 
    : `${distance.toFixed(1)} km`;

  return (
    <div className="rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start gap-3">
        <UserAvatar 
          src={user.profile_image}
          name={user.display_name || user.username}
          size="lg"
          isOnline={user.is_online}
          showStatus
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {user.display_name || user.username}
            </h3>
            {user.role === 'expert' && (
              <span className="flex-shrink-0 bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                EKSPERT
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {formattedDistance} væk
            </span>
            {user.city && (
              <>
                <span style={{ color: 'var(--color-border)' }}>•</span>
                <span className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{user.city}</span>
              </>
            )}
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          className="rounded-full gap-1.5"
          onClick={() => onStartChat?.(user)}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </Button>
      </div>
    </div>
  );
}