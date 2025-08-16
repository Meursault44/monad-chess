import { create } from 'zustand'


type ChessStoreState = {
    history: string[];
}

type ChessStoreActions = {
    setHistory: (history: string[]) => void;
}

type ChessStore = ChessStoreState & ChessStoreActions;

export const useChessStore = create<ChessStore>()((set) => ({
    history: [],
    setHistory: (history) => set({ history }),
}))
