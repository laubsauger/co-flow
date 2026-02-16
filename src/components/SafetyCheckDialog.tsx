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
import { AlertTriangle } from 'lucide-react';

interface SafetyCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contraindications: string[];
  onConfirm: () => void;
}

export function SafetyCheckDialog({
  open,
  onOpenChange,
  contraindications,
  onConfirm,
}: SafetyCheckDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Safety Notice
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                This session includes gestures with the following
                considerations:
              </p>
              <ul className="text-sm text-destructive/80 space-y-1 pl-1">
                {contraindications.map((c) => (
                  <li key={c}>- {c}</li>
                ))}
              </ul>
              <p>
                Please ensure these do not apply to you before proceeding.
              </p>
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
