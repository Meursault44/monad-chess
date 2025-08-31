import { create } from 'zustand';

type DialogsState = {
  dialogWinGame: boolean;
  dialogLoseGame: boolean;
};

type DialogsActions = {
  setDialogWinGame: (val: boolean) => void;
  setDialogLoseGame: (val: boolean) => void;
};

type DialogsStore = DialogsState & DialogsActions;

export const useDialogsStore = create<DialogsStore>()((set) => ({
  dialogWinGame: false,
  dialogLoseGame: false,
  setDialogWinGame: (val) => set({ dialogWinGame: val }),
  setDialogLoseGame: (val) => set({ dialogLoseGame: val }),
}));
