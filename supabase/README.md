# Supabase backend setup

One-time setup, ~2 minutes, all in the Supabase dashboard (no CLI, no service-role key needed).

**Already ran `schema.sql` before?** Re-run it — `score_new_audit` picked up
a new `p_research` parameter and the `audits` table a new `research`
column, both needed for the tiers below. Re-running is safe (same
copy/paste/Run flow as before; it won't touch existing audit rows or
benchmark data).

1. **Run the schema.** Dashboard → your project → **SQL Editor → New query**.
   Paste the full contents of `schema.sql` and run it. Creates the tables,
   RLS policies, seed data (question weights, suite mapping) and the
   `score_new_audit` scoring function.

2. **Enable anonymous sign-ins.** Dashboard → **Authentication → Sign In / Providers**
   → turn on **Allow anonymous sign-ins**. The app signs a user in
   anonymously on first launch (no email/password) so audits can be saved
   and scoped per-device before someone creates a real account. Without
   this toggle, scoring will fail with "must be signed in".

3. **Add the app's redirect URL.** Dashboard → **Authentication → URL
   Configuration** → under **Redirect URLs**, add `orvo://auth-callback`.
   This is where the magic-link email sends people back into the app to
   finish account creation/sign-in (`src/screens/AuthScreen.tsx`,
   `src/screens/ReportScreen.tsx`). Without this, the link in the email
   won't be allowed to open the app.

4. **Set up Google sign-in** (needs a Google Cloud account — separate from
   Supabase):
   a. [console.cloud.google.com](https://console.cloud.google.com) → create
      or pick a project → **APIs & Services → OAuth consent screen** →
      configure it (External, app name "Orvo", your support email). Keep it
      in "Testing" mode for now and add your own email as a test user —
      publishing to production requires Google's verification, not needed
      yet.
   b. **APIs & Services → Credentials → Create Credentials → OAuth client
      ID** → type **Web application**.
   c. In the Supabase dashboard, go to **Authentication → Sign In /
      Providers → Google** and copy the **Callback URL (for OAuth)** shown
      there (looks like `https://hpyguusedttrwribiynq.supabase.co/auth/v1/callback`).
      Paste that into the Google Cloud form's **Authorized redirect URIs**.
   d. Google gives you a **Client ID** and **Client Secret** — paste both
      into that same Supabase Google provider screen, toggle it **on**, and
      save.

5. **Set up real research** (Standard/Deep audit tiers — Quick works
   without this). Uses **SerpApi** (serpapi.com) — landed here after two
   dead ends: Brave's signup had no free option available, and Google
   Custom Search's "search the entire web" mode (needed for arbitrary
   brand/competitor lookups) has been deprecated and can no longer be
   turned on. SerpApi gives 100 free searches/month, a single API key, and
   a real Google News endpoint:
   a. Go to [serpapi.com](https://serpapi.com) → sign up (free) → your
      **API key** is on the dashboard homepage after signup — copy it.
   b. Dashboard → **Edge Functions → Deploy a new function**. Name it
      exactly **`research-audit`**, then paste the full contents of
      `functions/research-audit/index.ts` into the code editor and deploy —
      no CLI needed, this is entirely in the browser.
   c. Dashboard → **Edge Functions → research-audit → Manage secrets** (or
      **Settings → Edge Functions → Secrets**) → add `SERPAPI_API_KEY` with
      the key from step (a).
   d. Without this step the app still works — it just silently skips
      research and scores from self-report only, same as the Quick tier,
      regardless of which tier the user picked.
   e. Each audit uses roughly 12-14 queries on Standard, 15-17 on Deep — at
      100/month free, that's around 6-8 audits before hitting the cap. Fine
      for testing; a paid SerpApi plan is the next step once real usage
      picks up.

That's it — the app already has the project URL and publishable key wired
in (`app.json` → `expo.extra`). Both are safe to commit: the publishable
(anon) key is meant to ship inside the client bundle, and every table it can
touch is protected by row-level security (see `schema.sql`).

## What's server-side now vs. still mocked

Real, in Postgres:
- Scoring weights per question/option (`question_bank`)
- Dimension → ORVO Co. suite mapping (`suite_rules`)
- Peer benchmarks — seeded with a deterministic synthetic baseline per
  category, blended toward the real running average as more audits are
  submitted for that category (fully real by ~20 audits)
- Audit storage, scoped to the signed-in (possibly anonymous) user via RLS

Real, via the `research-audit` Edge Function + SerpApi (Standard and Deep
tiers — see "Research tiers" below):
- Web presence for the brand and every named competitor
- Recent news mentions for each
- The brand's own site: auto-discovered (or the URL given at setup),
  fetched, and checked for basic distinctiveness signals
- Deep tier only: a live scan of LinkedIn/Instagram/X for what's being said
  about the brand

## Research tiers — why three, and why this beats a static self-report form

Interbrand's real methodology (see the brand-strength framework this app's
question bank is grounded in) is qualitative interviews + a multi-stakeholder
survey + manual secondary research — thorough, but weeks of consultant time
and not something a self-serve app can replicate. What an app *can* do that
a one-off consulting engagement can't: check itself, automatically, against
what's actually visible online, every time someone runs it — and be upfront
about exactly which parts of the score are the user's word for it versus
something independently verifiable.

