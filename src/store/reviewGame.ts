import { create } from 'zustand';
import { type PieceSymbol } from 'chess.js';

export type AnalysesType = {
  bestResponse: string;
  createdAt: string;
  engineComment: string;
  evalAfterCp: number;
  evalBeforeCp: number;
  fenAfter: string;
  fenBefore: string;
  id: number;
  llmHint: string;
  llmShort: string;
  llmTags: string[];
  llmTone: string;
  move: string;
  pv: string[];
  piece: PieceSymbol;
  severity: 'great' | 'blunder' | 'mistake' | 'inaccuracy' | 'brilliant';
  side: 'white' | 'black';
};

type reviewGameStore = {
  id: string | null;
  analyses: AnalysesType[] | null;
  setId: (val: string) => void;
  setAnalyses: (val: AnalysesType[]) => void;
};

export const useReviewGameStore = create<reviewGameStore>((set) => ({
  id: null,
  analyses: null,
  setId: (val) => set({ id: val }),
  setAnalyses: (val) => set({ analyses: val }),
}));
