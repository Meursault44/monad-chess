import React from 'react';
import { motion } from 'motion/react';

const loadingContainer: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
};

const loadingCircle: React.CSSProperties = {
  display: 'block',
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '0.25rem',
};

type ThreeDotsWaveType = {
  bgColor?: string;
};

export const ThreeDotsWave: React.FC<ThreeDotsWaveType> = ({ bgColor = 'black' }) => {
  const dots = [0, 1, 2];

  return (
    <div style={loadingContainer}>
      {dots.map((i) => (
        <motion.span
          key={i}
          style={{ ...loadingCircle, backgroundColor: bgColor }}
          initial={{ y: '0%' }}
          animate={{ y: ['0%', '100%'] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};
