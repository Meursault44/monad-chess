// src/pages/ProfilePage.tsx
import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Heading,
  HStack,
  VStack,
  Text,
  Card,
  Stat,
  Table,
  Badge,
  Separator,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { animate } from 'motion';

import { getProfilePuzzles, getProfileExperience, getProfileGames } from '@/api/profile';
import { getLeaderboard } from '@/api/leaderboard';

// ---------- helpers ----------
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

const resultBadge = (r?: string) => {
  const v = (r || '').toLowerCase();
  if (v === '1-0' || v === 'win' || v === 'w') return <Badge colorPalette="green">Win</Badge>;
  if (v === '0-1' || v === 'loss' || v === 'l') return <Badge colorPalette="red">Loss</Badge>;
  if (v === '1/2-1/2' || v === 'draw' || v === 'd')
    return <Badge colorPalette="yellow">Draw</Badge>;
  return <Badge>{r ?? '—'}</Badge>;
};

// лёгкая hover-анимация (motion one)
function HoverLift({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onEnter = () =>
    ref.current &&
    animate(ref.current, { transform: ['translateY(0)', 'translateY(-3px)'] }, { duration: 0.22 });

  const onLeave = () =>
    ref.current &&
    animate(ref.current, { transform: ['translateY(-3px)', 'translateY(0)'] }, { duration: 0.22 });

  return (
    <Box
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ willChange: 'transform' }}
    >
      {children}
    </Box>
  );
}

