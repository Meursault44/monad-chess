import { useEffect, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import { useChessStore } from '@/store/chess.ts';
import { refreshAccessToken } from '@/api/client.ts';
import { useDialogsStore } from '@/store/dialogs.ts';
import { useMutation } from '@tanstack/react-query';
import { passGame } from '@/api/rooms.ts';
import { useSoundEffects } from '@/hooks';

export type OpponentMove = {
  from: Square;
  to: Square;
  promotion?: string;
};

type WsStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed';

type UseChessWsOptions = {
  token: string;
  room: string | null;
  onOpponentMove: (move: OpponentMove) => void;
};

const wsUrl = import.meta.env['VITE_WSS_BASE_URL'];

export function useChessWs({ token, room, onOpponentMove }: UseChessWsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>('idle');

  const startGame = useChessStore((s) => s.startGame);
  const resetGame = useChessStore((s) => s.resetGame);
  const setDialogWinGame = useDialogsStore((s) => s.setDialogWinGame);
  const setDialogLoseGame = useDialogsStore((s) => s.setDialogLoseGame);
  const playerSide = useChessStore((s) => s.playerSide);
  const setPlayerSide = useChessStore((s) => s.setPlayerSide);
  const { playGameStartSfx } = useSoundEffects();

  // хранить актуальную сторону без протягивания в deps
  const playerSideRef = useRef(playerSide);
  useEffect(() => {
    playerSideRef.current = playerSide;
  }, [playerSide]);

  const { mutate: mutatePassGame, data: dataPassGame } = useMutation({ mutationFn: passGame });

  useEffect(() => {
    // создаём сокет только когда реально есть данные
    if (!token || !room) return;
    // не пересоздаём, если уже открыт
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

    playGameStartSfx();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus('connecting');

    const handleOpen = () => {
      ws.send(JSON.stringify({ type: 'auth', token, room }));
      startGame();
      setStatus('open');
    };

    const handleMessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);

        if (msg?.type === 'error' && msg?.message === 'jwt expired') {
          (async () => {
            try {
              await refreshAccessToken();
            } catch (e) {
              console.error(e);
            }
          })();
        }

        if (msg?.type === 'game_state') {
          setPlayerSide(msg?.black === 'BOT' ? 'w' : 'b');
        }

        if (msg?.type === 'game_over') {
          const side = playerSideRef.current === 'w' ? 'white' : 'black';
          if (msg.result?.winner === side) setDialogWinGame(true);
          else setDialogLoseGame(true);
          resetGame();
          ws.close();
          wsRef.current = null;
        }

        if (msg?.type === 'move') {
          onOpponentMove({
            from: msg.from,
            to: msg.to,
            promotion: msg.promotion || '',
          });
        }
      } catch {
        /* ignore */
      }
    };

    const handleError = () => setStatus('error');
    const handleClose = () => setStatus('closed');

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', handleError);
    ws.addEventListener('close', handleClose);

    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('error', handleError);
      ws.removeEventListener('close', handleClose);
      // Закрываем только если это всё ещё тот же инстанс
      if (wsRef.current === ws) {
        ws.close();
        wsRef.current = null;
      }
    };
    // ВАЖНО: только то, что реально требует пересоздания соединения
  }, [token, room]); // не включаем wsRef.current, playerSide, resetGame, onOpponentMove

  const sendMove = (from: Square, to: Square, promotion: string = '') => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'move', token, room, from, to, promotion }));
  };

  useEffect(() => {
    if (dataPassGame?.success) {
      resetGame();
      setDialogLoseGame(true);
      wsRef.current?.close();
      wsRef.current = null;
    }
  }, [dataPassGame, resetGame, setDialogLoseGame]);

  const pass = () => {
    if (room) mutatePassGame(room);
  };

  return { status, sendMove, pass };
}
