-- Orvo — Original Voice Audit: Supabase schema
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent-ish: safe to re-run, but re-running will NOT reset benchmarks data
-- (uses IF NOT EXISTS / ON CONFLICT DO NOTHING for seed rows).
--
-- After running this, also enable "Anonymous sign-ins" under
-- Authentication → Sign In / Providers — the app signs users in anonymously
-- so audits can be scoped to auth.uid() without forcing an account up front.

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

-- Canonical question bank + per-option scoring weights. Owned by ORVO Co.,
-- server-side only (no client read policy — only the score_new_audit
-- function, running as SECURITY DEFINER, touches this table).
create table if not exists question_bank (
  id text primary key,
  dimension text not null,
  question_order int not null,
  question_text text not null,
  options text[] not null,
  option_scores int[] not null
);

-- Dimension → ORVO Co. service suite mapping for the action list.
create table if not exists suite_rules (
  dimension text primary key,
  suite_name text not null
);

-- Running per-category peer benchmark. Seeded with a deterministic synthetic
-- baseline (so the app has something sane to compare against before real
-- audits exist for a category), then blended toward real submitted scores
-- as sample_count grows — fully real by ~20 audits in that category.
create table if not exists benchmarks (
  category_key text primary key,
  sample_count int not null default 0,
  dimension_sums jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- One row per completed audit. RLS-scoped to the owning user (works for
-- both anonymous and signed-in sessions — Supabase anonymous auth issues a
-- real auth.uid()).
create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  category text not null,
  market text not null,
  competitors text[] not null default '{}',
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'scored',
  overall_score int,
  peer_median int,
  peer_count int,
  quartile text,
  dimensions jsonb,
  gaps jsonb,
  scoring_version int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists audits_user_brand_idx on audits (user_id, brand, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table audits enable row level security;

drop policy if exists "select own audits" on audits;
create policy "select own audits" on audits
  for select using (auth.uid() = user_id);

drop policy if exists "insert own audits" on audits;
create policy "insert own audits" on audits
  for insert with check (auth.uid() = user_id);

-- question_bank, suite_rules, benchmarks: RLS enabled, no policies granted.
-- These are server-owned (scoring weights, gap→suite mapping, peer
-- aggregates) and are only ever touched from inside score_new_audit, which
-- runs as SECURITY DEFINER and bypasses RLS as the function owner.
alter table question_bank enable row level security;
alter table suite_rules enable row level security;
alter table benchmarks enable row level security;

-- ============================================================
-- Seed data — must match src/data/questions.ts exactly (same ids,
-- dimension names, option text and order) or client answers won't map to
-- the right scoring weight.
-- ============================================================

insert into question_bank (id, dimension, question_order, question_text, options, option_scores) values
  ('d1q1', 'Distinctiveness', 1, 'Without your logo, could a customer name the brand from your last campaign?', array['Confidently','Probably','Unlikely',E'Don''t know'], array[100,66,33,33]),
  ('d1q2', 'Distinctiveness', 2, 'Do you have visual or verbal assets that competitors could not credibly reuse?', array['Several','One or two','None we could name',E'Don''t know'], array[100,66,33,33]),
  ('d1q3', 'Distinctiveness', 3, 'When you last briefed a new agency or hire, could they describe the brand in one line?', array['Yes, consistently','With prompting','No',E'Don''t know'], array[100,66,33,33]),
  ('d2q1', 'Consistency', 1, 'Do your website, sales deck and job posts tell the same story?', array['One story','Mostly aligned','Three stories',E'Don''t know'], array[100,66,33,33]),
  ('d2q2', 'Consistency', 2, 'Has your positioning changed in the last year without every touchpoint being updated?', array['No, all updated','Mostly updated','Yes, drift exists',E'Don''t know'], array[100,66,33,33]),
  ('d2q3', 'Consistency', 3, 'Do regional or partner teams use brand assets you did not approve?', array['Never','Rarely','Regularly',E'Don''t know'], array[100,66,33,33]),
  ('d3q1', 'Search & answer visibility', 1, 'When buyers ask an AI assistant about your category, are you cited?', array['Regularly','Occasionally','Never checked','No'], array[100,66,33,33]),
  ('d3q2', 'Search & answer visibility', 2, 'Do your commercial pages answer the questions buyers actually search?', array['Yes, most pages','Some pages','Few or none',E'Don''t know'], array[100,66,33,33]),
  ('d3q3', 'Search & answer visibility', 3, 'Do you track share of search against your named competitors?', array['Tracked quarterly','Tracked occasionally','Never tracked',E'Don''t know'], array[100,66,33,33]),
  ('d4q1', 'Perception', 1, 'Would an independent ranking, award or certification back up how you describe your reputation?', array['Yes, consistently','Partially','No',E'Don''t know'], array[100,66,33,33]),
  ('d4q2', 'Perception', 2, 'If a customer switched away tomorrow, would they still speak well of you afterward?', array['Definitely','Probably','Unlikely',E'Don''t know'], array[100,66,33,33]),
  ('d4q3', 'Perception', 3, 'Do people choose you even when a cheaper or more convenient option exists?', array['Regularly','Sometimes','Rarely',E'Don''t know'], array[100,66,33,33]),
  ('d5q1', 'Competitive standing', 1, 'Where do you rank on visible share of voice against your named competitor set (media, search, social)?', array['First or second','Middle of the set','Last',E'Don''t know'], array[100,66,33,33]),
  ('d5q2', 'Competitive standing', 2, 'Do you show up in industry conversations — press, panels, forums — as often as your competitors?', array['More often','About the same','Less often',E'Don''t know'], array[100,66,33,33]),
  ('d5q3', 'Competitive standing', 3, 'When something shifts in your market, are you first to respond or last to notice?', array['First to respond','Middle of the pack','Last to notice',E'Don''t know'], array[100,66,33,33]),
  ('d6q1', 'Internal alignment', 1, 'Could your leadership team state the brand''s direction the same way, independently of each other?', array['Yes, consistently','Mostly','No',E'Don''t know'], array[100,66,33,33]),
  ('d6q2', 'Internal alignment', 2, 'When the market shifts, how fast can the organisation actually change course?', array['Within weeks','Within a quarter','Rarely at all',E'Don''t know'], array[100,66,33,33]),
  ('d6q3', 'Internal alignment', 3, 'Do frontline teams get heard when they flag what customers are telling them?', array['Yes, and it changes things','Heard, rarely acted on','Not really',E'Don''t know'], array[100,66,33,33])
on conflict (id) do update set
  dimension = excluded.dimension,
  question_order = excluded.question_order,
  question_text = excluded.question_text,
  options = excluded.options,
  option_scores = excluded.option_scores;

insert into suite_rules (dimension, suite_name) values
  ('Distinctiveness', 'BrandVault™'),
  ('Consistency', 'BrandCore™'),
  ('Search & answer visibility', 'DemandEngine™'),
  ('Perception', 'MarketPulse™'),
  ('Competitive standing', 'InsightEdge™'),
  ('Internal alignment', 'PeopleVoice™')
on conflict (dimension) do update set suite_name = excluded.suite_name;

-- ============================================================
-- score_new_audit: create + score an audit in one call.
--
-- Collapses the handoff's POST /audits + PATCH /audits/:id/answers +
-- POST /audits/:id/score into a single RPC for a simpler MVP client. Split
-- into separate endpoints later if partial/resumable server-side audits are
-- needed (the client already persists in-progress answers locally either
-- way, per the offline requirement).
-- ============================================================

create or replace function public.score_new_audit(
  p_brand text,
  p_category text,
  p_market text,
  p_competitors text[],
  p_answers jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_key text := lower(trim(p_category));
  v_audit_id uuid;
  v_dim_order text[] := array['Distinctiveness','Consistency','Search & answer visibility','Perception','Competitive standing','Internal alignment'];
  v_dname text;
  v_score numeric;
  v_dim_scores jsonb := '{}'::jsonb;
  v_bm record;
  v_synthetic_count int;
  v_peer_count int;
  v_synthetic_peer numeric;
  v_real_peer numeric;
  v_blend_weight numeric;
  v_blended_peer numeric;
  v_new_sums jsonb;
  v_dim_results jsonb := '[]'::jsonb;
  v_gaps jsonb := '[]'::jsonb;
  v_overall numeric;
  v_peer_median numeric;
  v_quartile text;
begin
  if auth.uid() is null then
    raise exception 'must be signed in (anonymous sign-in is fine)';
  end if;

  -- 1. score each dimension from the 3 questions belonging to it
  foreach v_dname in array v_dim_order loop
    select avg(
      case
        when p_answers ? qb.id then
          coalesce(qb.option_scores[array_position(qb.options, p_answers->>qb.id)], 33)
        else 33
      end
    ) into v_score
    from question_bank qb
    where qb.dimension = v_dname;

    v_dim_scores := v_dim_scores || jsonb_build_object(v_dname, round(coalesce(v_score, 33)));
  end loop;

  -- 2. get or seed this category's benchmark row
  select * into v_bm from benchmarks where category_key = v_category_key;
  if not found then
    insert into benchmarks (category_key) values (v_category_key) returning * into v_bm;
  end if;

  v_synthetic_count := 60 + (abs(hashtext(v_category_key)) % 400);
  v_peer_count := greatest(v_bm.sample_count, v_synthetic_count);
  v_new_sums := v_bm.dimension_sums;

  -- 3. per-dimension peer median: deterministic synthetic baseline, blended
  --    toward the real running mean as sample_count grows
  foreach v_dname in array v_dim_order loop
    v_score := (v_dim_scores->>v_dname)::numeric;
    v_synthetic_peer := 48 + (abs(hashtext(v_category_key || v_dname)) % 20);

    if v_bm.sample_count > 0 then
      v_real_peer := coalesce((v_new_sums->>v_dname)::numeric, 0) / v_bm.sample_count;
      v_blend_weight := least(v_bm.sample_count / 20.0, 1.0);
      v_blended_peer := v_synthetic_peer * (1 - v_blend_weight) + v_real_peer * v_blend_weight;
    else
      v_blended_peer := v_synthetic_peer;
    end if;

    v_dim_results := v_dim_results || jsonb_build_array(jsonb_build_object(
      'key', v_dname,
      'score', round(v_score),
      'peerMedian', round(v_blended_peer),
      'note', case when v_score < v_blended_peer
        then 'Below peer benchmark on this dimension.'
        else 'At or above peer benchmark on this dimension.' end
    ));

    v_new_sums := jsonb_set(
      v_new_sums, array[v_dname],
      to_jsonb(coalesce((v_new_sums->>v_dname)::numeric, 0) + v_score)
    );
  end loop;

  update benchmarks
    set sample_count = sample_count + 1,
        dimension_sums = v_new_sums,
        updated_at = now()
    where category_key = v_category_key;

  select avg((d->>'score')::numeric), avg((d->>'peerMedian')::numeric)
    into v_overall, v_peer_median
    from jsonb_array_elements(v_dim_results) d;

  v_quartile := case
    when v_overall >= v_peer_median + 15 then 'top'
    when v_overall >= v_peer_median then 'upper-mid'
    when v_overall >= v_peer_median - 15 then 'lower-mid'
    else 'bottom'
  end;

  -- 4. gaps: dimensions below peer, ranked by gap size, top 4, mapped to suites
  with dims as (
    select d, ((d->>'peerMedian')::numeric - (d->>'score')::numeric) as gap_size
    from jsonb_array_elements(v_dim_results) d
    where (d->>'score')::numeric < (d->>'peerMedian')::numeric
  ),
  ranked as (
    select d, row_number() over (order by gap_size desc) as rn
    from dims
    order by gap_size desc
    limit 4
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'rank', lpad(rn::text, 2, '0'),
      'title', 'Close the ' || lower(ranked.d->>'key') || ' gap',
      'effortImpact', case when rn % 2 = 1 then 'Low effort · High impact' else 'Medium effort · Medium impact' end,
      'body', (ranked.d->>'key') || ' scores ' || (ranked.d->>'score') || ' against a peer median of ' || (ranked.d->>'peerMedian') || '.',
      'suiteName', sr.suite_name
    ) order by rn
  ), '[]'::jsonb)
  into v_gaps
  from ranked
  join suite_rules sr on sr.dimension = ranked.d->>'key';

  -- 5. persist the audit
  insert into audits (
    user_id, brand, category, market, competitors, answers, status,
    overall_score, peer_median, peer_count, quartile, dimensions, gaps
  ) values (
    auth.uid(), p_brand, p_category, p_market, p_competitors, p_answers, 'scored',
    round(v_overall), round(v_peer_median), v_peer_count, v_quartile, v_dim_results, v_gaps
  ) returning id into v_audit_id;

  return jsonb_build_object(
    'auditId', v_audit_id,
    'overallScore', round(v_overall),
    'peerMedian', round(v_peer_median),
    'peerCount', v_peer_count,
    'quartile', v_quartile,
    'dimensions', v_dim_results,
    'gaps', v_gaps
  );
end;
$$;

grant execute on function public.score_new_audit(text, text, text, text[], jsonb) to anon, authenticated;
