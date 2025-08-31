import { create } from 'zustand';

type PlayBotsStore = {
  botId: number;
  setBotId: (val: number) => void;
};

export const usePlayBotsStore = create<PlayBotsStore>((set) => ({
  botId: 1,
  setBotId: (val) => set({ botId: val }),
}));
