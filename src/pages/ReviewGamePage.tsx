// ReviewGamePage.tsx
import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getAnalyzeGame } from '@/api/rooms.ts';
import { AnalyseToolWrapper, PlayerRow, Assistant } from '@/components';
import ChessBoardWrapper from '@/components/ChessBoardWrapper.tsx';
import { useChessStore } from '@/store/chess';
import type { AnalysesType } from '@/store/reviewGame.ts';
import { Image, VStack } from '@chakra-ui/react';
import { wP, bP, wN, bN, wB, bB, wK, bK, wR, bR, bQ, wQ } from '@/assets/pieces';
import type { PieceSymbol } from 'chess.js';
import { QualityBadge, type Severity } from '@/components/QualityBadge';

const piecesSrc = {
  b: {
    p: bP,
    n: bN,
    b: bB,
    r: bR,
    q: bQ,
    k: bK,
  },
  w: {
    p: wP,
    n: wN,
    b: wB,
    r: wR,
    q: wQ,
    k: wK,
  },
};

const getPieceSrc = (side?: 'white' | 'black', piece?: PieceSymbol): string | undefined => {
  if (!side || !piece) return undefined;
  const key = side[0] as 'w' | 'b'; // 'w' | 'b'
  return piecesSrc[key]?.[piece];
};

import { Box, Button, HStack, Table, Text } from '@chakra-ui/react';

// ---------------- Helpers ----------------
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

type Promo = 'q' | 'r' | 'b' | 'n';

// цвета токенов для «бейдж-иконок»
const severityColor: Record<Severity, string> = {
  brilliant: 'green.500',
  great: 'blue.500',
  inaccuracy: 'yellow.500',
  mistake: 'orange.500',
  blunder: 'red.500',
};

// UCI вида e2e4, e7e8q
const UCI_RE = /^[a-h][1-8][a-h][1-8]([qrbn])?$/i;

// парсим UCI и выставляем promotion ТОЛЬКО если реально промо (7->8, 2->1)
function parseUciSmart(uci: string): { from: string; to: string; promotion?: Promo } | null {
  if (!UCI_RE.test(uci)) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promo = (uci[4]?.toLowerCase() as Promo | undefined) ?? undefined;

  const fromRank = from[1];
  const toRank = to[1];
  const looksLikePromotion =
    (fromRank === '7' && toRank === '8') || (fromRank === '2' && toRank === '1');

  return looksLikePromotion ? { from, to, promotion: promo ?? 'q' } : { from, to };
}

// применяем ход: если он UCI — как объект, иначе как SAN; пробуем с/без промо
function applySmart(applyMove: (arg: any) => { san: string } | null, move: string): boolean {
  const uciParsed = parseUciSmart(move);
  if (uciParsed) {
    // 1) как рассчитали
    let res = applyMove(uciParsed);
    if (res) return true;

    // 2) fallback: противоположный вариант с/без промо
    if ('promotion' in uciParsed && uciParsed.promotion) {
      const { promotion: _p, ...noPromo } = uciParsed;
      res = applyMove(noPromo);
      if (res) return true;
    } else {
      res = applyMove({ ...uciParsed, promotion: 'q' as Promo });
      if (res) return true;
    }

    // 3) крайний шанс — как строку (вдруг это SAN)
    res = applyMove(move);
    return !!res;
  }

  // SAN
  const res = applyMove(move);
  return !!res;
}

// ячейка хода со «значком качества» СЛЕВА от текста, как на chess.com
function MoveCell({
  label,
  severity,
  onClick,
  active,
  piece,
  isPawn,
}: {
  label?: string;
  severity?: Severity;
  onClick?: () => void;
  active?: boolean;
  piece?: string;
  isPawn?: boolean;
}) {
  if (!label) return <Text color="gray.400">—</Text>;

  return (
    <HStack
      gap="0.4rem"
      cursor="pointer"
      onClick={onClick}
      bg={active ? 'rgba(131,110,249,0.7)' : 'transparent'}
      borderRadius="md"
      px="1.5"
      py="0.5"
      transition="background 0.15s"
      _hover={{ bg: active ? 'rgba(131,110,249,0.7)' : 'rgba(131,110,249,0.4)' }}
      align="center"
    >
      {severity && (
        <Box w="24px" h="24px" flexShrink={0}>
          <QualityBadge severity={severity} />
        </Box>
      )}

      {piece && (
        <Image src={piece} alt="piece" boxSize={isPawn ? '40px' : '50px'} objectFit="contain" />
      )}

      {/* цвет текста можно оставить прежним */}
      <Text
        fontWeight="medium"
        color={!severity || severity === 'great' ? 'white' : severityColor[severity!]}
      >
        {label}
      </Text>
    </HStack>
  );
}