- **Quick** — the original handoff spec: 18 self-reported questions, ~12
  minutes, works offline, no research. Always available regardless of the
  setup below.
- **Standard** — adds real web + news presence for the brand *and every
  named competitor*, not just the brand, so "Competitive standing" is a
  measured rank instead of a guess. Blended 50/50 into Search & answer
  visibility, Competitive standing, and Distinctiveness (from the brand's
  own site).
- **Deep** — Standard, plus a live LinkedIn/Instagram/X scan for the brand,
  blended into Perception. This is the closest the app gets to "what's
  actually being said," short of full social-listening infrastructure.

The blend is always 50/50 self-report vs. research where research exists
for that dimension, and the app **tells the user which is which** — the
Results screen labels every dimension "Your answers only" or "Your answers
+ live research," and a summary line up top states how many dimensions were
research-backed for that specific audit. No dimension is ever silently
"corrected" without saying so.

What's still not automated, deliberately — real per-platform social APIs
(Meta Graph API, LinkedIn API, X API) all require the *business's own*
developer app + verification, which isn't something to set up unattended on
someone else's behalf; the Deep tier's `site:` search proxy is the honest
substitute until/unless ORVO Co. wants to register those apps directly.

Still open (see the main README's "Open questions for ORVO Co." section):
- Full question bank for dimensions 4–6 with ORVO Co.-approved weights —
  currently generic questions grounded in Interbrand's brand-strength
  factors (Trust/Affinity, Presence/Participation, Direction/Alignment/
  Empathy/Agility), not client-approved copy
- PDF export, CRM routing, Apple sign-in (email magic-link and Google are done)
- Paywall — **decided: none for now.** Everything stays free post-login
  while the customer database builds up; revisit pricing later. Research
  tier could become the natural free/paid boundary once pricing is decided
  — the code already has three tiers, nothing gated behind payment yet.
- Research blend weight (50/50) and the specific heuristics (share-of-voice
  formula, distinctiveness point values, social-mention curve) are a
  first-pass I designed, not calibrated against real outcomes or signed off
  by ORVO Co. — expect to tune these once there's real audit volume to
  check them against.

## Auth: email magic-link + Google, neither tested live

`src/lib/supabase.ts` (`sendMagicLink`, `signInWithGoogle`,
`completeAuthFromUrl`), `AuthScreen.tsx`, and the "Save this audit" card on
`ReportScreen.tsx` implement both. Both link an anonymous session's audits
to the new account (via `updateUser`/`linkIdentity`) rather than starting a
fresh one, so nothing already saved gets orphaned — matching the handoff's
"account requested at export" flow, plus a same "Sign in" entry point on
Welcome for returning users.

Neither could be **tested against a live Supabase project** — the sandbox
this was built in blocks outbound network to `supabase.co` and
`supabase.com` entirely (policy, not a bug). The rest of the backend was
verified this way too but degrades safely when unreachable (falls back to
local mock scoring); auth can't degrade the same way since there's no local
fallback for "confirm an email" or "finish a Google consent screen".
**Test both loops on a real device before relying on them:**
- Email: tap "Send sign-in link" → open the email on the same device →
  confirm it lands back in the app signed in.
- Google: tap "Continue with Google" → complete the consent screen → confirm
  it returns to the app signed in.

If either errors on the redirect step, check step 3 (redirect URL) and step
4 (Google provider config) above are both done.

## Why one RPC instead of the handoff's 3 separate endpoints

The design handoff's API sketch has `POST /audits`, `PATCH /audits/:id/answers`,
`POST /audits/:id/score` as separate calls. `score_new_audit` collapses all
three into one RPC for a simpler first backend: the client already keeps
in-progress answers locally (Zustand + AsyncStorage, satisfying the "must
work offline" requirement) and only needs the network once, at the end, to
get a real score. Split it into separate endpoints later if server-side
resumable/shared audits (e.g. "hand a section to a colleague" via a link)
are needed.
