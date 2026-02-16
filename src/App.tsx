import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/app/layout';

const GestureList = lazy(() => import('@/features/gestures/GestureList').then(m => ({ default: m.GestureList })));
const GestureDetail = lazy(() => import('@/features/gestures/GestureDetail').then(m => ({ default: m.GestureDetail })));
const PlayerView = lazy(() => import('@/features/player/PlayerView').then(m => ({ default: m.PlayerView })));
const FlowList = lazy(() => import('@/features/flows/FlowList').then(m => ({ default: m.FlowList })));
const FlowDetail = lazy(() => import('@/features/flows/FlowDetail').then(m => ({ default: m.FlowDetail })));
const BuilderHome = lazy(() => import('@/features/builder/BuilderHome').then(m => ({ default: m.BuilderHome })));
const FlowEditor = lazy(() => import('@/features/builder/FlowEditor').then(m => ({ default: m.FlowEditor })));

function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
        <svg width="64" height="64" viewBox="-40 -34 80 76" fill="none" className="text-primary">
          <path
            d="M0,38 C-18,28 -38,16 -38,-2 C-38,-18 -28,-30 -16,-30 C-8,-30 -2,-24 0,-18 C2,-24 8,-30 16,-30 C28,-30 38,-18 38,-2 C38,16 18,28 0,38Z"
            stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M0,8 C0,-2 6,-10 14,-12 C14,-12 12,-2 6,4 C4,6 0,8 0,8Z" fill="currentColor" opacity="0.5"/>
          <path d="M0,10 C0,0 -5,-8 -10,-10 C-10,-10 -8,-1 -4,4 C-2,6 0,10 0,10Z" fill="currentColor" opacity="0.35"/>
          <line x1="0" y1="8" x2="0" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        </svg>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Co-Flow</h1>
          <p className="text-sm text-muted-foreground mt-1">Breathe. Touch. Heal.</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<SplashScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<GestureList />} />
            <Route path="/gestures/:id" element={<GestureDetail />} />
            <Route path="/flows" element={<FlowList />} />
            <Route path="/flows/:id" element={<FlowDetail />} />
            <Route path="/builder" element={<BuilderHome />} />
            <Route path="/builder/:id" element={<FlowEditor />} />
          </Route>
          {/* Player is full-screen, outside the layout (no bottom nav) */}
          <Route path="/play" element={<PlayerView />} />
          <Route path="*" element={<GestureList />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
