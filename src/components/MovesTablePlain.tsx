import * as React from 'react';
import { Box, Table, Text } from '@chakra-ui/react';

export type MoveRowInput = {
  key: number;
  move: number; // номер хода (1,2,3…)
  wMove?: string; // ход белых (SAN/строка)
  bMove?: string; // ход чёрных (SAN/строка)
  whitePly?: number; // полуход белых (1,3,5…)
  blackPly?: number; // полуход чёрных (2,4,6…)
};

type Props = {
  rows: MoveRowInput[];
  whiteLabel?: string;
  blackLabel?: string;
  maxH?: string | number; // высота прокрутки
};

export const MovesTablePlain: React.FC<Props> = ({
  rows,
  whiteLabel = 'White',
  blackLabel = 'Black',
  maxH = '70vh',
}) => {
  // аккуратно отсортируем по номеру хода
  const sorted = React.useMemo(
    () => [...(rows ?? [])].sort((a, b) => (a.move ?? 0) - (b.move ?? 0)),
    [rows],
  );

  return (
    <Box maxH={maxH} overflowY="auto" h={'100%'}>
      <Table.Root size="sm" variant="line" stickyHeader tableLayout="fixed" w="full">
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
          {sorted.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <Text color="gray.400">there are no moves yet</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            sorted.map((r) => (
              <Table.Row key={r.key ?? r.move}>
                <Table.Cell
                  w="56px"
                  minW="56px"
                  maxW="56px"
                  textAlign="center"
                  fontWeight="semibold"
                >
                  {r.move}
                </Table.Cell>
                <Table.Cell>{r.wMove ?? '—'}</Table.Cell>
                <Table.Cell>{r.bMove ?? '—'}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
