// research-audit — Supabase Edge Function (Deno)
//
// Looks up real, external signal for the audited brand AND every named
// competitor (not just the brand) via SerpApi (serpapi.com):
//
// - Standard tier: web presence + recent Google News mentions for every
//   entity, plus a fetch + light analysis of the brand's official site
//   (the URL the user gave at setup, or auto-discovered from the top web
//   result if they didn't).
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
// Provider history, for whoever touches this next: Brave Search had no
// free-tier signup available when this was built; Google Custom Search's
// "search the entire web" mode (needed for arbitrary brand/competitor
// lookups, not just a fixed site list) has since been deprecated and can
// no longer be enabled. Landed on SerpApi — single API key, a real Google
// News endpoint (better than the date-restricted-web-search workaround the
// Google attempt needed), 100 free searches/month.
//
// NOT verified live — this environment has no network path to Supabase or
// any external API, so this could not be run end-to-end. Deploy via the
// Supabase dashboard's Edge Functions UI (paste this file, no CLI needed —
// see supabase/README.md) and test one real audit of each tier before
// trusting the output; if it errors, check the SERPAPI_API_KEY secret is
// set (Edge Functions → Manage secrets).
//
// Called from the client as supabase.functions.invoke('research-audit', ...)
// (src/state/remoteScoring.ts, only for the standard/deep tiers — the
// client skips calling this at all on the quick tier), which attaches the
// caller's session JWT automatically — Supabase's function gateway checks
// it before this code runs, so no separate auth check is needed here.

const SERPAPI_URL = 'https://serpapi.com/search.json';
const FETCH_TIMEOUT_MS = 5000;
const MAX_ENTITIES = 6; // brand + up to 5 competitors, matches the app's competitor cap

// Kept short and to 3 platforms on purpose: each one is a separate search
// query, and this only runs for the brand (not competitors) on the Deep
// tier specifically to keep total query volume per audit bounded — the
// free SerpApi tier caps at 100 queries/month, and this already uses
// ~12-14 queries/audit on Standard, ~15-17 on Deep.
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

async function serpApiSearch(
  apiKey: string,
  params: Record<string, string>,
): Promise<unknown> {
  const qs = new URLSearchParams({ ...params, api_key: apiKey });
  const res = await withTimeout(
    fetch(`${SERPAPI_URL}?${qs.toString()}`, { headers: { Accept: 'application/json' } }),
    FETCH_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(`SerpApi ${res.status}`);
  const data = await res.json();
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(`SerpApi: ${(data as { error: string }).error}`);
  }
  return data;
}

async function webResultCountAndTopUrl(
  apiKey: string,
  query: string,
): Promise<{ count: number; topUrl: string | null }> {
  const data = (await serpApiSearch(apiKey, { engine: 'google', q: query, num: '10' })) as {
    organic_results?: Array<{ link?: string }>;
  };
  const results = data.organic_results ?? [];
  return { count: results.length, topUrl: results[0]?.link ?? null };
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
    const data = (await serpApiSearch(apiKey, { engine: 'google_news', q: query })) as {
      news_results?: unknown[];
    };
    return data.news_results?.length ?? 0;
  } catch {
    // Never fail the whole audit for a news-specific hiccup.
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
    const apiKey = Deno.env.get('SERPAPI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'SERPAPI_API_KEY not configured' }), {
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
