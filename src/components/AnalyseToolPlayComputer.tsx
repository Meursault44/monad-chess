import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useChessStore } from '../store/chess.ts';
import { Button, VStack, Text, HStack, RadioGroup, Image } from '@chakra-ui/react';
import { AnalyseToolWrapper } from '@/components';
import playBotsLogo from '/bots.png';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getBots, passGame } from '@/api/rooms.ts';
import { usePlayBotsStore } from '@/store/playBots.ts';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { useDialogsStore } from '@/store/dialogs.ts';
import { Link } from 'react-router';

const sideItems = [
  { label: 'White', value: 'w' as const },
  { label: 'Black', value: 'b' as const },
  { label: 'Random', value: 'random' as const },
];

type AnalyseToolType = {
  startGame?: (botId: number) => void;
};

export const AnalyseToolPlayComputer: FC<AnalyseToolType> = ({ startGame }) => {
  const timeline = useChessStore((s) => s.timelineSan);
  const currentPly = useChessStore((s) => s.currentPly);
  const setBotId = usePlayBotsStore((s) => s.setBotId);
  const botId = usePlayBotsStore((s) => s.botId);
  const setBotAvatar = usePlayBotsStore((s) => s.setBotAvatar);

  const { data: botsData } = useQuery({
    queryKey: ['bots'],
    queryFn: getBots,
  });

  const { mutate: mutatePassGame, data: dataPassGame } = useMutation({
    mutationFn: passGame,
  });

  // управление партией (из стора)
  const phase = useChessStore((s) => s.phase); // 'idle' | 'playing' | 'finished'
  const resetGame = useChessStore((s) => s.resetGame); // 'idle' | 'playing' | 'finished'

  const setPlayer = useChessStore((s) => s.setPlayerSide);
  const roomId = useReviewGameStore((s) => s.id);
  const setDialogLoseGame = useDialogsStore((s) => s.setDialogLoseGame);

  const data = useMemo(() => {
    const rows: Array<{
      key: number;
      move: number;
      wMove: string | '';
      bMove: string | '';
      whitePly: number;
      blackPly: number;
    }> = [];
    for (let i = 0; i < timeline.length; i += 2) {
      const row = i / 2;
      rows.push({
        key: row + 1,
        move: row + 1,
        wMove: timeline[i] ?? '',
        bMove: timeline[i + 1] ?? '',
        whitePly: i + 1,
        blackPly: i + 2,
      });
    }
    return rows;
  }, [timeline]);

  useEffect(() => {
    if (dataPassGame?.success) {
      resetGame();
      setDialogLoseGame(true);
    }
  }, [dataPassGame]);

  useEffect(() => {
    if (Array.isArray(botsData?.bots) && botId) {
      const avatar = botsData?.bots.find((b) => b.id === botId)?.avatar;
      setBotAvatar(avatar);
    }
  }, [botId, botsData?.bots, setBotAvatar]);

  return (
    <AnalyseToolWrapper title={'Play Bots'} logoSrc={playBotsLogo}>
      {phase === 'idle' && (
        <>
          <VStack w={'100%'} p={'10px'} overflowY={'scroll'} h={'400px'}>
            {botsData?.bots?.map((bot) => (
              <HStack
                key={bot.id}
                cursor={'pointer'}
                onClick={() => setBotId(bot.id)}
                bg={botId === bot.id ? 'rgba(131, 110, 249, 0.5)' : 'rgba(255, 255, 255, .3)'}
                p={'6px'}
                borderRadius={'10px'}
                boxSizing={'border-box'}
                w={'100%'}
                color={'white'}
                boxShadow={'4 6 10 rgba(0,0,0, 1)'}
              >
                <Image src={bot.avatar} width={'50px'}></Image>
                {bot.name}
              </HStack>
            ))}
          </VStack>
          <VStack align="stretch" p="10px" w={'100%'}>
            {/* ✅ Новый Radio API из Chakra v3 */}
            <RadioGroup.Root
              disabled={phase === 'playing'}
              onValueChange={(e) => {
                const v = e.value as 'w' | 'b' | 'random';
                setPlayer(v);
              }}
            >
              <HStack gap="3">
                {sideItems.map((item) => (
                  <RadioGroup.Item key={item.value} value={item.value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText color={'white'}>{item.label}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </HStack>
            </RadioGroup.Root>

            <Button
              size="sm"
              colorScheme="purple"
              onClick={() => {
                startGame?.(botId);
              }}
              bg={'gray'}
              w={'100%'}
            >
              Start game
            </Button>
            {roomId && (
              <Button bg={'gray'} w={'100%'} p={0}>
                <Link
                  className={'flex h-full w-full items-center justify-center'}
                  to={`/play/computer/review/${roomId}`}
                >
                  Game Analysis
                </Link>
              </Button>
            )}
          </VStack>
        </>
      )}

      {/* Список ходов */}
      {phase === 'playing' && (
        <VStack>
          <div className="flex h-[520px] w-full flex-col overflow-y-auto">
            {data.map((i) => {
              const whiteActive = currentPly === i.whitePly;
              const blackActive = currentPly === i.blackPly;
              return (
                <div key={i.key} className="flex w-full gap-5">
                  <div className="flex w-[30px] shrink-0 grow-0 basis-[13%] justify-center bg-[#5B3F7C] text-[#E8DABD]">
                    {i.move}
                  </div>
                  <div
                    className={`cursor-pointer text-white ${whiteActive ? 'bg-amber-500' : ''} w-[40px] text-center`}
                  >
                    {i.wMove}
                  </div>
                  <div
                    className={`cursor-pointer text-white ${blackActive ? 'bg-amber-500' : ''} w-[40px] text-center`}
                  >
                    {i.bMove}
                  </div>
                </div>
              );
            })}
          </div>
          {roomId && (
            <Button bg={'gray'} w={'100%'} onClick={() => mutatePassGame(roomId)}>
              Give up
            </Button>
          )}
        </VStack>
      )}
    </AnalyseToolWrapper>
  );
};
