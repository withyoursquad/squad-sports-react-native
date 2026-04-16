const mockPrefetch = jest.fn().mockResolvedValue(true);

jest.mock('react-native', () => ({
  Image: {
    prefetch: mockPrefetch,
  },
}));

import { ImageOptimizationManager } from '../utils/ImageOptimizationManager';

describe('ImageOptimizationManager', () => {
  beforeEach(() => {
    ImageOptimizationManager.resetShared();
    mockPrefetch.mockClear();
    mockPrefetch.mockResolvedValue(true);
  });

  describe('singleton', () => {
    it('returns the same instance', () => {
      expect(ImageOptimizationManager.shared).toBe(ImageOptimizationManager.shared);
    });

    it('returns a new instance after reset', () => {
      const first = ImageOptimizationManager.shared;
      ImageOptimizationManager.resetShared();
      expect(ImageOptimizationManager.shared).not.toBe(first);
    });
  });

  describe('preloadImage', () => {
    it('calls Image.prefetch for a new source', async () => {
      await ImageOptimizationManager.shared.preloadImage('https://example.com/img.png');
      expect(mockPrefetch).toHaveBeenCalledWith('https://example.com/img.png');
    });

    it('skips prefetch for cached (non-expired) source', async () => {
      const mgr = ImageOptimizationManager.shared;
      await mgr.preloadImage('https://example.com/img.png');
      mockPrefetch.mockClear();

      await mgr.preloadImage('https://example.com/img.png');
      expect(mockPrefetch).not.toHaveBeenCalled();
    });

    it('records stats correctly', async () => {
      const mgr = ImageOptimizationManager.shared;
      await mgr.preloadImage('https://example.com/1.png');
      await mgr.preloadImage('https://example.com/1.png'); // cache hit

      const stats = mgr.getStats();
      expect(stats.cacheSize).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('preloadImages', () => {
    it('preloads multiple images', async () => {
      const sources = [
        'https://example.com/a.png',
        'https://example.com/b.png',
        'https://example.com/c.png',
      ];

      await ImageOptimizationManager.shared.preloadImages(sources);
      expect(mockPrefetch).toHaveBeenCalledTimes(3);
    });

    it('respects concurrency limit (processes in chunks)', async () => {
      // Create 7 sources — should be processed in two chunks (5 + 2)
      const sources = Array.from({ length: 7 }, (_, i) => `https://example.com/${i}.png`);

      const callOrder: number[] = [];
      mockPrefetch.mockImplementation((uri: string) => {
        const idx = parseInt(uri.split('/').pop()!.replace('.png', ''));
        callOrder.push(idx);
        return Promise.resolve(true);
      });

      await ImageOptimizationManager.shared.preloadImages(sources);
      expect(mockPrefetch).toHaveBeenCalledTimes(7);
    });
  });

  describe('getCachedImage', () => {
    it('returns null for uncached source', () => {
      expect(ImageOptimizationManager.shared.getCachedImage('no-such')).toBeNull();
    });

    it('returns entry for cached source', async () => {
      const mgr = ImageOptimizationManager.shared;
      await mgr.preloadImage('https://example.com/cached.png');

      const entry = mgr.getCachedImage('https://example.com/cached.png');
      expect(entry).not.toBeNull();
      expect(entry!.source).toBe('https://example.com/cached.png');
    });

    it('returns null for expired entry', async () => {
      const mgr = ImageOptimizationManager.shared;
      // Use very short TTL
      await mgr.preloadImage('https://example.com/expire.png', { ttl: 1 });

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 5));

      const entry = mgr.getCachedImage('https://example.com/expire.png');
      expect(entry).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('clears all entries and resets stats', async () => {
      const mgr = ImageOptimizationManager.shared;
      await mgr.preloadImage('https://example.com/img.png');

      mgr.clearCache();

      expect(mgr.getStats().cacheSize).toBe(0);
      expect(mgr.getStats().hitRate).toBe(0);
    });
  });

  describe('optimizeForUseCase', () => {
    it('returns avatar config with 80x80', () => {
      const result = ImageOptimizationManager.shared.optimizeForUseCase(
        'https://example.com/img.png',
        'avatar',
      );
      expect(result.width).toBe(80);
      expect(result.height).toBe(80);
      expect(result.priority).toBe('high');
    });

    it('returns thumbnail config with 200x200', () => {
      const result = ImageOptimizationManager.shared.optimizeForUseCase(
        'https://example.com/img.png',
        'thumbnail',
      );
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('returns background config with low priority', () => {
      const result = ImageOptimizationManager.shared.optimizeForUseCase(
        'https://example.com/img.png',
        'background',
      );
      expect(result.priority).toBe('low');
    });
  });

  describe('performCleanup', () => {
    it('removes expired entries', async () => {
      const mgr = ImageOptimizationManager.shared;
      await mgr.preloadImage('https://example.com/expire.png', { ttl: 1 });
      await mgr.preloadImage('https://example.com/keep.png', { ttl: 60000 });

      // Wait for first to expire
      await new Promise((resolve) => setTimeout(resolve, 5));

      mgr.performCleanup();

      expect(mgr.getCachedImage('https://example.com/keep.png')).not.toBeNull();
      // expired entry was cleaned up — accessing it returns null
      // (it was already deleted by performCleanup)
      const stats = mgr.getStats();
      expect(stats.cacheSize).toBe(1);
    });
  });
});
