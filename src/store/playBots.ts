import { create } from 'zustand';

type PlayBotsStore = {
  botId: number;
  botAvatar: string;
  botName: string;
  setBotAvatar: (val: string) => void;
  setBotId: (val: number) => void;
  setBotName: (val: string) => void;
};

export const usePlayBotsStore = create<PlayBotsStore>((set) => ({
  botId: 10,
  botAvatar: '/JohnW.jpg',
  botName: 'John W. Rich Kid',
  setBotId: (val) => set({ botId: val }),
  setBotAvatar: (val) => set({ botAvatar: val }),
  setBotName: (val) => set({ botName: val }),
}));
