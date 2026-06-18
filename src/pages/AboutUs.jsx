import React, { useState, useEffect } from 'react';
import { ChevronLeft, Phone, Mail, Clock, ChevronDown, ChevronUp, Pencil, X, Check } from 'lucide-react';
import UserSupportChat from '@/components/support/UserSupportChat';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import RichTextEditor from '@/components/about/RichTextEditor';

const DEFAULTS = {
  story_title: 'Vores rejse begyndte i 2018',
  story_body: `<p>"Godnat," sagde han til mor og baby i soveværelset. Så tog han dynen under armen og gik ned på sofaen.<br />Sådan sov vi i en lang periode i vores første år som forældre. Fordi vores baby græd en stor del af natten, og fordi det var den eneste måde, Nicolaj kunne hænge nok sammen til at passe sit arbejde.</p><p><strong>Ensomheden voksede i os begge.</strong></p><p>Jeg husker stadig nætterne, som var det lige sket. Angsten for de mørke nattetimer, der begyndte at krybe ind længe før sengetid. Ville det blive en nat med meget gråd eller bare mange opvågninger?</p><p>Følelsen af at være helt alene i stilheden og mørket.<br />At falde i søvn siddende med baby i favnen og vågne med hold i nakken.<br />At vågne igen og se på klokken, at der kun var gået 30 minutter siden sidst.<br />Den helt igennem frustrerende følelse, når en ny dag startede alt for tidligt, fordi baby vågnede klokken halv fem og absolut ikke viste tegn på at falde i søvn igen.</p><p>Og som nætterne gik, og trætheden blev mere og mere lammende, begyndte den også at fylde i dagtimerne. Overskuddet var næsten væk, og som træt mor havde jeg ikke mod på at tage ud af huset med en endnu trættere baby.</p><p><strong>Så jeg blev hjemme. Alene.</strong></p><p>En dag så jeg et opslag, som ændrede noget i mig: <em>"Forestil dig, at når du sidder med en vågen baby om natten, så tændes der et lille lys over dit hus. Og forestil dig så, hvor mange små lys der er tændt over huse nær dig."</em></p><p><em>Lige dér mærkede jeg for første gang følelsen af, at jeg ikke var alene.</em></p><p>Dét opslag har siddet i mig siden. Sammen med et brændende ønske om at mindske natteensomhed hos mødre.</p><p><strong>Det er derfor, vi har skabt dette univers; For at mindske ensomhed i moderskabet.</strong></p><p>Vi ved godt, at en app ikke kan gøre moderskabet nemt. Men vi tror på, at det kan gøre en forskel at føle sig mødt. At vide, at andre også er vågne. At kunne dele ansvaret med en partner. At have et sted at gå hen, også når natten føles lang.</p><p>Visionen har boet i os længe. Nu har den fået form som en app, og vi kunne ikke være mere stolte.</p><p>Du skal vide, at den er lavet med hjertet først.</p><p>Af os, som selv har siddet i mørket og mærket ensomheden vokse.</p><p>Til dig, som måske sidder der nu.<br /><em>Kærligst og kram,</em></p><p><em>fra Sara & Nicolaj.</em><br /><strong>Du er ikke alene.</strong></p><p style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.1);"><strong>Om Sara & Nicolaj</strong></p><p>Sara & Nicolaj er gift og forældre til Xander og Oskar.<br />Sammen står de bag småbørnsuniverset LALATOTO of Denmark.</p><p>Det hele begyndte i 2018 med en hjemmesyet tyngdedyne, skabt som en hjælp til de afbrudte nætter. Siden er LALATOTO vokset til et univers af produkter med fokus på tryg søvn, ro og nærhed i børnefamilielivet.</p><p>Passionen for småbørnssøvn er kun blevet større med årene. Samtidig har virksomheden taget en grønnere retning med et klart fokus på naturlige materialer og fravalg af polyester.<br />Måske har du allerede mødt hashtagget #nejtaktilpolyester, som har været med til at gøre flere forældre opmærksomme på værdien af at vælge materialer fra naturen.</p><p>Appen er skabt som en naturlig forlængelse af det univers, Sara og Nicolaj allerede har bygget med LALATOTO: et univers med fokus på tryghed, søvn og nærhed.</p>`,
  team_sara_name: 'Sara',
  team_sara_role: 'CEO & Co-Founder',
  team_sara_image: 'https://www.lalatoto.dk/cdn/shop/files/29_a8af474e-5e4f-4f7c-8e91-009540e9befd.png?v=1732525557&width=900',
  team_sara_facts: ['Jeg drømmer meget men husker sjældent hvad.', 'Jeg falder altid i søvn i det øjeblik mit hoved rammer puden.', 'Vi samsover med vores to drenge i en store familieseng.', 'Jeg foretrækker et koldt soveværelse, altså sådan rigtig koldt!', 'Jeg er den der oftest får lov til at sove længe i weekenden (tak Nico).'],
  team_nicolaj_name: 'Nicolaj',
  team_nicolaj_role: 'COO & Co-Founder',
  team_nicolaj_image: 'https://www.lalatoto.dk/cdn/shop/files/28.png?v=1732525209&width=900',
  team_nicolaj_facts: ['Jeg vågner de fleste morgener, ved at vores ældste nusser mig på kinden.', 'Det er kun mig som hører vækkeuret om morgenen.', 'Jeg nyder at læse en god bog i sengen, inden jeg lukker øjnene.', 'Hver morgen lover jeg mig selv at gå tidligere i seng, men det bliver sjældent overholdt. Ups!', 'Jeg sover udelukkende med Kapok, da det hjælper gevaldigt på min allergi.'],
  partner_julie_name: 'Julie Line Christiansen',
  partner_julie_role: 'Fotograf',
  partner_julie_image: 'https://www.lalatoto.dk/cdn/shop/files/EDE9E568-1AB0-4D60-8BFA-1438D2B950D0.jpg?v=1773142523&width=900',
  partner_julie_link: 'https://desmaojeblikke.dk',
  partner_julie_facts: ['Jeg har altid elsket at tage billeder.', 'Jeg købte mit første spejlrefleks kamera for mine konfirmationspenge.', 'Jeg er uddannet pædagog, med speciale i skole- og fritidspædagogik.'],
  contact_phone: '+45 72 15 66 86',
  contact_email: 'kundeservice@lalatoto.dk',
  contact_hours: 'Man–tors 9–15 · Fre 9–14',
  contact_note: 'Alle henvendelser besvares inden for 24 timer på hverdage.',
};

