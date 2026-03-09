import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import BlogCard from '@/components/blog/BlogCard';

const AFFIRMATIONS = [
  "Du er en fantastisk mor — selv på de dage, det føles det modsatte. 🤍",
  "Det er okay, at kaffen er kold. Du er varm og nærværende, og det er nok.",
  "Du behøver ikke gøre alt perfekt. Du skal bare gøre dit bedste — og det gør du.",
  "Søvnmangel er hård. At du stadig kæmper er bevis på din utrolige styrke.",
  "Din baby ved ikke hvad 'perfekt' er. De ved kun, at de elsker dig.",
  "Dem der siger moderskab er let, har aldrig prøvet det. Du klarer det!",
  "Hvert lille smil fra dit barn er et bevis på, at du gør det rigtigt.",
  "Du er ikke alene. Tusindvis af mødre sidder lige nu og føler præcis det samme.",
  "Det er okay at have brug for hjælp. Det er faktisk modigt at bede om det.",
  "I dag er du nok. I morgen er du nok. Altid er du nok.",
  "Dine tårer er ikke svaghed — de er kærlighed, der er løbet over.",
  "Ingen håndbog kan forberede dig på den kærlighed, du føler. Du er stærk.",
  "Du har gjort noget utroligt. Du har skabt et menneske. Husk det.",
  "Nogle dage er det nok at alle er i live og nogenlunde mætte. 🙌",
  "Du er din babys favoritperson i hele verden. Altid.",
  "Selvom du er træt, er du stadig der. Det er kærlighed i sin reneste form.",
  "Ingen mor er perfekt. Men du er den perfekte mor til dit barn.",
  "En god mor er ikke den der aldrig fejler — men den der altid prøver igen.",
  "Tillykke med at overleve endnu en nat. Du fortjener en medalje (og mere kaffe).",
  "Din kærlighed er det varmeste sted dit barn kender. 🧡",
  "Selv de svære dage former jer begge til noget stærkere.",
  "Du er mere end 'bare mor'. Du er en heltinde i hverdagsformat.",
  "Det du giver dit barn i dag, bærer de med sig hele livet.",
  "En knap-nok-dag er stadig en dag fuld af kærlighed.",
  "Du klarer mere, end du selv ved. Det er det smukkeste ved dig.",
  "Hvert kram, hvert ammetag, hvert søvnforsøg — det tæller.",
  "Moderskab er ikke en præstation. Det er en relation. Og jeres er smuk.",
  "Du er ikke fejlet. Du er midt i det.",
  "Morgendagen er en ny chance. Og du er allerede klar til den.",
  "Du bærer så meget. Men du bærer det med kærlighed.",
];

function getDailyAffirmation() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

export default function Home() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date', 3),
  });

  const affirmation = getDailyAffirmation();
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: da });

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm capitalize" style={{ color: 'var(--color-text-muted)' }}>{todayStr}</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>God dag, mor 🤍</h1>
      </header>

      {/* Daily Affirmation */}
      <div className="mx-5 mb-8">
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C8A882 0%, #A0785A 100%)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">Dagens ord til dig</p>
          <p className="text-white text-lg font-medium leading-relaxed relative z-10">
            {affirmation}
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Fra bloggen</h2>
          <Link to={createPageUrl('Blog')} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Se alle →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} variant="default" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}