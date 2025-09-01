import { useEffect, useState, useCallback } from 'react';
import { HStack } from '@chakra-ui/react';
import { AnalyseToolPlayComputer, PlayerRow } from '@/components';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useChessStore } from '@/store/chess.ts';
import { useAuthStore } from '@/store/auth.ts';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { createRoom } from '@/api/rooms.ts';
import { useChessWs } from '@/hooks/useChessWss.ts';
import type { Square } from 'chess.js';
import { usePlayBotsStore } from '@/store/playBots.ts';

export const PlayPageComputer = () => {
  const token = useAuthStore((s) => s.accessToken);

  const resetGame = useChessStore((s) => s.resetGame);
  const applyMove = useChessStore((s) => s.applyMove);
  const playerSide = useChessStore((s) => s.playerSide);
  const phase = useChessStore((s) => s.phase);
  const roomId = useReviewGameStore((s) => s.id);
  const setRoomId = useReviewGameStore((s) => s.setId);
  const botAvatar = usePlayBotsStore((s) => s.botAvatar);
  const botName = usePlayBotsStore((s) => s.botName);

  const startGame = useCallback(
    (botId: number) => {
      (async () => {
        try {
          const resp = await createRoom({
            mode: 'bot', // или "pvp", если нужно
            side: playerSide === 'w' ? 'white' : playerSide === 'b' ? 'black' : 'random', // "white" | "black" | "random"
            name: 'SomeName', // опционально, если хочешь
            botId,
          });
          setRoomId(resp.code);
        } catch (e) {
          console.error(e);
        }
      })();
    },
    [token, playerSide, setRoomId],
  );

  // 2) когда придёт ход по WebSocket — передаём его в applyMove из доски
  const onOpponentMove = useCallback(
    (m: { from: Square; to: Square; promotion?: string }) => {
      applyMove?.({ from: m.from, to: m.to, promotion: m.promotion ?? 'q' });
    },
    [applyMove],
  );

  // 3) подключаемся к вебсокету, когда знаем roomId
  const { status, sendMove, pass } = useChessWs({
    token: token ?? '',
    room: roomId,
    onOpponentMove,
  });

  // 5) коллбек твоего хода (пользовательского)
  const onMyMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      console.log('onMyMove', from, to, promotion);
      sendMove(from, to, promotion ?? '');
    },
    [sendMove],
  );

  useEffect(() => {
    return () => {
      resetGame();
      setRoomId(null);
    };
  }, [resetGame, setRoomId]);

  return (
    <HStack justify={'center'} gap={'3rem'}>
      <div className="my-auto flex flex-col">
        <PlayerRow src={botAvatar} name={botName} m={'0 0 10px 0'} />
        <ChessBoardWrapper onMyMove={onMyMove} />
        <PlayerRow m={'10px 0 0 0'} name={'You'} />
      </div>
      <AnalyseToolPlayComputer startGame={startGame} pass={pass} />
    </HStack>
  );
};
