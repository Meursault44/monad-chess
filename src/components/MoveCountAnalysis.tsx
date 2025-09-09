import { type FC, useEffect, useMemo, useState } from 'react';
import { useReviewGameStore } from '@/store/reviewGame.ts';
import { useQuery } from '@tanstack/react-query';
import { getAnalyzeGame } from '@/api/rooms.ts';
import { HStack, VStack, Text, Box } from '@chakra-ui/react';
import { QualityBadge } from '@/components/QualityBadge.tsx';
import { severityColor } from '@/utils/severityColors.ts';
import { motion, useAnimate } from 'motion/react';
import { stagger } from 'motion';
import { ThreeDotsWave } from '@/components/ThreeDotsWave.tsx';

type Severity = 'brilliant' | 'great' | 'inaccuracy' | 'mistake' | 'blunder';

const ORDER: Severity[] = ['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder'];

export const MoveCountAnalysis: FC = () => {
  const roomId = useReviewGameStore((s) => s.id);

  const { data, isFetching } = useQuery({
    queryKey: ['analyze', roomId],
    queryFn: ({ queryKey }) => getAnalyzeGame(queryKey[1] as string),
    enabled: !!roomId,
  });

  // motion
  const [scope, animate] = useAnimate();

  // считаем количества по severity
  const counts = useMemo(() => {
    const base: Record<Severity, number> = {
      brilliant: 0,
      great: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    };
    const list = data?.analyses ?? [];
    for (const a of list) {
      const sev = a.severity as Severity;
      if (sev in base) base[sev] += 1;
    }
    return base;
  }, [data]);

  // основной сценарий анимации после получения данных
  useEffect(() => {
    if (!data?.analyses || isFetching) return;
    const root = scope.current as HTMLElement | null;
    if (!root) return;

    // жёстко сбрасываем начальные стили, чтобы анимация всегда стартовала корректно
    animate('.badge', { opacity: 0, transform: 'translateY(8px) scale(0.98)' }, { duration: 0 });
    animate('.badge .ripple', { opacity: 0, scale: 0.85 }, { duration: 0 });
    animate(root, { opacity: 0, transform: 'translateY(6px) scale(0.99)' }, { duration: 0 });

    // последовательность: контейнер -> по очереди бейджи -> параллельно ripple
    (async () => {
      const seq: any[] = [
        [
          root,
          { opacity: [0, 1], transform: ['translateY(6px) scale(0.99)', 'none'] },
          { duration: 0.22, easing: 'ease-out' },
        ],
        [
          '.badge',
          { opacity: 1, transform: 'none' },
          { duration: 0.28, easing: 'ease-out', delay: stagger(0.2), at: '-0.05' },
        ],
        [
          '.badge .ripple',
          { opacity: [0.35, 0], scale: [0.85, 2] },
          { duration: 0.6, easing: 'ease-out', delay: stagger(0.2), at: '<' },
        ],
      ];
      const controls = animate(seq);
      await controls.finished;
    })();
  }, [data?.analyses, isFetching, animate, scope]);

  // загрузка — просто бейджи без счётчиков
  if (isFetching || !data?.analyses) {
    return <ThreeDotsWave />;
  }

  // данные есть — отображаем с анимацией
  return (
    <HStack ref={scope} as={motion.div} gap="30px">
      {ORDER.map((s) => (
        <VStack
          key={s}
          className="badge"
          // оставляем скрытыми до старта последовательности
          style={{ opacity: 0 }}
          position="relative"
          alignItems="flex-start"
        >
          <HStack position="relative">
            <Box position="relative">
              <QualityBadge severity={s} />
              {/* ripple круг поверх бейджа */}
              <motion.span
                className="ripple"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 9999,
                  border: `2px solid ${severityColor[s]}`,
                  opacity: 0,
                  scale: 0.85,
                  pointerEvents: 'none',
                }}
              />
            </Box>

            <Text color={severityColor[s]} fontSize="16px" fontWeight="bold" lineHeight="1">
              {counts[s]}
            </Text>
          </HStack>

          <Text color={severityColor[s]} fontSize="14px" fontWeight={500} lineHeight="1">
            {s}
          </Text>
        </VStack>
      ))}
    </HStack>
  );
};
