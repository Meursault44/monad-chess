import { apiFetch } from '@/api/client.ts';
import type { Puzzle } from '@/api/puzzles.ts';

export async function getProfilePuzzles(): Promise<Puzzle> {
  const res = await apiFetch(`/profile/puzzles`);
  if (!res.ok) throw new Error('Failed to fetch ProfilePuzzles');
  return res.json();
}

export async function getProfileGames(): Promise<Puzzle> {
  const res = await apiFetch(`/profile/games`);
  if (!res.ok) throw new Error('Failed to fetch ProfileGames');
  return res.json();
}

export async function getProfileExperience(): Promise<Puzzle> {
  const res = await apiFetch(`/profile/experience`);
  if (!res.ok) throw new Error('Failed to fetch ProfileExperience');
  return res.json();
}

export async function profileUpdateRating(): Promise<Puzzle> {
  const res = await apiFetch(`/profile/updateRating`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to fetch ProfileExperience');
  return res.json();
}