function get(content, section, fallback) {
  const entry = content.find(c => c.section === section);
  return entry?.body !== undefined && entry?.body !== null && entry?.body !== '' ? entry.body : fallback;
}
function getTitle(content, section, fallback) {
  const entry = content.find(c => c.section === section);
  return entry?.title || fallback;
}
function getImage(content, section, fallback) {
  const entry = content.find(c => c.section === section);
  return entry?.image || fallback;
}
function getLink(content, section, fallback) {
  const entry = content.find(c => c.section === section);
  return entry?.link || fallback;
}
function getEntryId(content, section) {
  return content.find(c => c.section === section)?.id || null;
}

// Inline edit wrapper — shows pencil on hover, saves on check
function EditableBlock({ label, entryId, section, isAdmin, onSaved, children, richText = false, initialValue = '' }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  const save = async () => {
    setSaving(true);
    if (entryId) {
      await base44.entities.AboutContent.update(entryId, { body: value });
    } else {
      await base44.entities.AboutContent.create({ section, body: value });
    }
    setSaving(false);
    setEditing(false);
    onSaved();
    toast.success('Gemt');
  };

  if (!isAdmin) return <>{children}</>;

  return (
    <div className="relative group/edit">
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/edit:opacity-100 transition-opacity shadow"
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          title={`Rediger ${label}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {editing ? (
        <div className="space-y-2">
          {richText
            ? <RichTextEditor value={value} onChange={setValue} />
            : <Textarea value={value} onChange={e => setValue(e.target.value)} rows={3} style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }} />
          }
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
              <Check className="w-3.5 h-3.5" /> {saving ? 'Gemmer…' : 'Gem'}
            </button>
            <button onClick={() => { setEditing(false); setValue(initialValue); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
              <X className="w-3.5 h-3.5" /> Annuller
            </button>
          </div>
        </div>
      ) : children}
    </div>
  );
}

function PersonCard({ person, openId, setOpenId }) {
  const isOpen = openId === person.name;
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img src={person.image} alt={person.name} className="w-full h-full object-cover object-top" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{person.name}</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{person.role}</p>
        {person.link && (
          <a href={person.link} target="_blank" rel="noopener noreferrer" className="text-xs underline mb-3 block" style={{ color: 'var(--color-accent)' }}>
            {person.link.replace('https://', '')}
          </a>
        )}
        <button onClick={() => setOpenId(isOpen ? null : person.name)} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setCurrentUser(u); }).catch(() => {});
  }, []);
  const [openId, setOpenId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.role === 'admin') setIsAdmin(true); }).catch(() => {});
  }, []);

  const { data: content = [] } = useQuery({
    queryKey: ['aboutContent'],
    queryFn: () => base44.entities.AboutContent.list('order', 100),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['aboutContent'] });

  const sara = {
    name: getTitle(content, 'team_sara', DEFAULTS.team_sara_name),
    role: get(content, 'team_sara_role', DEFAULTS.team_sara_role),
    image: getImage(content, 'team_sara', DEFAULTS.team_sara_image),
    facts: get(content, 'team_sara_facts', '').split('\n').filter(Boolean).length > 0 && get(content, 'team_sara_facts', '') ? get(content, 'team_sara_facts', '').split('\n').filter(Boolean) : DEFAULTS.team_sara_facts,
  };
  const nicolaj = {
    name: getTitle(content, 'team_nicolaj', DEFAULTS.team_nicolaj_name),
    role: get(content, 'team_nicolaj_role', DEFAULTS.team_nicolaj_role),
    image: getImage(content, 'team_nicolaj', DEFAULTS.team_nicolaj_image),
    facts: get(content, 'team_nicolaj_facts', '').split('\n').filter(Boolean).length > 0 && get(content, 'team_nicolaj_facts', '') ? get(content, 'team_nicolaj_facts', '').split('\n').filter(Boolean) : DEFAULTS.team_nicolaj_facts,
  };
  const julie = {
    name: getTitle(content, 'partner_julie', DEFAULTS.partner_julie_name),
    role: get(content, 'partner_julie_role', DEFAULTS.partner_julie_role),
    image: getImage(content, 'partner_julie', DEFAULTS.partner_julie_image),
    link: getLink(content, 'partner_julie', DEFAULTS.partner_julie_link),
    facts: get(content, 'partner_julie_facts', '').split('\n').filter(Boolean).length > 0 && get(content, 'partner_julie_facts', '') ? get(content, 'partner_julie_facts', '').split('\n').filter(Boolean) : DEFAULTS.partner_julie_facts,
  };

  const storyTitle = getTitle(content, 'story', DEFAULTS.story_title);
  const storyBody = get(content, 'story', DEFAULTS.story_body);
  const contactPhone = get(content, 'contact_phone', DEFAULTS.contact_phone);
  const contactEmail = get(content, 'contact_email', DEFAULTS.contact_email);
  const contactHours = get(content, 'contact_hours', DEFAULTS.contact_hours);
  const contactNote = get(content, 'contact_note', DEFAULTS.contact_note);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(247,242,236,0.92)', borderColor: 'var(--color-border)' }}
      >
        <Link to={createPageUrl('Community')}>
          <Button variant="ghost" size="icon" className="-ml-2"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Mød familien</h1>
        {isAdmin && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}>
            ✏️ Rediger ved at klikke
          </span>
        )}
      </header>

      <div className="px-4 py-6 space-y-10 max-w-2xl mx-auto">

        {/* Story */}
        <section>
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>{storyTitle}</h2>
            <div className="mb-5 rounded-xl overflow-hidden">
              <img
                src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/172953752_Designudennavn152.png"
                alt="Sara og Nicolaj"
                className="w-full object-cover"
              />
            </div>
            <EditableBlock
              label="historietekst"
              section="story"
              entryId={getEntryId(content, 'story')}
              isAdmin={isAdmin}
              onSaved={refetch}
              richText={true}
              initialValue={storyBody}
            >
              <div
                className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: storyBody }}
              />
            </EditableBlock>
          </div>
        </section>



        {/* Contact info */}
        <section className="rounded-2xl p-5 border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Kontakt os</h2>
          <div className="space-y-3">
            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Phone className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <EditableBlock label="telefon" section="contact_phone" entryId={getEntryId(content, 'contact_phone')} isAdmin={isAdmin} onSaved={refetch} initialValue={contactPhone}>
                <span>{contactPhone}</span>
              </EditableBlock>
            </a>
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Mail className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <EditableBlock label="email" section="contact_email" entryId={getEntryId(content, 'contact_email')} isAdmin={isAdmin} onSaved={refetch} initialValue={contactEmail}>
                <span>{contactEmail}</span>
              </EditableBlock>
            </a>
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <EditableBlock label="åbningstider" section="contact_hours" entryId={getEntryId(content, 'contact_hours')} isAdmin={isAdmin} onSaved={refetch} initialValue={contactHours}>
                <span>{contactHours}</span>
              </EditableBlock>
            </div>
          </div>
          <EditableBlock label="note" section="contact_note" entryId={getEntryId(content, 'contact_note')} isAdmin={isAdmin} onSaved={refetch} initialValue={contactNote}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{contactNote}</p>
          </EditableBlock>
        </section>

        {/* Support chat */}
        <section className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Skriv til os 💬</h2>
          {currentUser ? (
            <UserSupportChat user={currentUser} />
          ) : (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
              Log ind for at sende en besked til os.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}