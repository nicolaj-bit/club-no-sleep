import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Send, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';

const categories = [
  'Generelt',
  'Pleje',
  'Udstyr',
  'Sundhed',
  'Træning',
  'Andet',
];

export default function AskQuestion() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: '' });
  const [showCategorySheet, setShowCategorySheet] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Question.create({
        ...form,
        author_username: userProfile?.username || user?.full_name || user?.email?.split('@')[0],
        author_image: userProfile?.profile_image,
        status: 'open',
        answer_count: 0,
      });
    },
    onSuccess: () => {
      toast.success('Spørgsmål oprettet');
      window.location.href = createPageUrl('Knowledge');
    },
    onError: () => {
      toast.error('Kunne ikke oprette spørgsmål');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Udfyld venligst alle felter');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Stil et spørgsmål" backUrl={createPageUrl('Knowledge')} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Category picker */}
        <div className="space-y-2">
          <Label style={{ color: 'var(--color-text-secondary)' }}>Kategori</Label>
          <button
            type="button"
            onClick={() => setShowCategorySheet(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: form.category ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            <span>{form.category || 'Vælg kategori'}</span>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" style={{ color: 'var(--color-text-secondary)' }}>Titel</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Hvad vil du gerne vide?"
            maxLength={100}
          />
          <p className="text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>{form.title.length}/100</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" style={{ color: 'var(--color-text-secondary)' }}>Uddyb dit spørgsmål</Label>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value.slice(0, 2000) })}
            placeholder="Beskriv dit spørgsmål i detaljer..."
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>{form.content.length}/2000</p>
        </div>

        <div className="rounded-xl p-3 flex gap-2 text-sm" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
          <span>🤖</span>
          <p><strong>Du chatter med en AI-assistent.</strong> Den kan generere forkerte oplysninger og erstatter ikke professionel rådgivning fra læge eller sundhedspersonale.</p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-full gap-2"
          disabled={createMutation.isPending}
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <Send className="w-5 h-5" />
          Send spørgsmål
        </Button>
      </form>

      {/* Category BottomSheet */}
      <BottomSheet
        open={showCategorySheet}
        onOpenChange={setShowCategorySheet}
        title="Vælg kategori"
      >
        <div className="py-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setForm({ ...form, category: cat });
                setShowCategorySheet(false);
              }}
              className="w-full flex items-center justify-between px-5 py-4 active:opacity-60 transition-opacity text-left"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="text-[15px] font-medium">{cat}</span>
              {form.category === cat && (
                <Check className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              )}
            </button>
          ))}
          <div className="h-2" />
        </div>
      </BottomSheet>
    </div>
  );
}