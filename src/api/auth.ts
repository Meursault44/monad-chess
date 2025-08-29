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

type LoginRequest = {
  provider: string;
  providerUserId: string;
  providerAppId: string;
};

export async function loginRequest({
  provider,
  providerUserId,
  providerAppId,
}: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch('/auth/login-global', {
    method: 'POST',
    body: JSON.stringify({ provider, providerUserId, providerAppId }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export function finishAuth({ token, user }: LoginResponse) {
  useAuthStore.getState().setAuth({ user, accessToken: token });
  usePuzzlesStore.getState().setRating(user.puzzle_rating);
}

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async ({ provider, providerUserId, providerAppId }) =>
      loginRequest({ provider, providerUserId, providerAppId }),
    onSuccess: (data) => {
      finishAuth(data);
    },
  });
}
