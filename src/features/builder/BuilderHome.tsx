import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserFlows } from '@/lib/stores/user-flows';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, Clock, Layers, Trash2 } from 'lucide-react';
import { springs } from '@/motion/tokens';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { getFlowGradient } from '@/lib/body-area-colors';
import { gestureMap } from '@/content/generated';
import { BrandHeader } from '@/components/BrandHeader';

export function BuilderHome() {
  const navigate = useNavigate();
  const { flows, createFlow, deleteFlow } = useUserFlows();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createFlow(name);
    setNewName('');
    setShowCreate(false);
    navigate(`/builder/${id}`);
  };

  const formatDuration = (steps: { durationSec: number }[]) => {
    const total = steps.reduce((s, step) => s + step.durationSec, 0);
    return `${Math.floor(total / 60)}m`;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <header className="mb-4">
        <div className="flex items-baseline gap-2">
          <BrandHeader />
          <span className="text-muted-foreground/40 text-sm">/</span>
          <h1 className="text-lg font-semibold tracking-tight">Builder</h1>
        </div>
      </header>

      {/* Create new flow */}
      {showCreate ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
          className="rounded-lg border bg-card p-4 mb-4 space-y-3"
        >
          <Input
            placeholder="Flow name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setNewName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      ) : (
        <Button
          className="w-full mb-6"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Flow
        </Button>
      )}

      {/* User flows */}
      {flows.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-2">
            Nothing here yet
          </p>
          <p className="text-sm text-muted-foreground">
            Tap New Flow to start designing.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {flows.map((flow, i) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.soft, delay: i * 0.05 }}
              className="rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => navigate(`/builder/${flow.id}`)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                {/* Gradient Thumbnail */}
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0 shadow-inner border border-white/10"
                  style={{
                    background: getFlowGradient(
                      flow.steps.flatMap(s => gestureMap.get(s.gestureId)?.bodyAreas || [])
                    )
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{flow.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {flow.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(flow.steps)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
              <div className="border-t px-4 py-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFlow(flow.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
