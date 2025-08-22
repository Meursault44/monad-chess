export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

const API_URL = import.meta.env['VITE_API_BASE_URL'];

export async function getRandomPuzzle(): Promise<Puzzle> {
  const res = await fetch(`${API_URL}/puzzles/random`);
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
  const res = await fetch(`${API_URL}/puzzles/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ move, step, id }),
  });
  if (!res.ok) throw new Error('Move check failed');
  return res.json();
}
