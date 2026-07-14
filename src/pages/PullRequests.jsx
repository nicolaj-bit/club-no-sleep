import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Skeleton } from '@/components/ui/skeleton';
import { GitPullRequest, ExternalLink, MessageCircle } from 'lucide-react';

export default function PullRequests() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPRs = async () => {
    try {
      setError(null);
      const res = await base44.functions.invoke('listPullRequests', {});
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Kunne ikke hente pull requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPRs(); }, []);

  const prs = data?.pull_requests || [];

  return (
    <PullToRefresh onRefresh={async () => { setLoading(true); await fetchPRs(); }}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <PageHeader title="Open Pull Requests" />

        <div className="p-4 space-y-4">
          {!loading && !error && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {data?.total ?? 0} åbne pull requests
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            </div>
          ) : prs.length === 0 ? (
            <div className="text-center py-12">
              <GitPullRequest className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Ingen åbne pull requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prs.map((pr) => (
                <a
                  key={pr.id}
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl p-4 border"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start gap-3">
                    <GitPullRequest className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {pr.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {pr.repo} #{pr.number}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {pr.author?.avatar && (
                          <div className="flex items-center gap-1.5">
                            <img src={pr.author.avatar} alt={pr.author.login} className="w-4 h-4 rounded-full" />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{pr.author.login}</span>
                          </div>
                        )}
                        {pr.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <MessageCircle className="w-3 h-3" />
                            {pr.comments}
                          </div>
                        )}
                        {pr.draft && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                            Draft
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 ml-auto" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}