import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserDataState {
  favoriteGestureIds: string[];
  favoriteFlowIds: string[];
  reducedMotion: boolean;

  toggleFavoriteGesture: (id: string) => void;
  toggleFavoriteFlow: (id: string) => void;
  isGestureFavorite: (id: string) => boolean;
  isFlowFavorite: (id: string) => boolean;
  toggleReducedMotion: () => void;
}

export const useUserData = create<UserDataState>()(
  persist(
    (set, get) => ({
      favoriteGestureIds: [],
      favoriteFlowIds: [],
      reducedMotion: false,

      toggleFavoriteGesture: (id) => {
        const { favoriteGestureIds } = get();
        const next = favoriteGestureIds.includes(id)
          ? favoriteGestureIds.filter((gid) => gid !== id)
          : [...favoriteGestureIds, id];
        set({ favoriteGestureIds: next });
      },

      toggleFavoriteFlow: (id) => {
        const { favoriteFlowIds } = get();
        const next = favoriteFlowIds.includes(id)
          ? favoriteFlowIds.filter((fid) => fid !== id)
          : [...favoriteFlowIds, id];
        set({ favoriteFlowIds: next });
      },

      isGestureFavorite: (id) => get().favoriteGestureIds.includes(id),
      isFlowFavorite: (id) => get().favoriteFlowIds.includes(id),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    {
      name: 'co-flow-user-data',
    }
  )
);
