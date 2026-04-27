import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { differenceInWeeks, differenceInDays, isAfter } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';

function getContext(profile) {
  if (!profile) return null;
  const today = new Date();
  const birthdate = profile.child_birthdate ? new Date(profile.child_birthdate) : null;
  const dueDate = profile.child_due_date ? new Date(profile.child_due_date) : null;

  if (birthdate && isAfter(today, birthdate)) {
    const weeks = differenceInWeeks(today, birthdate);
    const months = Math.floor(weeks / 4.33);
    return `Barnet er ${weeks} uger (ca. ${months} måneder) gammelt.`;
  }
  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      return `Brugeren er gravid og har ${daysLeft} dage til termin (${Math.floor(daysLeft / 7)} uger).`;
    }
  }
  return null;
}

export default function AIRelevantPosts({ profile, allPosts }) {
  const { t } = useLanguage();
  const [relevantPosts, setRelevantPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allPosts || allPosts.length === 0) return;

    const context = getContext(profile);

    if (!context) {
      setRelevantPosts(allPosts.slice(0, 3));
      setLoading(false);
      return;
    }

    const postSummaries = allPosts.map((p, i) => `${i}: "${p.title}" (kategori: ${p.category || 'ukendt'})`).join('\n');

    base44.integrations.Core.InvokeLLM({
      prompt: `Du er en hjælpsom assistent til en mor/far-app om babyer og graviditet.

Kontekst om brugeren: ${context}

Her er tilgængelige blogindlæg (index: titel):
${postSummaries}

Vælg de 3 mest relevante indlæg for denne bruger baseret på deres situation. Returner kun de 3 index-numre som et array.`,
      response_json_schema: {
        type: 'object',
        properties: {
          indices: { type: 'array', items: { type: 'number' } }
        }
      }
    }).then(res => {
      const indices = res?.indices || [];
      const selected = indices
        .filter(i => i >= 0 && i < allPosts.length)
        .slice(0, 3)
        .map(i => allPosts[i]);
      setRelevantPosts(selected.length > 0 ? selected : allPosts.slice(0, 3));
      setLoading(false);
    }).catch(() => {
      setRelevantPosts(allPosts.slice(0, 3));
      setLoading(false);
    });
  }, [allPosts?.length, profile?.child_birthdate, profile?.child_due_date]);

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>{t.relevantForYou}</h2>
        <Link to={createPageUrl('Blog')} className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {t.seeAll}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {relevantPosts.map(post => (
            <BlogCard key={post.id} post={post} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}