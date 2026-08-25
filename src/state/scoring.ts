import { DIMENSIONS, QUESTIONS, type DimensionKey } from '../data/questions';
import type { AuditRecord, DimensionResult, Gap, ScoringResult } from './types';

// STUB — the handoff is explicit that scoring weights, the question bank and
// the gap→suite mapping are owned by ORVO Co. and must live server-side
// (`POST /audits/:id/score`, versioned). This client-side engine exists only
// so the app is usable end-to-end before that backend exists. Swap the body
// of `runScoring` for a network call to the real endpoint and delete the rest
// of this file.

const OPTION_SCORE = [100, 66, 33, 33]; // index 3 ("don't know") ties the weakest substantive answer, never penalized further

const DIMENSION_SUITE: Record<DimensionKey, string> = {
  Distinctiveness: 'BrandVault™',
  Consistency: 'BrandCore™',
  'Search & answer visibility': 'DemandEngine™',
  Perception: 'MarketPulse™',
  'Competitive standing': 'InsightEdge™',
  'Internal alignment': 'PeopleVoice™',
};

const DIMENSION_NOTE: Record<DimensionKey, { below: string; above: string }> = {
  Distinctiveness: {
    below: 'Assets are not reliably attributed without the logo present.',
    above: 'Distinctive assets carry recognition on their own.',
  },
  Consistency: {
    below: 'Website, sales deck and job posts tell different stories.',
    above: 'Touchpoints stay aligned as positioning shifts.',
  },
  'Search & answer visibility': {
    below: 'Rarely cited when buyers ask an AI assistant about the category.',
    above: 'Regularly cited in category answers.',
  },
  Perception: {
    below: 'Trusted, but not differentiated from competitors.',
    above: 'Perceived as genuinely different, not just reliable.',
  },
  'Competitive standing': {
    below: 'Trailing the named competitor set on share of search.',
    above: 'Leading the named competitor set on share of search.',
  },
  'Internal alignment': {
    below: 'Leadership and new hires describe the brand inconsistently.',
    above: 'Strongest dimension — internal story is consistent.',
  },
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dimensionScore(answers: Record<string, string>, dimension: DimensionKey): number {
  const qs = QUESTIONS.filter((q) => q.dimension === dimension);
  const values = qs.map((q) => {
    const answer = answers[q.id];
    if (!answer) return null;
    const idx = q.options.indexOf(answer);
    return OPTION_SCORE[idx < 0 ? 3 : idx];
  });
  const answered = values.filter((v): v is number => v !== null);
  if (answered.length === 0) return 33;
  return Math.round(answered.reduce((a, b) => a + b, 0) / answered.length);
}

function quartileFor(score: number, peerMedian: number): ScoringResult['quartile'] {
  if (score >= peerMedian + 15) return 'top';
  if (score >= peerMedian) return 'upper-mid';
  if (score >= peerMedian - 15) return 'lower-mid';
  return 'bottom';
}

export function peerCountForCategory(category: string): number {
  const rand = seededRandom(hashSeed(category.trim().toLowerCase() || 'general'));
  return 60 + Math.floor(rand() * 400);
}

export async function runScoring(audit: AuditRecord): Promise<ScoringResult> {
  const rand = seededRandom(hashSeed(audit.category + audit.market));

  const dimensions: DimensionResult[] = DIMENSIONS.map((key) => {
    const score = dimensionScore(audit.answers, key);
    const peerMedian = 48 + Math.floor(rand() * 20);
    const note = score < peerMedian ? DIMENSION_NOTE[key].below : DIMENSION_NOTE[key].above;
    return { key, score, peerMedian, note };
  });

  const overallScore = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);
  const peerMedian = Math.round(dimensions.reduce((a, d) => a + d.peerMedian, 0) / dimensions.length);

  const effortCycle: Array<'Low' | 'Medium'> = ['Low', 'Medium'];
  const impactCycle: Array<'High' | 'Medium'> = ['High', 'Medium'];

  const gaps: Gap[] = dimensions
    .filter((d) => d.score < d.peerMedian)
    .map((d, i) => ({ d, gapSize: d.peerMedian - d.score, i }))
    .sort((a, b) => b.gapSize - a.gapSize)
    .slice(0, 4)
    .map(({ d, i }, rankIndex) => ({
      rank: String(rankIndex + 1).padStart(2, '0'),
      title: `Close the ${d.key.toLowerCase()} gap`,
      effortImpact: `${effortCycle[i % 2]} effort · ${impactCycle[i % 2]} impact`,
      body: `${d.key} scores ${d.score} against a peer median of ${d.peerMedian}. ${DIMENSION_NOTE[d.key].below}`,
      suiteName: DIMENSION_SUITE[d.key],
    }));

  return {
    overallScore,
    peerMedian,
    peerCount: peerCountForCategory(audit.category),
    quartile: quartileFor(overallScore, peerMedian),
    dimensions,
    gaps,
  };
}
