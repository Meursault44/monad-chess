export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

const API_URL = 'http://localhost:4000'; // твой бэк

export async function getRandomPuzzle({
  queryKey,
}: {
  queryKey: [string, { minRating?: number; maxRating?: number }];
}) {
  const [, params] = queryKey;
  const url = new URL(`${API_URL}/puzzle/random`); // или твой API-URL

  if (params.minRating !== undefined) url.searchParams.set('minRating', String(params.minRating));
  if (params.maxRating !== undefined) url.searchParams.set('maxRating', String(params.maxRating));

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch puzzle');
  return res.json();
}

export async function getPuzzleById(id: string): Promise<Puzzle> {
  const res = await fetch(`${API_URL}/puzzles/${id}`);
  if (!res.ok) throw new Error('Puzzle not found');
  return res.json();
}

// export async function testAuth() {
//   const res = await fetch(`https://monad-chess.xyz/api/auth/login-global`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ address: '0x2c8fc4A223D8187e9A2F73a1d422C5881D0b14b7', providerAppId: 'cmd8euall0037le0my79qpz42' }),
//   });
//   if (!res.ok) throw new Error('Puzzle not found');
//   return res.json();
// }

export async function checkPuzzleMove(id: string, move: string, ply: number) {
  const res = await fetch(`${API_URL}/puzzles/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ move, ply }),
  });
  if (!res.ok) throw new Error('Move check failed');
  return res.json();
}
