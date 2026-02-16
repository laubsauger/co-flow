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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
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
