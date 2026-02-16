import { useUserData } from './user-data';

function resetStore() {
  useUserData.setState({
    favoriteGestureIds: [],
    favoriteFlowIds: [],
    reducedMotion: false,
  });
}

beforeEach(resetStore);

describe('useUserData', () => {
  describe('initial state', () => {
    it('has empty favorites', () => {
      const s = useUserData.getState();
      expect(s.favoriteGestureIds).toEqual([]);
      expect(s.favoriteFlowIds).toEqual([]);
      expect(s.reducedMotion).toBe(false);
    });
  });

  describe('gesture favorites', () => {
    it('toggleFavoriteGesture adds ID', () => {
      useUserData.getState().toggleFavoriteGesture('upper-back-circles');
      expect(useUserData.getState().favoriteGestureIds).toEqual(['upper-back-circles']);
    });

    it('toggleFavoriteGesture again removes ID', () => {
      useUserData.getState().toggleFavoriteGesture('upper-back-circles');
      useUserData.getState().toggleFavoriteGesture('upper-back-circles');
      expect(useUserData.getState().favoriteGestureIds).toEqual([]);
    });

    it('isGestureFavorite returns correct boolean', () => {
      expect(useUserData.getState().isGestureFavorite('upper-back-circles')).toBe(false);
      useUserData.getState().toggleFavoriteGesture('upper-back-circles');
      expect(useUserData.getState().isGestureFavorite('upper-back-circles')).toBe(true);
    });
  });

  describe('flow favorites', () => {
    it('toggleFavoriteFlow adds ID', () => {
      useUserData.getState().toggleFavoriteFlow('quick-neck-relief');
      expect(useUserData.getState().favoriteFlowIds).toEqual(['quick-neck-relief']);
    });

    it('toggleFavoriteFlow again removes ID', () => {
      useUserData.getState().toggleFavoriteFlow('quick-neck-relief');
      useUserData.getState().toggleFavoriteFlow('quick-neck-relief');
      expect(useUserData.getState().favoriteFlowIds).toEqual([]);
    });

    it('isFlowFavorite returns correct boolean', () => {
      expect(useUserData.getState().isFlowFavorite('quick-neck-relief')).toBe(false);
      useUserData.getState().toggleFavoriteFlow('quick-neck-relief');
      expect(useUserData.getState().isFlowFavorite('quick-neck-relief')).toBe(true);
    });
  });

  describe('reducedMotion', () => {
    it('toggleReducedMotion flips boolean', () => {
      expect(useUserData.getState().reducedMotion).toBe(false);
      useUserData.getState().toggleReducedMotion();
      expect(useUserData.getState().reducedMotion).toBe(true);
      useUserData.getState().toggleReducedMotion();
      expect(useUserData.getState().reducedMotion).toBe(false);
    });
  });
});
