import { create } from 'zustand';

type PuzzlesState = {
  ratingChange: number | null;
};

type PuzzlesActions = {
  setRatingChange: (val: number | null) => void;
};

type PuzzlesStore = PuzzlesState & PuzzlesActions;

export const usePuzzlesStore = create<PuzzlesStore>()((set) => ({
  ratingChange: null,
  setRatingChange: (val) => set({ ratingChange: val }),
}));