// ---------------- Page ----------------
export const ReviewGamePage = () => {
  const { id } = useParams<{ id: string }>();

  // store
  const startFromFen = useChessStore((s) => s.startFromFen);
  const resetGame = useChessStore((s) => s.resetGame);
  const applyMove = useChessStore((s) => s.applyMove);
  const goToPly = useChessStore((s) => s.goToPly);
  const currentPly = useChessStore((s) => s.currentPly);
  const totalPly = useChessStore((s) => s.timelineSan.length);

  // загрузка анализа
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyze', id],
    queryFn: ({ queryKey }) => getAnalyzeGame(queryKey[1] as string),
    enabled: !!id,
  });

  // полуходы анализа
  const analyses: AnalysesType[] = useMemo(
    () => (Array.isArray(data?.analyses) ? (data!.analyses as AnalysesType[]) : []),
    [data],
  );

  // подписи игроков в заголовках
  const whiteLabel = useMemo(() => {
    const name = (data as any)?.game?.white ?? 'White';
    return `White - ${name}`;
  }, [data]);

  const blackLabel = useMemo(() => {
    const name = (data as any)?.game?.black ?? 'Black';
    return `Black - ${name}`;
  }, [data]);

  // кто ходит первым (по fenBefore первого полухода)
  const startsWithBlack = useMemo(() => {
    const fenBefore = analyses[0]?.fenBefore;
    if (!fenBefore) return false;
    const turn = fenBefore.split(' ')[1]; // "... w ..." | "... b ..."
    return turn === 'b';
  }, [analyses]);

  // гидрация стора один раз
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!analyses.length || hydratedRef.current) return;

    const baseFen = (data as any)?.initialFen || analyses[0]?.fenBefore || START_FEN;

    startFromFen(baseFen);

    for (const it of analyses) {
      const ok = applySmart(applyMove, it.move);
      if (!ok) break;
    }

    hydratedRef.current = true;
    goToPly(analyses.length > 0 ? 1 : 0);
    return () => {
      resetGame();
    };
  }, [analyses, data, startFromFen, applyMove, goToPly]);

  // строки таблицы: белые всегда слева, чёрные справа
  const rows = useMemo(() => {
    type Row = {
      num: number;
      wLabel?: string;
      wSeverity?: Severity;
      bLabel?: string;
      bSeverity?: Severity;
      wPly?: number;
      bPly?: number;
      wPiece?: string;
      bPiece?: string;
      wIsPawn?: boolean;
      bIsPawn?: boolean;
    };

    const res: Row[] = [];
    for (let i = 0; i < analyses.length; i += 2) {
      const whiteIdx = startsWithBlack ? i + 1 : i;
      const blackIdx = startsWithBlack ? i : i + 1;

      const w = analyses[whiteIdx];
      const b = analyses[blackIdx];

      res.push({
        num: Math.floor(i / 2) + 1,
        wLabel: w?.move,
        wSeverity: w?.severity as Severity | undefined,
        bLabel: b?.move,
        bSeverity: b?.severity as Severity | undefined,
        wPly: w ? whiteIdx + 1 : undefined,
        bPly: b ? blackIdx + 1 : undefined,
        wPiece: getPieceSrc(w?.side, w?.piece),
        bPiece: getPieceSrc(b?.side, b?.piece),
        wIsPawn: w?.piece === 'p',
        bIsPawn: b?.piece === 'p',
      });
    }
    return res;
  }, [analyses, startsWithBlack]);

  // доступность кнопок
  const canPrev = currentPly > 0;
  const canNext = currentPly < totalPly;

  // -------- Render --------
  if (isLoading) {
    return (
      <HStack justify="center" minH="60vh">
        <Text>Загрузка…</Text>
      </HStack>
    );
  }

  if (error) {
    return (
      <HStack justify="center" minH="60vh">
        <Text color="red.500">Ошибка загрузки анализа</Text>
      </HStack>
    );
  }

  return (
    <HStack justify="center" gap="3rem" align="flex-start">
      {/* Левая колонка: доска + навигация */}
      <Box display="flex" flexDir="column">
        <PlayerRow
          m={'0 0 10px 0'}
          src={data?.room?.bot?.avatar}
          name={data?.room?.bot?.name || 'Bot'}
        />
        <ChessBoardWrapper />
        <PlayerRow m={'10px 0 0 0'} name={data?.room?.name || 'You'} />
      </Box>

      {/* Правая колонка: таблица анализа */}
      <AnalyseToolWrapper title="Analysis" logoSrc="/bots.png">
        <VStack h={'100%'} overflow={'hidden'} gap={'1.5rem'} p={'1.5rem 0'}>
          <Assistant message={analyses?.[currentPly - 1]?.llmShort} minHeight={'100px'} />
          <Box maxH="70vh" overflowY="auto">
            <Table.Root size="sm" variant="line" stickyHeader tableLayout="fixed">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader w="56px" minW="56px" maxW="56px" textAlign="center">
                    №
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>{whiteLabel}</Table.ColumnHeader>
                  <Table.ColumnHeader>{blackLabel}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((r) => (
                  <Table.Row key={r.num}>
                    <Table.Cell
                      w="56px"
                      minW="56px"
                      maxW="56px"
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      {r.num}
                    </Table.Cell>

                    <Table.Cell>
                      <MoveCell
                        label={r.wLabel}
                        severity={r.wSeverity}
                        onClick={() => r.wPly && goToPly(r.wPly)}
                        active={r.wPly === currentPly}
                        piece={r.wPiece}
                        isPawn={r.wIsPawn}
                      />
                    </Table.Cell>

                    <Table.Cell>
                      <MoveCell
                        label={r.bLabel}
                        severity={r.bSeverity}
                        onClick={() => r.bPly && goToPly(r.bPly)}
                        active={r.bPly === currentPly}
                        piece={r.bPiece}
                        isPawn={r.bIsPawn}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
          <HStack w={'100%'} justifyContent={'center'}>
            <Button
              bg={'#25232C'}
              _hover={{
                backgroundColor: '#4F4372',
              }}
              w={'40%'}
              onClick={() => goToPly(Math.max(0, currentPly - 1))}
              isDisabled={!canPrev}
            >
              ← Prev
            </Button>
            <Button
              bg={'#25232C'}
              w={'40%'}
              _hover={{
                backgroundColor: '#4F4372',
              }}
              onClick={() => goToPly(Math.min(totalPly, currentPly + 1))}
              isDisabled={!canNext}
            >
              Next →
            </Button>
          </HStack>
        </VStack>
      </AnalyseToolWrapper>
    </HStack>
  );
};
