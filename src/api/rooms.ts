import { apiFetch } from '@/api/client.ts';

export type CreateRoomBody = {
  mode: 'pvp' | 'bot';
  side: 'white' | 'black' | 'random';
  name?: string;
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