export const ProfilePage = () => {
  const { data: puzzlesData, isLoading: puzzlesLoading } = useQuery({
    queryKey: ['ProfilePuzzles'],
    queryFn: getProfilePuzzles,
  });

  const { data: expData, isLoading: expLoading } = useQuery({
    queryKey: ['ProfileExperience'],
    queryFn: getProfileExperience,
  });

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['ProfileGames'],
    queryFn: getProfileGames,
  });

  const { data: lbData, isLoading: lbLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  // -------- summary --------
  const totalXP = expData?.experience?.total ?? 0;
  const xpSubmitted = expData?.experience?.submitted ?? 0;
  const xpUnsubmitted = expData?.experience?.unsubmitted ?? 0;
  const puzzlesSolved = Array.isArray(puzzlesData?.puzzles) ? puzzlesData!.puzzles.length : 0;
  const gamesCount = Array.isArray(gamesData?.games) ? gamesData!.games.length : 0;

  // -------- XP chart series (submitted only) --------
  const xpSeries = useMemo(() => {
    const recs: Array<{ createdAt: string; amount: number; submitted?: boolean }> =
      expData?.experience?.records ?? [];
    const sorted = [...recs]
      .filter((r) => r?.submitted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let acc = 0;
    return sorted.map((r) => {
      acc += Number(r.amount || 0);
      return { date: new Date(r.createdAt).toLocaleDateString(), xp: acc };
    });
  }, [expData]);

  const xpChartData = useMemo(() => {
    if (xpSeries.length === 1) {
      const d0 = new Date(xpSeries[0].date);
      const dPrev = new Date(d0.getTime() - 24 * 60 * 60 * 1000);
      return [{ date: dPrev.toLocaleDateString(), xp: 0 }, xpSeries[0]];
    }
    return xpSeries;
  }, [xpSeries]);

  // -------- tables --------
  const gameRows = useMemo(() => {
    const arr: any[] = Array.isArray(gamesData?.games) ? gamesData!.games : [];
    return arr.map((g) => {
      const color = g?.color ?? '—';
      const res = g?.result ?? '—';
      const reason = g?.reason ?? '—';
      const createdAt = g?.createdAt;
      const white = g?.game?.white ?? '—';
      const black = g?.game?.black ?? '—';
      const opponent = (color === 'white' ? black : white) ?? g?.enemy ?? g?.bot ?? '—';

      return { created: fmtDate(createdAt), color, res, reason, opponent };
    });
  }, [gamesData]);

  const puzzleRows = useMemo(() => {
    const arr: any[] = Array.isArray(puzzlesData?.puzzles) ? puzzlesData!.puzzles : [];
    return arr.map((p) => {
      const rating = p?.puzzle?.rating ?? '—';
      const lichess = p?.puzzle?.lichessId ?? '—';
      const themes: string[] = p?.puzzle?.themes ?? [];
      const created = fmtDate(p?.createdAt);
      return { rating, lichess, created, themes };
    });
  }, [puzzlesData]);

  const leaderboard = useMemo(() => {
    const arr: any[] = Array.isArray(lbData?.leaderboard) ? lbData!.leaderboard : [];
    return arr
      .map((x, idx) => ({
        place: idx + 1,
        userId: x?.userId ?? x?.user_id ?? '—',
        username: x?.username ?? '—',
        totalXp: Number(x?.totalXp ?? x?.total_xp ?? 0),
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((x, i) => ({ ...x, place: i + 1 }));
  }, [lbData]);

  const loading = puzzlesLoading || expLoading || gamesLoading || lbLoading;

  return (
    <VStack align="stretch" gap="5" px="6" py="4">
      <Heading color={'white'} size="lg">Profile</Heading>

      {/* Summary cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }} gap="4">
        {[
          {
            label: 'Total XP',
            value: totalXP,
            help: `Submitted: ${xpSubmitted} • Pending: ${xpUnsubmitted}`,
          },
          { label: 'Puzzles Solved', value: puzzlesSolved, help: 'Across all ratings' },
          { label: 'Games Played', value: gamesCount, help: 'Vs bots & players' },
          { label: 'Leaderboard Size', value: leaderboard.length, help: 'Monad Games ID' },
        ].map((c) => (
          <HoverLift key={c.label}>
            <Card.Root>
              <Card.Header>
                <Stat.Root>
                  <Stat.Label>{c.label}</Stat.Label>
                  <Stat.ValueText fontSize="2xl">{c.value}</Stat.ValueText>
                  <Stat.HelpText>{c.help}</Stat.HelpText>
                </Stat.Root>
              </Card.Header>
            </Card.Root>
          </HoverLift>
        ))}
      </Grid>

      {/* XP chart */}
      <Card.Root background={'#1a1b1f'}>
        <Card.Header pb="0">
          <HStack justify="space-between">
            <Heading size="md">XP Progress</Heading>
            <Text fontSize="sm">Cumulative (submitted records)</Text>
          </HStack>
        </Card.Header>
        <Card.Body pt="4">
          {xpChartData.length === 0 ? (
            <Text>No XP records yet.</Text>
          ) : (
            <Box w="100%" h="280px" minW="0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpChartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid />
                  <XAxis
                    dataKey="date"
                    minTickGap={12}
                    interval="preserveStartEnd"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <ReTooltip />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#836ef9"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      <Grid templateColumns={{ base: '1fr', xl: '1.3fr 0.7fr' }} gap="5">
        {/* Games */}
        <Card.Root background={'#1a1b1f'}>
          <Card.Header>
            <Heading size="md">Game History</Heading>
          </Card.Header>
          <Card.Body minW="0" pt="0">
            <Box h="420px" overflowY="auto">
              <Table.Root size="sm" variant="line" stickyHeader tableLayout="fixed" w="full">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader w="160px">Date</Table.ColumnHeader>
                    <Table.ColumnHeader w="90px">Color</Table.ColumnHeader>
                    <Table.ColumnHeader w="110px">Result</Table.ColumnHeader>
                    <Table.ColumnHeader>Opponent</Table.ColumnHeader>
                    <Table.ColumnHeader>Reason</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {gameRows.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        <Text>No games yet.</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    gameRows.map((g, idx) => (
                      <Table.Row key={idx}>
                        <Table.Cell>{g.created}</Table.Cell>
                        <Table.Cell textTransform="capitalize">{g.color}</Table.Cell>
                        <Table.Cell>{resultBadge(g.res)}</Table.Cell>
                        <Table.Cell>{g.opponent}</Table.Cell>
                        <Table.Cell>{g.reason}</Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
        </Card.Root>

        {/* Leaderboard */}
        <Card.Root background={'#1a1b1f'}>
          <Card.Header>
            <Heading size="md">Leaderboard (Monad Games ID)</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm" variant="line" stickyHeader>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader w="64px">#</Table.ColumnHeader>
                  <Table.ColumnHeader>User</Table.ColumnHeader>
                  <Table.ColumnHeader w="110px" textAlign="right">
                    XP
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {leaderboard.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={3}>
                      <Text>No leaderboard data.</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  leaderboard.map((r) => (
                    <Table.Row key={`${r.userId}-${r.place}`}>
                      <Table.Cell>{r.place}</Table.Cell>
                      <Table.Cell>{r.username}</Table.Cell>
                      <Table.Cell textAlign="right">{r.totalXp}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Puzzles */}
      <Card.Root background={'#1a1b1f'}>
        <Card.Header>
          <Heading size="md">Puzzles Solved</Heading>
        </Card.Header>
        <Card.Body>
          <Table.Root size="sm" variant="line" stickyHeader>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader w="160px">Date</Table.ColumnHeader>
                <Table.ColumnHeader w="120px">Rating</Table.ColumnHeader>
                <Table.ColumnHeader w="140px">Lichess ID</Table.ColumnHeader>
                <Table.ColumnHeader>Themes</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {puzzleRows.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <Text>No puzzles solved yet.</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                puzzleRows.map((p, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell>{p.created}</Table.Cell>
                    <Table.Cell>{p.rating}</Table.Cell>
                    <Table.Cell>{p.lichess}</Table.Cell>
                    <Table.Cell>
                      <HStack wrap="wrap" gap="1.5">
                        {(p.themes ?? []).map((t: string) => (
                          <Badge key={t} colorPalette="purple" variant="surface">
                            {t}
                          </Badge>
                        ))}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>

      {loading && (
        <>
          <Separator />
          <Text fontSize="sm">Loading latest profile data…</Text>
        </>
      )}
    </VStack>
  );
};
