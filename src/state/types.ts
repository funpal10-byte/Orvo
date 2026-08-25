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

export type AuditRecord = {
  auditId: string;
  brand: string;
  category: string;
  market: string;
  competitors: string[];
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
};
