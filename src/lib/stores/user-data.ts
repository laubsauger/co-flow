import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserDataState {
  favoriteGestureIds: string[];
  favoriteFlowIds: string[];

  toggleFavoriteGesture: (id: string) => void;
  toggleFavoriteFlow: (id: string) => void;
  isGestureFavorite: (id: string) => boolean;
  isFlowFavorite: (id: string) => boolean;
}

export const useUserData = create<UserDataState>()(
  persist(
    (set, get) => ({
      favoriteGestureIds: [],
      favoriteFlowIds: [],

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
    }),
    {
      name: 'co-flow-user-data',
    }
  )
);
