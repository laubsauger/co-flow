import { testGestures, testGestureMap, testFlow } from '../fixtures';

export const allGestures = testGestures;
export const gestureMap = testGestureMap;
export const allFlows = [testFlow];
export const flowMap = new Map(allFlows.map((f) => [f.id, f]));
