import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Hand, ListMusic, Wrench, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResumePrompt } from '@/features/player/ResumePrompt';
import { InstallBanner } from '@/components/InstallBanner';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { startSnapshotLoop } from '@/lib/stores/session-resume';
import { useTheme } from '@/lib/hooks/use-theme';

const navItems = [
  { to: '/', icon: ListMusic, label: 'Flows' },
  { to: '/gestures', icon: Hand, label: 'Gestures' },
  { to: '/builder', icon: Wrench, label: 'Builder' },
] as const;

/** Route content wrapper — only the Outlet animates during transitions. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Outlet />
    </div>
  );
}

/** Persistent shell rendered outside AnimatePresence: nav, resume prompt, settings. */
export function AppShell() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useTheme();

  useEffect(() => {
    const cleanup = startSnapshotLoop();
    return cleanup;
  }, []);

  const hideNav = location.pathname.startsWith('/play');
  const isBuilderEdit = /^\/builder\/.+/.test(location.pathname);

  if (hideNav) return null;

  return (
    <>
      <InstallBanner />
      <ResumePrompt />

      {/* Settings cog — top right, subtle; hidden in flow editor to avoid overlap */}
      {!isBuilderEdit && <button
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
        className="fixed top-3 right-4 z-50 p-2 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-secondary/50 transition-colors"
      >
        <Settings className="w-4.5 h-4.5" aria-hidden="true" />
      </button>}

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
        </div>
      </nav>

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
