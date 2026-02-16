import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Hand, ListMusic, Wrench, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResumePrompt } from '@/features/player/ResumePrompt';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { startSnapshotLoop } from '@/lib/stores/session-resume';
import { useTheme } from '@/lib/hooks/use-theme';

const navItems = [
  { to: '/', icon: ListMusic, label: 'Flows' },
  { to: '/gestures', icon: Hand, label: 'Gestures' },
  { to: '/builder', icon: Wrench, label: 'Builder' },
] as const;

export function AppLayout() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply dark/light theme
  useTheme();

  // Start resume snapshot loop on mount
  useEffect(() => {
    const cleanup = startSnapshotLoop();
    return cleanup;
  }, []);

  // Hide bottom nav on full-screen views (player)
  const hideNav = location.pathname.startsWith('/play');

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Outlet />

      {!hideNav && (
        <>
          <ResumePrompt />
          <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  aria-label={label}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[4rem]',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-[11px] font-medium">{label}</span>
                </NavLink>
              ))}
              <button
                onClick={() => setSettingsOpen(true)}
                aria-label="Settings"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[4rem] text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] font-medium">Settings</span>
              </button>
            </div>
          </nav>
        </>
      )}

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
