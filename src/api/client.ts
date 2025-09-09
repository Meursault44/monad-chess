import { getAccessToken, getUserName, setAccessToken } from '@/store/auth.ts';
import { QueryClient } from '@tanstack/react-query';
import { setDialogLogin } from '@/store/dialogs.ts';

// Эндпоинты — проверьте реальные пути на бэке
const REFRESH_PATH = '/auth/refresh';

const API_URL = import.meta.env['VITE_API_BASE_URL'];

export async function refreshAccessToken(): Promise<string | null> {
  // Запрос использует HttpOnly refresh cookie, потому передаём credentials
  const res = await fetch(`${API_URL}${REFRESH_PATH}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  const newToken = data?.data?.token ?? null;
  if (newToken) {
    setAccessToken(newToken);
  } else {
    setAccessToken(null);
  }
  return newToken;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  const username = getUserName();

  if (!token || username === null) {
    setDialogLogin(true);
    return { ok: false, json: () => '' };
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(`${API_URL}${input}`, {
    ...init,
    headers,
    credentials: 'include', // важно: чтобы cookie с рефрешем ходила
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      if (!retryHeaders.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      res = await fetch(`${API_URL}${input}`, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
      });
    }
  }

  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
