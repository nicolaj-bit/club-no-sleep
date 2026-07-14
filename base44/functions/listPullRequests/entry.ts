import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Base44-App",
    };

    // 1. Get authenticated user
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("GitHub /user error:", userRes.status, errText);
      console.error("Rate limit remaining:", userRes.headers.get("x-ratelimit-remaining"));
      console.error("Rate limit reset:", userRes.headers.get("x-ratelimit-reset"));
      return Response.json({ error: `GitHub auth error: ${userRes.status}` }, { status: 502 });
    }
    const user = await userRes.json();

    // 2. List user's repos (first 100, sorted by most recently pushed)
    const reposRes = await fetch(
      `https://api.github.com/user/repos?per_page=100&sort=pushed&direction=desc`,
      { headers }
    );
    if (!reposRes.ok) {
      const errText = await reposRes.text();
      console.error("GitHub /repos error:", reposRes.status, errText);
      return Response.json({ error: `GitHub repos error: ${reposRes.status}` }, { status: 502 });
    }
    const repos = await reposRes.json();

    // 3. Fetch open PRs from each repo (parallel, limited)
    const prPromises = repos.map(async (repo) => {
      try {
        const prRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/pulls?state=open&per_page=100`,
          { headers }
        );
        if (!prRes.ok) return [];
        const repoPRs = await prRes.json();
        return repoPRs.map((pr) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          url: pr.html_url,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          draft: pr.draft,
          repo: repo.full_name,
          author: {
            login: pr.user?.login,
            avatar: pr.user?.avatar_url,
          },
          labels: (pr.labels || []).map((l) => l.name),
          comments: pr.comments || (pr.comments_url ? 0 : 0),
        }));
      } catch {
        return [];
      }
    });

    const prResults = await Promise.all(prPromises);
    const allPRs = prResults.flat().sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const data = { total: allPRs.length, items: allPRs };

    const prs = (data.items || []).map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      url: pr.html_url,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      draft: pr.draft,
      repo: pr.repository_url?.replace("https://api.github.com/repos/", "") || "",
      author: {
        login: pr.user?.login,
        avatar: pr.user?.avatar_url,
      },
      labels: (pr.labels || []).map((l) => l.name),
      comments: pr.comments,
    }));

    return Response.json({ total: data.total_count || 0, pull_requests: prs });
  } catch (error) {
    console.error("listPullRequests error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});