import type { Transition } from 'framer-motion';

// Spring presets
export const springs = {
  soft: { type: 'spring', stiffness: 200, damping: 30 } as Transition,
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  heavy: { type: 'spring', stiffness: 300, damping: 40 } as Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 25, mass: 0.8 } as Transition,
};

// Duration presets (seconds)
export const durations = {
  micro: 0.1,
  short: 0.2,
  medium: 0.35,
};

// Easing presets
export const eases = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1] as [number, number, number, number],
  decelerate: [0, 0, 0, 1] as [number, number, number, number],
};

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Stagger children config
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};
