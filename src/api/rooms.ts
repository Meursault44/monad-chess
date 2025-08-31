import { apiFetch } from '@/api/client.ts';

export type CreateRoomBody = {
  mode: 'pvp' | 'bot';
  side: 'white' | 'black' | 'random';
  name?: string;
  botId: number;
};

export type CreateRoomResponse = {
  code: string; // например "W41H60"
};

export async function createRoom(body: CreateRoomBody): Promise<CreateRoomResponse> {
  const res = await apiFetch(`/rooms/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create room failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getBots() {
  const res = await apiFetch(`/rooms/bots`);
  if (!res.ok) throw new Error('Failed to fetch puzzle');
  return res.json();
}

export async function getAnalyzeGame(code: string) {
  const res = await apiFetch(`/rooms/analyze/${code}`);
  if (!res.ok) throw new Error('Failed to fetch puzzle');
  return res.json();
}

export async function passGame(code: string) {
  const res = await apiFetch(`/games/pass`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create room failed (${res.status}): ${text}`);
  }

  return res.json();
}
