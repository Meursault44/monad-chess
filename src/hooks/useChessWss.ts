import { useEffect, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import { useChessStore } from '@/store/chess.ts';
import { refreshAccessToken } from '@/api/client.ts';
import { createRoom } from '@/api/rooms.ts';

export type OpponentMove = {
  from: Square;
  to: Square;
  promotion?: string;
};

type WsStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed';

type UseChessWsOptions = {
  token: string;
  room: string;
  onOpponentMove: (move: OpponentMove) => void;
};

const wsUrl = import.meta.env['VITE_WSS_BASE_URL'];

export function useChessWs({ token, room, onOpponentMove }: UseChessWsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>('idle');
  const startGame = useChessStore((s) => s.startGame);

  useEffect(() => {
    if (!token || !room) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus('connecting');

    const handleOpen = () => {
      // авторизация
      ws.send(
        JSON.stringify({
          type: 'auth',
          token,
          room,
        }),
      );
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
        if (msg?.type === 'game_over') {
          // game over
        }

        // ожидаем сообщения про ход соперника
        if (msg?.type === 'move') {
          const move: OpponentMove = {
            from: msg.from,
            to: msg.to,
            promotion: msg.promotion || '',
          };
          onOpponentMove(move);
        }

        // при желании можно обрабатывать другие типы: join/leave/result/error и т.д.
      } catch {
        // игнорируем некорректные сообщения
      }
    };

    const handleError = (e) => {
      setStatus('error');
    };
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
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl, token, room, onOpponentMove]);

  const sendMove = (from: Square, to: Square, promotion: string = '') => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: 'move',
        token,
        room,
        from,
        to,
        promotion,
      }),
    );
  };

  return {
    status,
    sendMove,
  };
}
