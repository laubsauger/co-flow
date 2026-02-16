import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { springs, staggerItem } from './tokens';
import { cn } from '@/lib/utils';

// MotionButton — press feedback on any tappable element
export const MotionButton = forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
>(({ className, ...props }, ref) => (
  <motion.button
    ref={ref}
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.02 }}
    transition={springs.snappy}
    className={className}
    {...props}
  />
));
MotionButton.displayName = 'MotionButton';

// MotionCard — lift on hover, compress on tap
export const MotionCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
    whileTap={{ scale: 0.98 }}
    transition={springs.soft}
    className={className}
    {...props}
  />
));
MotionCard.displayName = 'MotionCard';

// MotionListItem — for use inside a stagger container
export const MotionListItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={staggerItem}
    transition={springs.soft}
    className={className}
    {...props}
  />
));
MotionListItem.displayName = 'MotionListItem';

// MotionList — stagger container for list items
interface MotionListProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export const MotionList = forwardRef<HTMLDivElement, MotionListProps>(
  ({ className, staggerDelay = 0.05, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    />
  )
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={springs.soft}
      className={cn('min-h-screen', className)}
    >
      {children}
    </motion.div>
  );
}
