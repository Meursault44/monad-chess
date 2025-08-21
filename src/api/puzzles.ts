export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

const API_URL = 'http://localhost:4000'; // твой бэк

export async function getRandomPuzzle(): Promise<Puzzle> {
  const res = await fetch(`${API_URL}/puzzle/random`);
  if (!res.ok) throw new Error('Failed to fetch puzzle');
  return res.json();
}

export async function getPuzzleById(id: string): Promise<Puzzle> {
  const res = await fetch(`${API_URL}/puzzles/${id}`);
  if (!res.ok) throw new Error('Puzzle not found');
  return res.json();
}

export async function checkPuzzleMove(id: string, move: string, ply: number) {
  const res = await fetch(`${API_URL}/puzzles/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ move, ply }),
  });
  if (!res.ok) throw new Error('Move check failed');
  return res.json();
}
