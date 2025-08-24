import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: number;
  monad_games_id: boolean | number | null | false;
  puzzle_rating: number;
  rating: number;
  username: string;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (p: { user: User; accessToken: string }) => void;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: ({ user, accessToken }) => set({ user, accessToken }),
      setAccessToken: (token) => set({ accessToken: token }),
      clear: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    },
  ),
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (t: string | null) => useAuthStore.getState().setAccessToken(t);
