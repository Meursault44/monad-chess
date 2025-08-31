import { create } from 'zustand';

type PlayBotsStore = {
  botId: number;
  botAvatar: string;
  setBotAvatar: (val: string) => void;
  setBotId: (val: number) => void;
};

export const usePlayBotsStore = create<PlayBotsStore>((set) => ({
  botId: 10,
  botAvatar: '/JohnW.jpg',
  setBotId: (val) => set({ botId: val }),
  setBotAvatar: (val) => set({ botAvatar: val }),
}));
