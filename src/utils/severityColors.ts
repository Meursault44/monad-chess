import { type Severity } from '@/components/QualityBadge';

export const severityColor: Record<Severity, string> = {
  brilliant: 'green.500',
  great: 'blue.500',
  inaccuracy: 'yellow.500',
  mistake: 'orange.500',
  blunder: 'red.500',
};
