import { useEffect, useState, useCallback } from 'react';
import { HStack } from '@chakra-ui/react';
import { AnalyseTool, PlayerRow } from '@/components';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useChessStore } from '@/store/chess.ts';
import { useAuthStore } from '@/store/auth.ts';
import { createRoom } from '@/api/rooms.ts';
import { useChessWs } from '@/hooks/useChessWss.ts';
import type { Square } from 'chess.js';

export const PlayPageComputer = () => {
  const token = useAuthStore((s) => s.accessToken);
  const [roomId, setRoomId] = useState<string>('');

  const resetGame = useChessStore((s) => s.resetGame);
  const applyMove = useChessStore((s) => s.applyMove);
  const playerSide = useChessStore((s) => s.playerSide);

  // 1) создаём комнату при маунте
  const startGame = useCallback(() => {
    (async () => {
      try {
        const resp = await createRoom({
          mode: 'bot', // или "pvp", если нужно
          side: playerSide === 'w' ? 'white' : playerSide === 'b' ? 'black' : 'random', // "white" | "black" | "random"
          name: 'SomeName', // опционально, если хочешь
        });
        setRoomId(resp.code);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token, playerSide]);

  // 2) когда придёт ход по WebSocket — передаём его в applyMove из доски
  const onOpponentMove = useCallback(
    (m: { from: Square; to: Square; promotion?: string }) => {
      applyMove?.({ from: m.from, to: m.to, promotion: m.promotion ?? 'q' });
    },
    [applyMove],
  );

  // 3) подключаемся к вебсокету, когда знаем roomId
  const { status, sendMove } = useChessWs({
    token: token ?? '',
    room: roomId,
    onOpponentMove,
  });

  // 5) коллбек твоего хода (пользовательского)
  const onMyMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      sendMove(from, to, promotion ?? '');
    },
    [sendMove],
  );

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, []);

  return (
    <HStack justify={'center'} gap={'3rem'}>
      <div className="my-auto flex flex-col">
        <PlayerRow />
        <ChessBoardWrapper showDialogWinGame={true} onMyMove={onMyMove} />
        <PlayerRow />
      </div>
      <AnalyseTool startGame={startGame} />
    </HStack>
  );
};
