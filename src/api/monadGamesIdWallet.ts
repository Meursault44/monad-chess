export interface CheckWalletResponse {
  exists: boolean; // или какой ответ реально приходит
  [key: string]: unknown; // если есть дополнительные поля
}

export async function checkWallet(walletAddress: string): Promise<CheckWalletResponse> {
  const res = await fetch(
    `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${encodeURIComponent(walletAddress)}`,
    {
      method: 'GET',
    },
  );
  if (!res.ok) throw new Error('Failed to check wallet');
  return res.json();
}
