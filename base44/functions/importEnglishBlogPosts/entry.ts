import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Henter de engelske blogindlaeg fra lalatoto.dk og skriver dem ind paa
// BlogPost, saa appen kan vise dem med det samme i stedet for at lade AI'en
// oversaette ved hver visning.
//
// Oversaettelserne er lavet i Shopify og er allerede gennemlaeste. Appens
// slug er den samme som Shopifys handle, saa den engelske side ligger paa
// https://www.lalatoto.dk/en/blogs/bloggen/<slug>.
//
// Kun admin. Kald med { dry: true } for at se hvad der ville ske uden at
// skrive noget.

const BASE = 'https://www.lalatoto.dk/en/blogs/bloggen/';

/** Tekst mellem <div class="lalatoto-article__body"> og dens egen slut-tag. */
function extractBody(html: string): string | null {
  const marker = 'class="lalatoto-article__body"';
  const at = html.indexOf(marker);
  if (at === -1) return null;
  const open = html.indexOf('>', at);
  if (open === -1) return null;

  // Taeller div'er, saa vi rammer den rigtige slut-tag og ikke den foerste.
  let depth = 1;
  let i = open + 1;
  const re = /<\/?div\b/gi;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(open + 1, m.index).trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<h1[^>]*class="[^"]*lalatoto-article__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return decode(m[1].replace(/<[^>]+>/g, '').trim());
}

function extractExcerpt(html: string): string | null {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    || html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
  return m ? decode(m[1].trim()) : null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dry = body?.dry === true;
    const onlySlug = body?.slug || null;

    const posts = await base44.asServiceRole.entities.BlogPost.list(null, 200);
    const report: any[] = [];
    let saved = 0;

    for (const post of posts) {
      if (!post.slug) { report.push({ id: post.id, status: 'sprunget over', grund: 'ingen slug' }); continue; }
      if (onlySlug && post.slug !== onlySlug) continue;

      let html = '';
      try {
        const res = await fetch(BASE + post.slug, { headers: { 'User-Agent': 'ClubNoSleep-import' } });
        if (!res.ok) { report.push({ slug: post.slug, status: 'fejl', http: res.status }); continue; }
        html = await res.text();
      } catch (e) {
        report.push({ slug: post.slug, status: 'fejl', grund: e?.message });
        continue;
      }

      const title_en = extractTitle(html);
      const content_en = extractBody(html);
      const excerpt_en = extractExcerpt(html);

      if (!title_en || !content_en) {
        report.push({ slug: post.slug, status: 'kunne ikke laese siden', harTitel: !!title_en, harIndhold: !!content_en });
        continue;
      }

      // Sikkerhedstjek: er siden stadig dansk, er det ikke en oversaettelse,
      // og saa skal den ikke gemmes som engelsk.
      //
      // Enkelte danske bogstaver er helt normale — navneartiklen lister danske
      // navne, og forfatteren hedder Sara Baudtler. Derfor tjekkes ogsaa for
      // danske smaaord, som ikke optraeder i en engelsk tekst.
      // Kun den synlige tekst taelles. Foer blev markup talt med, og saa
      // udloeste danske ord inde i links (lalatoto.dk/collections/...) og i
      // style-attributter falsk alarm paa en artikel, der var helt engelsk.
      const synligTekst = content_en.replace(/<[^>]*>/g, ' ');
      const danskeTegn = (synligTekst.match(/[æøåÆØÅ]/g) || []).length;
      // Kun ord der IKKE ogsaa findes paa engelsk — 'for' og 'men' er udeladt
      // af netop den grund.
      const danskeOrd = (synligTekst.match(/\b(og|ikke|det|med|til|som|kan|skal|har|dit|din|barnet|hvis|eller|også|være|bliver)\b/gi) || []).length;
      const forDansk = danskeTegn > synligTekst.length / 100 || danskeOrd > 15;

      report.push({
        slug: post.slug,
        status: forDansk ? 'ser dansk ud — ikke gemt' : (dry ? 'ville blive gemt' : 'gemt'),
        title_en,
        tegn: content_en.length,
        danskeTegn,
        danskeOrd,
      });

      if (forDansk || dry) continue;

      await base44.asServiceRole.entities.BlogPost.update(post.id, {
        title_en,
        content_en,
        ...(excerpt_en ? { excerpt_en } : {}),
      });
      saved++;
      await new Promise((r) => setTimeout(r, 120));
    }

    return Response.json({ dry, antal: posts.length, gemt: saved, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
