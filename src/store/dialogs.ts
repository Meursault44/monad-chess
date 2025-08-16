import { create } from 'zustand'


type DialogsState = {
    dialogWinGame: boolean;
}

type DialogsActions = {
    setDialogWinGame: (val: boolean) => void;
}

type DialogsStore = DialogsState & DialogsActions;

export const useDialogsStore = create<DialogsStore>()((set) => ({
    dialogWinGame: false,
    setDialogWinGame: (val) => set({ dialogWinGame: val }),
}))
