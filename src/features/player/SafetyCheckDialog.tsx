import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PlayerStep } from '@/lib/types/player';

interface SafetyCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: PlayerStep[];
  onConfirm: () => void;
}

/**
 * Pre-session safety check dialog.
 * Shows aggregated contraindications from all gestures in the flow.
 * Use with `useSafetyCheck()` hook from `./hooks/use-safety-check`.
 */
export function SafetyCheckDialog({ open, onOpenChange, steps, onConfirm }: SafetyCheckDialogProps) {
  const contraindications = useMemo(() => {
    const set = new Set<string>();
    for (const step of steps) {
      step.gesture.contraindications?.forEach((c) => set.add(c));
    }
    return Array.from(set);
  }, [steps]);

  if (contraindications.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Safety Considerations
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="mb-3">
                This session includes gestures with the following considerations:
              </p>
              <ul className="space-y-1.5 text-sm">
                {contraindications.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">-</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            I Understand, Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
