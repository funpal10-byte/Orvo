import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { QUESTIONS } from '../data/questions';
import { runScoring } from './scoring';
import { runRemoteScoring } from './remoteScoring';
import type {
  AuditHistoryEntry,
  AuditRecord,
  AuthState,
  ResearchTier,
  ScoringResult,
  ScoringStatus,
} from './types';

function newAuditId() {
  return `audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyAudit(): AuditRecord {
  return {
    auditId: newAuditId(),
    brand: '',
    category: '',
    market: '',
    competitors: [],
    website: '',
    researchTier: 'standard',
    answers: {},
    currentIndex: 0,
    status: 'in-progress',
  };
}

type AuditStore = {
  authState: AuthState;
  userId: string | null;

  audit: AuditRecord;
  scoringStatus: ScoringStatus;
  scoringResult: ScoringResult | null;
  expandedGapRank: string;
  history: AuditHistoryEntry[];

  setAuthState: (state: AuthState, userId?: string | null) => void;
  startNewAudit: () => void;
  updateAuditFields: (
    fields: Partial<Pick<AuditRecord, 'brand' | 'category' | 'market' | 'website'>>,
  ) => void;
  setResearchTier: (tier: ResearchTier) => void;
  addCompetitor: (name: string) => void;
  removeCompetitor: (name: string) => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  goToQuestionIndex: (index: number) => void;
  runScoringForAudit: () => Promise<void>;
  toggleGapExpanded: (rank: string) => void;
  previousScoreForBrand: (brand: string) => AuditHistoryEntry | null;
};

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      authState: 'anonymous',
      userId: null,

      audit: emptyAudit(),
      scoringStatus: 'idle',
      scoringResult: null,
      expandedGapRank: '01',
      history: [],

      setAuthState: (authState, userId = null) => set({ authState, userId }),

      startNewAudit: () =>
        set({
          audit: emptyAudit(),
          scoringStatus: 'idle',
          scoringResult: null,
          expandedGapRank: '01',
        }),

      updateAuditFields: (fields) =>
        set((s) => ({ audit: { ...s.audit, ...fields } })),

      setResearchTier: (researchTier) =>
        set((s) => ({ audit: { ...s.audit, researchTier } })),

      addCompetitor: (name) =>
        set((s) => {
          const trimmed = name.trim();
          if (!trimmed || s.audit.competitors.length >= 5 || s.audit.competitors.includes(trimmed)) return s;
          return { audit: { ...s.audit, competitors: [...s.audit.competitors, trimmed] } };
        }),

      removeCompetitor: (name) =>
        set((s) => ({
          audit: { ...s.audit, competitors: s.audit.competitors.filter((c) => c !== name) },
        })),

      answerQuestion: (questionId, optionId) =>
        set((s) => {
          const qIndex = QUESTIONS.findIndex((q) => q.id === questionId);
          const nextIndex = Math.min(qIndex + 1, QUESTIONS.length - 1);
          return {
            audit: {
              ...s.audit,
              answers: { ...s.audit.answers, [questionId]: optionId },
              currentIndex: nextIndex,
            },
          };
        }),

      goToQuestionIndex: (index) =>
        set((s) => ({ audit: { ...s.audit, currentIndex: index } })),

      runScoringForAudit: async () => {
        set({ scoringStatus: 'running' });
        const audit = get().audit;

        let result;
        let serverAuditId = audit.auditId;
        try {
          const remote = await runRemoteScoring(audit);
          result = remote;
          serverAuditId = remote.auditId;
        } catch (err) {
          // No session / no network / backend not set up yet — never block
          // an in-progress audit. Fall back to the local mock so the user
          // still gets a result; only the peer benchmark isn't real.
          console.warn('[scoring] remote scoring unavailable, using local fallback:', err);
          try {
            result = await runScoring(audit);
          } catch {
            set({ scoringStatus: 'error' });
            return;
          }
        }

        const entry: AuditHistoryEntry = {
          auditId: serverAuditId,
          brand: audit.brand,
          date: new Date().toISOString(),
          overallScore: result.overallScore,
        };
        set((s) => ({
          scoringStatus: 'done',
          scoringResult: result,
          audit: { ...s.audit, auditId: serverAuditId, status: 'scored' },
          history: [entry, ...s.history.filter((h) => h.auditId !== entry.auditId)],
        }));
      },

      toggleGapExpanded: (rank) =>
        set((s) => ({ expandedGapRank: s.expandedGapRank === rank ? '' : rank })),

      previousScoreForBrand: (brand) => {
        const currentAuditId = get().audit.auditId;
        const match = get().history.find(
          (h) => h.brand === brand && h.auditId !== currentAuditId,
        );
        return match ?? null;
      },
    }),
    {
      name: 'orvo-audit-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        audit: s.audit,
        history: s.history,
        authState: s.authState,
        userId: s.userId,
      }),
    },
  ),
);
