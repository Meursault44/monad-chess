import { apiFetch } from './client';
import { type User } from '@/store/auth.ts';
import { useAuthStore } from '@/store/auth';
import { usePuzzlesStore } from '@/store/puzzles.ts';
import { useMutation } from '@tanstack/react-query';

export type LoginResponse = {
  token: string; // access token (JWT)
  refreshToken?: string; // на клиенте НЕ сохраняем, его установит сервер как HttpOnly cookie
  user: User;
};

export async function loginRequest(address: string): Promise<LoginResponse> {
  const res = await apiFetch('/auth/login-global', {
    method: 'POST',
    body: JSON.stringify({ address, providerAppId: 'cmd8euall0037le0my79qpz42' }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export function finishAuth({ token, user }: LoginResponse) {
  useAuthStore.getState().setAuth({ user, accessToken: token });
  usePuzzlesStore.getState().setRating(user.puzzle_rating);
}

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, { address: string }>({
    mutationFn: async ({ address }) => loginRequest(address),
    onSuccess: (data) => {
      finishAuth(data);
    },
  });
}
