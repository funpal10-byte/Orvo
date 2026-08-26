# Supabase backend setup

One-time setup, ~2 minutes, all in the Supabase dashboard (no CLI, no service-role key needed).

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

Still open (see the main README's "Open questions for ORVO Co." section):
- Full question bank for dimensions 4–6 with ORVO Co.-approved weights —
  currently generic questions grounded in Interbrand's brand-strength
  factors (Trust/Affinity, Presence/Participation, Direction/Alignment/
  Empathy/Agility), not client-approved copy
- PDF export, CRM routing, Google/Apple sign-in (email magic-link is done)
- Paywall / premium tier — no pricing decided yet, not built

## Auth: magic-link, not tested live

`src/lib/supabase.ts` (`sendMagicLink`, `completeAuthFromUrl`) and
`AuthScreen.tsx` implement email magic-link sign-in, plus linking an
anonymous session's audits to a new account at export
(`ReportScreen.tsx`'s "Save this audit" card) — matching the handoff's
"account requested at export" flow.

This piece could **not be tested against a live Supabase project** — the
sandbox this was built in blocks outbound network to `supabase.co` and
`supabase.com` entirely (policy, not a bug). The rest of the backend was
verified this way too but degrades safely when unreachable (falls back to
local mock scoring); this can't degrade the same way since there's no local
fallback for "confirm an email." **Test the full loop on a real device
before relying on it**: tap "Send sign-in link" → open the email on the
same device → confirm it lands back in the app signed in. If
`exchangeCodeForSession` errors, the most likely cause is step 3 above
(redirect URL) not being added yet.

## Why one RPC instead of the handoff's 3 separate endpoints

The design handoff's API sketch has `POST /audits`, `PATCH /audits/:id/answers`,
`POST /audits/:id/score` as separate calls. `score_new_audit` collapses all
three into one RPC for a simpler first backend: the client already keeps
in-progress answers locally (Zustand + AsyncStorage, satisfying the "must
work offline" requirement) and only needs the network once, at the end, to
get a real score. Split it into separate endpoints later if server-side
resumable/shared audits (e.g. "hand a section to a colleague" via a link)
are needed.
