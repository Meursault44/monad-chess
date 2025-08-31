import { create } from 'zustand';
import { useAuthStore } from '@/store/auth.ts';

type DialogsState = {
  dialogWinGame: boolean;
  dialogLoseGame: boolean;
  dialogLogin: boolean;
};

type DialogsActions = {
  setDialogWinGame: (val: boolean) => void;
  setDialogLoseGame: (val: boolean) => void;
  setDialogLogin: (val: boolean) => void;
};

type DialogsStore = DialogsState & DialogsActions;

export const useDialogsStore = create<DialogsStore>()((set) => ({
  dialogWinGame: false,
  dialogLoseGame: false,
  dialogLogin: false,
  setDialogWinGame: (val) => set({ dialogWinGame: val }),
  setDialogLoseGame: (val) => set({ dialogLoseGame: val }),
  setDialogLogin: (val) => set({ dialogLogin: val }),
}));

export const setDialogLogin = (t: boolean) => useDialogsStore.getState().setDialogLogin(t);
