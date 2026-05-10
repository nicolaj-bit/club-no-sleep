import React, { useState } from 'react';
import { ChevronLeft, Phone, Mail, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useQuery } from '@tanstack/react-query';

// Static fallback data (used if DB has no entries yet)
const FALLBACK_TEAM = [
  {
    name: 'Sara', role: 'CEO & Co-Founder',
    image: 'https://www.lalatoto.dk/cdn/shop/files/29_a8af474e-5e4f-4f7c-8e91-009540e9befd.png?v=1732525557&width=900',
    facts: ['Jeg drømmer meget men husker sjældent hvad.','Jeg falder altid i søvn i det øjeblik mit hoved rammer puden.','Vi samsover med vores to drenge i en store familieseng, og jeg ved intet bedre, end at falde i søvn til lyden af deres åndedræt.','Jeg foretrækker et koldt soveværelse, altså sådan rigtig koldt!','Jeg er den der oftest får lov til at sove længe i weekenden (tak Nico).'],
  },
  {
    name: 'Nicolaj', role: 'COO & Co-Founder',
    image: 'https://www.lalatoto.dk/cdn/shop/files/28.png?v=1732525209&width=900',
    facts: ['Jeg vågner de fleste morgener, ved at vores ældste nusser mig på kinden.','Det er kun mig som hører vækkeuret om morgenen.','Jeg nyder at læse en god bog i sengen, inden jeg lukker øjnene.','Hver morgen lover jeg mig selv at gå tidligere i seng, men det bliver sjældent overholdt. Ups!','Jeg sover udelukkende med Kapok, da det hjælper gevaldigt på min allergi.'],
  },
];
const FALLBACK_PARTNERS = [
  {
    name: 'Julie Line Christiansen', role: 'Fotograf',
    image: 'https://www.lalatoto.dk/cdn/shop/files/EDE9E568-1AB0-4D60-8BFA-1438D2B950D0.jpg?v=1773142523&width=900',
    facts: ['Jeg har altid elsket at tage billeder.','Jeg købte mit første spejlrefleks kamera for mine konfirmationspenge.','Jeg er uddannet pædagog, med speciale i skole- og fritidspædagogik.'],
    link: 'https://desmaojeblikke.dk',
  },
];
const FALLBACK_HERO = {
  title: 'Vores rejse begyndte i 2018',
  body: 'Vores rejse med LALATOTO begyndte i 2018 med en ulykkelig baby, to meget trætte forældre og en hjemmesyet tyngdedyne. Dengang havde vi ingen idé om, at vores tyngdedyne ville blive danskernes foretrukne valg til babyer og småbørn.\n\nMen pludselig tog det fart, og vi besluttede os for at gå all in på vores mission om at forbedre trivslen hos småbørnsfamilier gennem bedre og tryggere søvn.\n\nI dag er LALATOTO et betroet brand for familier, der søger bedre løsninger til søvn. En tillid vi ikke tager for givet. Fra vores beskedne begyndelse er vi vokset til at blive en fællesskabsdrevet virksomhed, der arbejder for at hjælpe familier med øget trivsel gennem tryg søvn.',
};

function entryToMember(e) {
  return {
    name: e.title || e.key,
    role: e.subtitle || '',
    image: e.image_url || '',
    facts: e.body ? e.body.split('\n').filter(Boolean) : [],
    link: e.link || '',
  };
}

function PersonCard({ person, openId, setOpenId }) {
  const isOpen = openId === person.name;

  function toggle() {
    setOpenId(isOpen ? null : person.name);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{person.name}</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{person.role}</p>

        {person.link && (
          <a
            href={person.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mb-3 block"
            style={{ color: 'var(--color-accent)' }}
          >
            {person.link.replace('https://', '')}
          </a>
        )}

        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--color-accent)' }}
        >
          {person.facts.length} fun facts om mig
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <ul className="mt-3 space-y-2">
            {person.facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                {fact}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AboutUs() {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openId, setOpenId] = useState(null);

  const { data: dbEntries = [] } = useQuery({
    queryKey: ['about-us-content'],
    queryFn: () => base44.entities.AboutUsContent.filter({ is_active: true }, 'order', 50),
  });

  const heroEntry = dbEntries.find(e => e.section === 'hero');
  const teamEntries = dbEntries.filter(e => e.section === 'team_member');
  const partnerEntries = dbEntries.filter(e => e.section === 'partner');

  const heroData = heroEntry
    ? { title: heroEntry.title || FALLBACK_HERO.title, body: heroEntry.body || FALLBACK_HERO.body }
    : FALLBACK_HERO;

  const teamMembers = teamEntries.length > 0 ? teamEntries.map(entryToMember) : FALLBACK_TEAM;
  const partnerMembers = partnerEntries.length > 0 ? partnerEntries.map(entryToMember) : FALLBACK_PARTNERS;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Udfyld venligst alle felter');
      return;
    }
    setSending(true);
    await base44.functions.invoke('sendContactEmail', {
      name: form.name,
      email: form.email,
      message: form.message,
    });
    toast.success('Besked sendt! Vi vender tilbage inden for 24 timer.');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(247,242,236,0.92)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Link to={createPageUrl('Community')}>
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Mød familien
        </h1>
      </header>

      <div className="px-4 py-6 space-y-10 max-w-2xl mx-auto">

        <section>
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-10 h-10 rounded-2xl mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              🧡
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
              {heroData.title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {heroData.body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Teamet bag</h2>
          <div className="grid grid-cols-2 gap-4">
            {teamMembers.map(person => (
              <PersonCard key={person.name} person={person} openId={openId} setOpenId={setOpenId} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Vores samarbejdspartnere</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Vi er stolte over de dygtige mennesker vi samarbejder med.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {partnerMembers.map(person => (
              <PersonCard key={person.name} person={person} openId={openId} setOpenId={setOpenId} />
            ))}
          </div>
        </section>

        <section
          className="rounded-2xl p-5 border space-y-4"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Kontakt os</h2>
          <div className="space-y-3">
            <a href="tel:+4572156686" className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Phone className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              +45 72 15 66 86
            </a>
            <a href="mailto:kundeservice@lalatoto.dk" className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Mail className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              kundeservice@lalatoto.dk
            </a>
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <span>Man–tors 9–15 · Fre 9–14</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Alle henvendelser besvares inden for 24 timer på hverdage.
          </p>
        </section>

        <section
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Send os en besked</h2>
          <form onSubmit={handleSend} className="space-y-3">
            <Input
              placeholder="Dit navn"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none' }}
            />
            <Input
              type="email"
              placeholder="Din e-mail"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none' }}
            />
            <Textarea
              placeholder="Din besked..."
              rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ backgroundColor: 'var(--color-bg-subtle)', border: 'none', resize: 'none' }}
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-70 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sender...' : 'Send meddelelse'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}