import type { Puzzle } from '@/api/puzzles.ts';
import { apiFetch } from '@/api/client.ts';

export async function getLeaderboard(): Promise<Puzzle> {
  const res = await apiFetch(`/home/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch ProfilePuzzles');
  return res.json();
}
