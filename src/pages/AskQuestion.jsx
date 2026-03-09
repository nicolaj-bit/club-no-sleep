import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const categories = [
  'Generelt',
  'Pleje',
  'Udstyr',
  'Sundhed',
  'Træning',
  'Andet'
];

export default function AskQuestion() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
  });

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
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Knowledge')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Stil et spørgsmål</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select 
            value={form.category} 
            onValueChange={(value) => setForm({ ...form, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vælg kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
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
          <Label htmlFor="content">Uddyb dit spørgsmål</Label>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Beskriv dit spørgsmål i detaljer..."
            rows={6}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 rounded-full gap-2"
          disabled={createMutation.isPending}
        >
          <Send className="w-5 h-5" />
          Send spørgsmål
        </Button>
      </form>
    </div>
  );
}