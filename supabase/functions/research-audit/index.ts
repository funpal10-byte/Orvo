// research-audit — Supabase Edge Function (Deno)
//
// Looks up real, external signal for the audited brand AND every named
// competitor (not just the brand) via the Brave Search API:
//
// - Standard tier: web presence + recent news mentions for every entity,
//   plus a fetch + light analysis of the brand's official site (the URL
//   the user gave at setup, or auto-discovered from the top web result if
//   they didn't).
// - Deep tier: Standard, plus a live scan of what's being said about the
//   BRAND on LinkedIn/Instagram/X (site-scoped web search as a proxy —
//   none of those platforms' own APIs are usable here without their own
//   developer app approval, which needs the business's own accounts, not
//   something this could set up unattended).
//
// score_new_audit blends whatever's present into Search & answer
// visibility, Competitive standing, Distinctiveness and (Deep only)
// Perception, instead of relying purely on self-reported answers — see the
// comment on that function in schema.sql for exactly how.
//
// NOT verified live — this environment has no network path to Supabase or
// any external API, so this could not be run end-to-end. Deploy via the
// Supabase dashboard's Edge Functions UI (paste this file, no CLI needed —
// see supabase/README.md) and test one real audit of each tier before
// trusting the output; if it errors, check the BRAVE_API_KEY secret is set
// (Edge Functions → Manage secrets) and that your Brave Search API plan
// includes the /news/search endpoint (falls back to newsCount: 0 if not,
// so a missing news feature alone shouldn't break this).
//
// Called from the client as supabase.functions.invoke('research-audit', ...)
// (src/state/remoteScoring.ts, only for the standard/deep tiers — the
// client skips calling this at all on the quick tier), which attaches the
// caller's session JWT automatically — Supabase's function gateway checks
// it before this code runs, so no separate auth check is needed here.

const BRAVE_WEB_SEARCH_URL = 'https://api.search.brave.com/res/v1/web/search';
const BRAVE_NEWS_SEARCH_URL = 'https://api.search.brave.com/res/v1/news/search';
const FETCH_TIMEOUT_MS = 5000;
const MAX_ENTITIES = 6; // brand + up to 5 competitors, matches the app's competitor cap

// Kept short and to 3 platforms on purpose: each one is a separate Brave
// query, and this only runs for the brand (not competitors) on the Deep
// tier specifically to keep total query volume per audit bounded — a free
// Brave Search API plan has a monthly cap, and this already uses ~12-14
// queries/audit on Standard, ~15-17 on Deep.
const SOCIAL_SITE_FILTERS = ['site:linkedin.com', 'site:instagram.com', '(site:x.com OR site:twitter.com)'];

type SiteSignal = {
  titleHasBrand: boolean;
  hasMetaDescription: boolean;
  hasStructuredData: boolean;
} | null;

type EntitySignal = {
  webCount: number;
  newsCount: number;
  site?: SiteSignal;
  socialMentions?: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function withTimeout(promise: Promise<Response>, ms: number): Promise<Response> {
  return Promise.race([
    promise,
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function braveSearch(url: string, apiKey: string, query: string, count = 10): Promise<unknown> {
  const res = await withTimeout(
    fetch(`${url}?q=${encodeURIComponent(query)}&count=${count}`, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': apiKey },
    }),
    FETCH_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(`Brave search ${res.status}`);
  return res.json();
}

async function webResultCountAndTopUrl(
  apiKey: string,
  query: string,
): Promise<{ count: number; topUrl: string | null }> {
  const data = (await braveSearch(BRAVE_WEB_SEARCH_URL, apiKey, query)) as {
    web?: { results?: Array<{ url?: string }> };
  };
  const results = data.web?.results ?? [];
  return { count: results.length, topUrl: results[0]?.url ?? null };
}

async function webResultCount(apiKey: string, query: string): Promise<number> {
  try {
    const { count } = await webResultCountAndTopUrl(apiKey, query);
    return count;
  } catch {
    return 0;
  }
}

async function newsResultCount(apiKey: string, query: string): Promise<number> {
  try {
    const data = (await braveSearch(BRAVE_NEWS_SEARCH_URL, apiKey, query, 20)) as {
      results?: unknown[];
    };
    return data.results?.length ?? 0;
  } catch {
    // News endpoint may not be on every plan — never fail the whole audit for it.
    return 0;
  }
}

async function analyzeSite(url: string, brand: string): Promise<SiteSignal> {
  try {
    const res = await withTimeout(
      fetch(url, { headers: { 'User-Agent': 'OrvoAuditBot/1.0 (+https://orvoconsulting.com)' } }),
      FETCH_TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = (titleMatch?.[1] ?? '').toLowerCase();

    return {
      titleHasBrand: title.includes(brand.toLowerCase()),
      hasMetaDescription: /<meta[^>]+name=["']description["']/i.test(html),
      hasStructuredData: /application\/ld\+json/i.test(html),
    };
  } catch {
    return null;
  }
}

async function socialMentionCount(apiKey: string, brand: string): Promise<number> {
  const counts = await Promise.all(
    SOCIAL_SITE_FILTERS.map((filter) => webResultCount(apiKey, `${brand} ${filter}`)),
  );
  return counts.reduce((a, b) => a + b, 0);
}

async function researchEntity(
  apiKey: string,
  name: string,
  category: string,
  opts: { isBrand: boolean; website?: string; deep: boolean },
): Promise<EntitySignal> {
  const [web, news] = await Promise.allSettled([
    webResultCountAndTopUrl(apiKey, `${name} ${category}`),
    newsResultCount(apiKey, name),
  ]);

  const webCount = web.status === 'fulfilled' ? web.value.count : 0;
  const newsCount = news.status === 'fulfilled' ? news.value : 0;
  const topUrl = web.status === 'fulfilled' ? web.value.topUrl : null;

  const entity: EntitySignal = { webCount, newsCount };

  if (opts.isBrand) {
    const siteUrl = opts.website || topUrl;
    if (siteUrl) entity.site = await analyzeSite(siteUrl, name);
    if (opts.deep) entity.socialMentions = await socialMentionCount(apiKey, name);
  }

  return entity;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('BRAVE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'BRAVE_API_KEY not configured' }), {
        status: 200, // 200 on purpose: the caller treats this as "no research", not a hard failure
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { brand, category, competitors, website, tier } = (await req.json()) as {
      brand?: string;
      category?: string;
      competitors?: string[];
      website?: string;
      tier?: 'standard' | 'deep';
    };
    if (!brand || !category) {
      return new Response(JSON.stringify({ error: 'brand and category are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deep = tier === 'deep';
    const names = [brand, ...(competitors ?? [])].slice(0, MAX_ENTITIES);
    const uniqueNames = Array.from(new Set(names));

    const results = await Promise.all(
      uniqueNames.map((name) =>
        researchEntity(apiKey, name, category, {
          isBrand: name === brand,
          website: name === brand ? website : undefined,
          deep,
        }),
      ),
    );

    const entities: Record<string, EntitySignal> = {};
    uniqueNames.forEach((name, i) => {
      entities[name] = results[i];
    });

    return new Response(JSON.stringify({ brandKey: brand, entities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Never let this block scoring — the caller falls back to self-report-only.
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
