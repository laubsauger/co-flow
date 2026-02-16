import { resolveGestureMediaUrl } from './resolve-media-url';

describe('resolveGestureMediaUrl', () => {
  it('returns correct URL format', () => {
    expect(resolveGestureMediaUrl('upper-back-circles', 'audio.mp3')).toBe(
      '/src/content/gestures/upper-back-circles/audio.mp3'
    );
  });

  it('works with video files', () => {
    expect(resolveGestureMediaUrl('hand-massage', 'video.mp4')).toBe(
      '/src/content/gestures/hand-massage/video.mp4'
    );
  });
});
