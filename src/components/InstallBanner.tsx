import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Share, Download } from 'lucide-react';
import { springs } from '@/motion/tokens';
import { useUserData } from '@/lib/stores/user-data';
import { useInstallPrompt } from '@/lib/hooks/use-install-prompt';

export function InstallBanner() {
  const hasCompletedSession = useUserData((s) => s.hasCompletedSession);
  const installBannerDismissed = useUserData((s) => s.installBannerDismissed);
  const dismissInstallBanner = useUserData((s) => s.dismissInstallBanner);

  const { canPrompt, triggerInstall, isIOS, isStandalone } = useInstallPrompt();

  const shouldShow =
    hasCompletedSession &&
    !installBannerDismissed &&
    !isStandalone &&
    (canPrompt || isIOS);

  const handleInstall = async () => {
    await triggerInstall();
    dismissInstallBanner();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={springs.snappy}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <div className="rounded-xl border bg-card shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Install Co-Flow</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isIOS
                    ? 'Add to your home screen for the best experience'
                    : 'Install for quick access and offline use'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
                onClick={dismissInstallBanner}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isIOS ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Tap <Share className="w-3.5 h-3.5 inline-block" /> then
                  &quot;Add to Home Screen&quot;
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={dismissInstallBanner}
                >
                  Got it
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" onClick={handleInstall}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={dismissInstallBanner}
                >
                  Not now
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
