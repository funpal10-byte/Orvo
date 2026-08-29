import type { DimensionKey } from '../data/questions';

export type AuthState = 'anonymous' | 'signed-in';

export type DimensionResult = {
  key: DimensionKey;
  score: number;
  peerMedian: number;
  note: string;
};

export type Gap = {
  rank: string;
  title: string;
  effortImpact: string;
  body: string;
  suiteName: string;
};

export type ScoringStatus = 'idle' | 'running' | 'done' | 'error';

export type AuditHistoryEntry = {
  auditId: string;
  brand: string;
  date: string;
  overallScore: number;
};

// Quick: 18 self-reported questions only, no network needed to score.
// Standard: adds real web + news presence (brand and every named
// competitor) via SerpApi, blended into Search & answer visibility,
// Competitive standing and Distinctiveness.
// Deep: Standard, plus a live scan of what's being said about the brand on
// LinkedIn/Instagram/X, blended into Perception.
export type ResearchTier = 'quick' | 'standard' | 'deep';

export type AuditRecord = {
  auditId: string;
  brand: string;
  category: string;
  market: string;
  competitors: string[];
  website: string;
  researchTier: ResearchTier;
  answers: Record<string, string>;
  currentIndex: number;
  status: 'in-progress' | 'scored';
};

export type ScoringResult = {
  overallScore: number;
  peerMedian: number;
  peerCount: number;
  quartile: 'top' | 'upper-mid' | 'lower-mid' | 'bottom';
  dimensions: DimensionResult[];
  gaps: Gap[];
  // Dimension keys the research (not just self-report) actually
  // contributed to for this specific audit — empty on the Quick tier, or
  // when research was attempted but failed/returned nothing usable.
  researchApplied: DimensionKey[];
};
