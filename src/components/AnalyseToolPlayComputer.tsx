import { type FC, useEffect, useMemo } from 'react';
import { useChessStore } from '../store/chess.ts';
import { Button, VStack, Text, HStack, RadioGroup, Image } from '@chakra-ui/react';
import { AnalyseToolWrapper, PlayAsPicker } from '@/components';
import playBotsLogo from '/bots.png';
import { useQuery } from '@tanstack/react-query';
import { getBots } from '@/api/rooms.ts';
import { usePlayBotsStore } from '@/store/playBots.ts';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { useAuthStore } from '@/store/auth.ts';
import { Link } from 'react-router';
import { MovesTablePlain } from '@/components/MovesTablePlain.tsx';

const sideItems = [
  { label: 'White', value: 'w' as const },
  { label: 'Black', value: 'b' as const },
  { label: 'Random', value: null as const },
];

type AnalyseToolType = {
  startGame?: (botId: number) => void;
  pass: () => void;
};

export const AnalyseToolPlayComputer: FC<AnalyseToolType> = ({ startGame, pass }) => {
  const timeline = useChessStore((s) => s.timelineSan);
  const setBotId = usePlayBotsStore((s) => s.setBotId);
  const botId = usePlayBotsStore((s) => s.botId);
  const setBotAvatar = usePlayBotsStore((s) => s.setBotAvatar);
  const setBotName = usePlayBotsStore((s) => s.setBotName);
  const botName = usePlayBotsStore((s) => s.botName);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: botsData, refetch } = useQuery({
    queryKey: ['bots'],
    queryFn: getBots,
  });

  // управление партией (из стора)
  const phase = useChessStore((s) => s.phase); // 'idle' | 'playing' | 'finished'

  const setPlayer = useChessStore((s) => s.setPlayerSide);
  const playerSide = useChessStore((s) => s.playerSide);
  const roomId = useReviewGameStore((s) => s.id);

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
    if (Array.isArray(botsData?.bots) && botId) {
      const bot = botsData?.bots.find((b) => b.id === botId);
      setBotAvatar(bot?.avatar);
      setBotName(bot?.name);
    }
  }, [botId, botsData, setBotAvatar, setBotName]);

  useEffect(() => {
    if (accessToken) {
      refetch();
    }
  }, [accessToken, refetch]);

  return (
    <AnalyseToolWrapper title={'Play Bots'} logoSrc={playBotsLogo}>
      <VStack w={'100%'} h={'100%'} p={'10px'}>
        {phase === 'idle' && (
          <>
            <VStack w={'100%'} overflowY={'scroll'} h={'100%'}>
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
            <VStack align="stretch" p="10px" w={'100%'} height={roomId ? '430px' : '310px'}>
              <PlayAsPicker
                value={playerSide} // 'w' | 'b' | null из стора
                onChange={setPlayer} // просто пишем в zustand
              />
              <VStack justifyContent={'center'}>
                <Button
                  size="sm"
                  colorScheme="purple"
                  onClick={() => {
                    startGame?.(botId);
                  }}
                  bg={'#25232C'}
                  _hover={{
                    backgroundColor: '#4F4372',
                  }}
                  h={'50px'}
                  mx={'10px'}
                  fontSize={'18px'}
                  w={'100%'}
                >
                  Start game
                </Button>
                {roomId && (
                  <Button
                    bg={'#25232C'}
                    _hover={{
                      backgroundColor: '#4F4372',
                    }}
                    h={'50px'}
                    mx={'10px'}
                    fontSize={'18px'}
                    w={'100%'}
                    p={0}
                  >
                    <Link
                      className={'flex h-full w-full items-center justify-center'}
                      to={`/play/computer/review/${roomId}`}
                    >
                      Game Analysis
                    </Link>
                  </Button>
                )}
              </VStack>
            </VStack>
          </>
        )}

        {/* Список ходов */}
        {phase === 'playing' && (
          <VStack width={'100%'} height={'100%'} p={'20px 0'}>
            <MovesTablePlain
              rows={data}
              whiteLabel={playerSide === 'w' ? 'You' : botName}
              blackLabel={playerSide === 'b' ? 'You' : botName}
            />
            {roomId && (
              <Button
                bg={'#25232C'}
                _hover={{
                  backgroundColor: '#4F4372',
                }}
                h={'50px'}
                mx={'10px'}
                fontSize={'18px'}
                w={'100%'}
                onClick={pass}
              >
                Give up
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </AnalyseToolWrapper>
  );
};
