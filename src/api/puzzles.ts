import { apiFetch } from '@/api/client';

export type Puzzle = {
  greeting: {
    text: string;
    ton: string;
  };
  puzzle: {
    id: string;
    fen: string;
    moves: string[];
    rating: number;
    themes: string[];
  };
};

export async function getRandomPuzzle(): Promise<Puzzle> {
  const res = await apiFetch(`/puzzles/random`);
  if (!res.ok) throw new Error('Failed to fetch puzzle');
  return res.json();
}

export async function checkPuzzleMove({
  id,
  move,
  step,
}: {
  id: string;
  move: string;
  step: number;
}) {
  const res = await apiFetch(`/puzzles/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ move, step, id }),
  });
  if (!res.ok) throw new Error('Move check failed');
  return res.json();
}
