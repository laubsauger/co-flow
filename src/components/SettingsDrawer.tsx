import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useUserData, type ThemeMode } from '@/lib/stores/user-data';
import { useInstallPrompt } from '@/lib/hooks/use-install-prompt';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, Eye, Info, Sun, Moon, Monitor, Download, Share } from 'lucide-react';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'system', icon: Monitor, label: 'System' },
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
];

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const { reducedMotion, toggleReducedMotion, themeMode, setThemeMode } =
    useUserData();
  const { canPrompt, triggerInstall, isIOS, isStandalone } = useInstallPrompt();
  const showInstall = !isStandalone && (canPrompt || isIOS);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Preferences and safety information</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-6">
          {/* Theme */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Appearance
            </h3>
            <div className="flex gap-2">
              {themeOptions.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors',
                    themeMode === mode
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Accessibility */}
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
                  'relative h-6 w-11 rounded-full transition-colors flex-shrink-0',
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

          {/* Install App */}
          {showInstall && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install App
              </h3>
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {isIOS
                    ? 'Add Co-Flow to your home screen for quick access and offline use.'
                    : 'Install Co-Flow for quick access and offline use.'}
                </p>
                {isIOS ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    Tap <Share className="w-3.5 h-3.5 inline-block" /> then
                    &quot;Add to Home Screen&quot;
                  </p>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      await triggerInstall();
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Install Co-Flow
                  </Button>
                )}
              </div>
            </section>
          )}

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
                This app is <strong className="text-foreground">not a substitute</strong> for professional
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
                Your gentle guide to massage & bodywork
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
