import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { WONDER_WEEKS } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function AdminWonderWeeks() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [emojis, setEmojis] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => showInAppLogin('/AdminWonderWeeks'));
  }, []);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['wonderWeekConfigs'],
    queryFn: () => base44.entities.WonderWeekConfig.list(),
  });

  // Initialize emojis from DB or defaults
  useEffect(() => {
    const map = {};
    WONDER_WEEKS.forEach(ww => { map[ww.number] = ww.emoji; });
    configs.forEach(c => { map[c.number] = c.emoji; });
    setEmojis(map);
  }, [configs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const ww of WONDER_WEEKS) {
        const existing = configs.find(c => c.number === ww.number);
        const emoji = emojis[ww.number] || ww.emoji;
        if (existing) {
          await base44.entities.WonderWeekConfig.update(existing.id, { number: ww.number, emoji });
        } else {
          await base44.entities.WonderWeekConfig.create({ number: ww.number, emoji });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wonderWeekConfigs']);
      toast.success(t.adminWonderWeeksSaved);
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>{t.adminWonderWeeksAdminOnly}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="pt-6 pb-2 px-6 relative flex items-center justify-center">
        <Link to={createPageUrl('Settings')} className="absolute left-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          {t.adminWonderWeeksTitle}
        </h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {t.adminWonderWeeksDesc}
        </p>

        {WONDER_WEEKS.map(ww => (
          <div
            key={ww.number}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            {/* Preview */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                backgroundColor: `${ww.color}20`,
                fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
              }}
            >
              {emojis[ww.number] || ww.emoji}
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {t.adminWonderWeeksWonder} {ww.number}
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {ww.name}
              </p>
            </div>

            <Input
              className="w-16 text-center text-xl"
              value={emojis[ww.number] || ''}
              onChange={e => setEmojis(prev => ({ ...prev, [ww.number]: e.target.value }))}
              style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
            />
          </div>
        ))}

        <Button
          className="w-full mt-4"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {t.adminWonderWeeksSave}
        </Button>
      </div>
    </div>
  );
}