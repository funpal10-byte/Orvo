import { ensureSignedIn, supabase } from '../lib/supabase';
import type { DimensionKey } from '../data/questions';
import type { AuditRecord, ScoringResult } from './types';

type RpcResponse = {
  auditId: string;
  overallScore: number;
  peerMedian: number;
  peerCount: number;
  quartile: ScoringResult['quartile'];
  dimensions: Array<{ key: DimensionKey; score: number; peerMedian: number; note: string }>;
  gaps: Array<{ rank: string; title: string; effortImpact: string; body: string; suiteName: string }>;
};

export type RemoteScoringResult = ScoringResult & { auditId: string };

// Calls the score_new_audit Postgres function (supabase/schema.sql), which
// scores the audit against server-owned weights and a real, growing peer
// benchmark, then persists the audit row. Throws on any failure (no
// session, no network, RLS/config not set up) — callers should fall back
// to the local mock (src/state/scoring.ts) rather than block the user.
export async function runRemoteScoring(audit: AuditRecord): Promise<RemoteScoringResult> {
  await ensureSignedIn();

  const { data, error } = await supabase.rpc('score_new_audit', {
    p_brand: audit.brand,
    p_category: audit.category,
    p_market: audit.market,
    p_competitors: audit.competitors,
    p_answers: audit.answers,
  });

  if (error) {
    throw new Error(`score_new_audit failed: ${error.message}`);
  }

  const result = data as RpcResponse;
  return {
    auditId: result.auditId,
    overallScore: result.overallScore,
    peerMedian: result.peerMedian,
    peerCount: result.peerCount,
    quartile: result.quartile,
    dimensions: result.dimensions,
    gaps: result.gaps,
  };
}
