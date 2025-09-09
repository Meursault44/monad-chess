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
  userName: string | null;
  setAuth: (p: { user: User; accessToken: string }) => void;
  setAccessToken: (token: string | null) => void;
  setPuzzleRating: (rating: number) => void;
  setUserName: (name: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userName: '',
      accessToken: null,
      setAuth: ({ user, accessToken }) => set({ user, accessToken }),
      setPuzzleRating: (rating) =>
        set((state) => ({
          user: state.user ? { ...state.user, puzzle_rating: rating } : state.user,
        })),
      setAccessToken: (token) => set({ accessToken: token }),
      setUserName: (name) => set({ userName: name }),
      clear: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    },
  ),
);

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const getUserName = () => useAuthStore.getState().userName;
export const setAccessToken = (t: string | null) => useAuthStore.getState().setAccessToken(t);
