import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useUserData } from '@/lib/stores/user-data';
import { cn } from '@/lib/utils';
import { Shield, Eye, Info } from 'lucide-react';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const { reducedMotion, toggleReducedMotion } = useUserData();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Preferences and safety information</SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-6">
          {/* Preferences */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Accessibility
            </h3>
            <label className="flex items-center justify-between rounded-lg border p-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium">Reduced motion</p>
                <p className="text-xs text-muted-foreground">
                  Minimize animations throughout the app
                </p>
              </div>
              <button
                role="switch"
                aria-checked={reducedMotion}
                onClick={toggleReducedMotion}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  reducedMotion ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <span
                  className={cn(
                    'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    reducedMotion ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </label>
          </section>

          {/* Safety Disclaimers */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Safety Information
            </h3>
            <div className="rounded-lg border bg-secondary/30 p-4 space-y-3 text-sm text-muted-foreground">
              <p>
                Co-Flow provides guided massage and bodywork sequences for
                educational and self-care purposes only.
              </p>
              <p>
                This app is <strong>not a substitute</strong> for professional
                medical advice, diagnosis, or treatment. Always consult a
                qualified healthcare provider before beginning any new
                bodywork practice.
              </p>
              <p>
                Pay attention to contraindication warnings displayed on
                individual gestures and flows. If you experience pain,
                discomfort, or adverse reactions, stop immediately and seek
                professional guidance.
              </p>
              <p>
                Certain techniques may not be appropriate for individuals
                with specific medical conditions, injuries, or during
                pregnancy. When in doubt, consult your healthcare provider.
              </p>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              About
            </h3>
            <div className="rounded-lg border p-4 space-y-1 text-sm">
              <p className="font-medium">Co-Flow</p>
              <p className="text-muted-foreground">
                Guided massage coaching companion
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
