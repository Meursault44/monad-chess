import { useToken } from '@chakra-ui/react';

export type Severity = 'brilliant' | 'great' | 'inaccuracy' | 'mistake' | 'blunder';

const severityColor: Record<Severity, string> = {
  brilliant: 'green.500',
  great: 'blue.500',
  inaccuracy: 'yellow.500',
  mistake: 'orange.500',
  blunder: 'red.500',
};

export function QualityBadge({ severity, size = 24 }: { severity: Severity; size?: number }) {
  // превращаем токен (например, "green.400") в итоговый цвет из темы
  const [tone] = useToken('colors', [severityColor[severity]]);
  const s = { w: size, h: size };

  switch (severity) {
    case 'brilliant':
      return (
        <svg viewBox="0 0 24 24" width={s.w} height={s.h} aria-label="Brilliant">
          {/* бриллиант, цвет из токена */}
          <path
            d="M12 2 L21 9.5 L12 22 L3 9.5 Z"
            fill={tone}
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="1.25"
          />
          {/* белая звезда внутри */}
          <path
            d="M12 6.8l1.3 2.7 3 .2-2.3 1.9.8 2.9-2.8-1.6-2.8 1.6.8-2.9-2.3-1.9 3-.2z"
            fill="#fff"
            opacity="0.95"
          />
        </svg>
      );

    case 'great':
      return (
        <svg viewBox="0 0 24 24" width={s.w} height={s.h} aria-label="Great">
          <circle cx="12" cy="12" r="10" fill={tone} />
          <path
            d="M7.5 12.2l3.1 3.0 5.9-6.2"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'inaccuracy':
      return (
        <svg viewBox="0 0 24 24" width={s.w} height={s.h} aria-label="Inaccuracy">
          <circle cx="12" cy="12" r="10" fill={tone} />
          {/* классический "!" */}
          <rect x="11" y="6.0" width="2" height="7.6" rx="1" fill="#2a2a2a" />
          <rect x="11" y="15.8" width="2" height="2.2" rx="1" fill="#2a2a2a" />
        </svg>
      );

    case 'mistake': {
      const sw = Math.max(3, (size / 24) * 3.6);

      return (
        <svg viewBox="0 0 24 24" width={s.w} height={s.h} aria-label="Mistake">
          {/* круг-бейдж цветом из константы */}
          <circle cx="12" cy="12" r="10" fill={tone} />

          {/* жирный белый вопросительный знак (вектором) */}
          <path
            d="
          M 8.4 9.1
          C 8.7 6.9 10.6 5.6 12.8 5.6
          C 15.1 5.6 16.9 6.9 16.9 8.8
          C 16.9 10.3 15.9 11.3 14.4 12.2
          C 12.8 13.2 12 14.0 12 15.6
          V 16.4
        "
            fill="none"
            stroke="#fff"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="18.2" r={sw * 0.55} fill="#fff" />
        </svg>
      );
    }

    case 'blunder':
      return (
        <svg viewBox="0 0 24 24" width={s.w} height={s.h} aria-label="Blunder">
          <circle cx="12" cy="12" r="10" fill={tone} />
          <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
