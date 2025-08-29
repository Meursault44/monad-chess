import { create } from 'zustand';
import type { Square } from 'chess.js';

type PuzzleEffectsStore = {
  rippleSignal: number;
  winAnimationData: Square | null;
  animationDone: boolean;
  triggerWinAnimation: (sq: Square | null) => void;
  triggerRipple: () => void;
  setAnimationDone: (val: boolean) => void;
};

export const usePuzzleEffects = create<PuzzleEffectsStore>((set) => ({
  rippleSignal: 0,
  winAnimationData: null,
  animationDone: false,
  triggerRipple: () => set((s) => ({ rippleSignal: s.rippleSignal + 1 })),
  triggerWinAnimation: (sq) => set({ winAnimationData: sq }),
  setAnimationDone: (val) => set({ animationDone: val }),
}));
