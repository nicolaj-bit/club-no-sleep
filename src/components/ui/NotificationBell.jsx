import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import { toast } from 'sonner';

function getReadKey(email) {
  return `lalatoto-read-notifications-${email || 'anonymous'}`;
}

function getReadIds(email) {
  try { return JSON.parse(localStorage.getItem(getReadKey(email)) || '[]'); } catch { return []; }
}

function markAllRead(ids, email) {
  const existing = getReadIds(email);
  const merged = [...new Set([...existing, ...ids])];
  localStorage.setItem(getReadKey(email), JSON.stringify(merged));
}

function setAppBadge(count) {
  if ('setAppBadge' in navigator) {
    if (count > 0) navigator.setAppBadge(count).catch(() => {});
    else navigator.clearAppBadge().catch(() => {});
  }
}

function vibrate() {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

// Eksporter unread count så BottomNav kan vise badge
export const notificationStore = { unreadCount: 0, listeners: [] };
export function subscribeToUnreadCount(fn) {
  notificationStore.listeners.push(fn);
  return () => { notificationStore.listeners = notificationStore.listeners.filter(l => l !== fn); };
}
function emitUnreadCount(count) {
  notificationStore.unreadCount = count;
  notificationStore.listeners.forEach(fn => fn(count));
}

export default function NotificationBell({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => getReadIds(userEmail));
  const ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      const all = await base44.entities.AppNotification.list('-published_at', 20);
      const visible = all.filter(n =>
        !n.target_emails || n.target_emails.length === 0 || n.target_emails.includes(userEmail)
      );
      setNotifications(visible);
      const unread = visible.filter(n => !getReadIds(userEmail).includes(n.id)).length;
      setAppBadge(unread);
      emitUnreadCount(unread);
    };
    if (userEmail) load();
  }, [userEmail]);

  // Real-time subscription — vis toast ved nye notifikationer
  useEffect(() => {
    if (!userEmail) return;
    const unsub = base44.entities.AppNotification.subscribe((event) => {
      if (event.type !== 'create') return;
      const n = event.data;
      if (n.target_emails && n.target_emails.length > 0 && !n.target_emails.includes(userEmail)) return;

      setNotifications(prev => {
        const updated = [n, ...prev];
        const unread = updated.filter(x => !getReadIds(userEmail).includes(x.id)).length;
        setAppBadge(unread);
        emitUnreadCount(unread);
        return updated;
      });

      vibrate();

      // Vis in-app toast
      toast(n.title, {
        description: n.message,
        duration: 6000,
        icon: n.emoji || '🔔',
      });
    });
    return () => unsub();
  }, [userEmail]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleOpen = () => {
    if (!open) {
      const allIds = notifications.map(n => n.id);
      markAllRead(allIds, userEmail);
      setReadIds(prev => [...new Set([...prev, ...allIds])]);
      setAppBadge(0);
      emitUnreadCount(0);
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notifikationer</p>
            {notifications.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{notifications.length} beskeder</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen notifikationer endnu</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const isUnread = !readIds.includes(n.id);
                const content = (
                  <div
                    className="px-4 py-3 border-b last:border-0 flex items-start gap-3"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: isUnread ? 'var(--color-bg-subtle)' : 'transparent' }}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{n.emoji || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                      {n.published_at && (
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDistanceToNow(new Date(n.published_at), { addSuffix: true, locale: da })}
                        </p>
                      )}
                    </div>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />}
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}