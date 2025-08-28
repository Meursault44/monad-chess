import { create } from 'zustand';

type PuzzlesState = {
  rating: number;
  assistantMessage: string;
  isPendingAssistantMessage: boolean;
  ratingChange: number | null;
};

type PuzzlesActions = {
  setRatingChange: (val: number | null) => void;
  setRating: (val: number) => void;
  setAssistantMessage: (msg: string) => void;
  setIsPendingAssistantMessage: (isPending: boolean) => void;
};

type PuzzlesStore = PuzzlesState & PuzzlesActions;

export const usePuzzlesStore = create<PuzzlesStore>()((set) => ({
  ratingChange: null,
  rating: 0,
  assistantMessage: '',
  isPendingAssistantMessage: false,
  setRatingChange: (val) => set({ ratingChange: val }),
  setRating: (val) => set({ rating: val }),
  setAssistantMessage: (msg) => set({ assistantMessage: msg }),
  setIsPendingAssistantMessage: (isPending) => set({ isPendingAssistantMessage: isPending }),
}));
