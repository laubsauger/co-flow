import { useState, useCallback } from 'react';
import type { PlayerStep } from '@/lib/types/player';

/**
 * Hook for pre-session safety check.
 * Returns `checkAndPlay` which either plays immediately (no contraindications)
 * or sets state to show the safety dialog first.
 */
export function useSafetyCheck() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    steps: PlayerStep[];
    onConfirm: () => void;
  } | null>(null);

  const checkAndPlay = useCallback((steps: PlayerStep[], onConfirm: () => void) => {
    const hasContraindications = steps.some(
      (s) => s.gesture.contraindications && s.gesture.contraindications.length > 0
    );

    if (hasContraindications) {
      setPendingAction({ steps, onConfirm });
      setDialogOpen(true);
    } else {
      onConfirm();
    }
  }, []);

  const handleConfirm = useCallback(() => {
    pendingAction?.onConfirm();
    setDialogOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  const handleOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setPendingAction(null);
  }, []);

  return {
    checkAndPlay,
    dialogOpen,
    dialogSteps: pendingAction?.steps ?? [],
    handleConfirm,
    handleOpenChange,
  };
}
