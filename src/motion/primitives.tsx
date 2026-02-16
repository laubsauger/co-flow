import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { springs, staggerItem } from './tokens';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const noMotion = { duration: 0 };

// MotionButton — press feedback on any tappable element
export const MotionButton = forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
>(({ className, ...props }, ref) => {
  const reduced = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={reduced ? noMotion : springs.snappy}
      className={className}
      {...props}
    />
  );
});
MotionButton.displayName = 'MotionButton';

// MotionCard — lift on hover, compress on tap
export const MotionCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ className, ...props }, ref) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      whileHover={
        reduced
          ? undefined
          : { y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }
      }
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={reduced ? noMotion : springs.soft}
      className={className}
      {...props}
    />
  );
});
MotionCard.displayName = 'MotionCard';

// MotionListItem — for use inside a stagger container
export const MotionListItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ className, ...props }, ref) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      variants={reduced ? undefined : staggerItem}
      transition={reduced ? noMotion : springs.soft}
      className={className}
      {...props}
    />
  );
});
MotionListItem.displayName = 'MotionListItem';

// MotionList — stagger container for list items
interface MotionListProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export const MotionList = forwardRef<HTMLDivElement, MotionListProps>(
  ({ className, staggerDelay = 0.05, ...props }, ref) => {
    const reduced = useReducedMotion();
    return (
      <motion.div
        ref={ref}
        initial={reduced ? undefined : 'initial'}
        animate={reduced ? undefined : 'animate'}
        variants={
          reduced
            ? undefined
            : {
                initial: {},
                animate: {
                  transition: {
                    staggerChildren: staggerDelay,
                  },
                },
              }
        }
        className={className}
        {...props}
      />
    );
  }
);
MotionList.displayName = 'MotionList';

// MotionPage — page transition wrapper
export function MotionPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={reduced ? { duration: 0.15 } : springs.soft}
      className={cn('min-h-screen', className)}
    >
      {children}
    </motion.div>
  );
}
