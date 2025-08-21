import { create } from 'zustand';

type DialogsState = {
  dialogWinGame: boolean;
  dialogSolvedPuzzle: boolean;
};

type DialogsActions = {
  setDialogWinGame: (val: boolean) => void;
  setDialogSolvedPuzzle: (val: boolean) => void;
};

type DialogsStore = DialogsState & DialogsActions;

export const useDialogsStore = create<DialogsStore>()((set) => ({
  dialogWinGame: false,
  dialogSolvedPuzzle: false,
  setDialogWinGame: (val) => set({ dialogWinGame: val }),
  setDialogSolvedPuzzle: (val) => set({ dialogSolvedPuzzle: val }),
}));
