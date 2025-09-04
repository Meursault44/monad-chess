export const makeErrorBadgeDataUrl = (fill = 'rgba(210, 56, 70, 1)') => {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='12' fill='${fill}'/>
    <path d='M8 8l8 8M16 8l-8 8' stroke='white' stroke-width='2' stroke-linecap='round'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

export const makeSuccessBadgeDataUrl = (fill = 'rgba(38, 181, 97, 1)') => {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
    <circle cx='12' cy='12' r='12' fill='${fill}'/>
    <path d='M7 12.5l3.5 3.5L17 9'
      fill='none' stroke='white' stroke-width='2.5'
      stroke-linecap='round' stroke-linejoin='round'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

export const ErrorBadge: React.FC<{ fill?: string; size?: number }> = ({
  fill = 'rgba(210, 56, 70, 1)',
  size = 24,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="12" cy="12" r="12" fill={fill} />
    <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SuccessBadge: React.FC<{ fill?: string; size?: number }> = ({
  fill = 'rgba(38, 181, 97, 1)',
  size = 24,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="12" cy="12" r="12" fill={fill} />
    <path
      d="M7 12.5l3.5 3.5L17 9"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
