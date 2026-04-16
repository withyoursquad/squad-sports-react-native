jest.mock('react-native', () => ({
  Image: {
    clearMemoryCache: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(true),
  },
}));

import { MemoryManager } from '../utils/MemoryManager';

describe('MemoryManager', () => {
  beforeEach(() => {
    MemoryManager.resetShared();
  });

  describe('singleton', () => {
    it('returns the same instance on multiple accesses', () => {
      expect(MemoryManager.shared).toBe(MemoryManager.shared);
    });

    it('returns a new instance after resetShared', () => {
      const first = MemoryManager.shared;
      MemoryManager.resetShared();
      expect(MemoryManager.shared).not.toBe(first);
    });
  });

  describe('component refs', () => {
    it('registers and unregisters component refs', () => {
      const mgr = MemoryManager.shared;
      const obj = { id: 'test' };

      mgr.registerComponentRef('comp-1', obj);
      expect(mgr.getActiveComponentCount()).toBe(1);

      mgr.unregisterComponentRef('comp-1');
      expect(mgr.getActiveComponentCount()).toBe(0);
    });
  });

  describe('image cache', () => {
    it('caches and retrieves images', () => {
      const mgr = MemoryManager.shared;
      mgr.cacheImage('key1', 'imagedata');

      expect(mgr.getCachedImage('key1')).toBe('imagedata');
      expect(mgr.cacheEntryCount).toBe(1);
    });

    it('returns null for uncached key', () => {
      const mgr = MemoryManager.shared;
      expect(mgr.getCachedImage('nonexistent')).toBeNull();
    });

    it('evicts LRU entries when cache exceeds 50MB', () => {
      const mgr = MemoryManager.shared;
      // Each char is ~2 bytes in our size calculation
      // Create data that is ~10MB each (5M chars)
      const chars = 5 * 1024 * 1024;
      const bigData = 'x'.repeat(chars); // ~10MB

      // Fill with 5 entries = 50MB
      for (let i = 0; i < 5; i++) {
        mgr.cacheImage(`key${i}`, bigData);
      }

      expect(mgr.cacheEntryCount).toBe(5);

      // Adding one more should evict the oldest
      mgr.cacheImage('key-new', bigData);

      expect(mgr.cacheEntryCount).toBe(5);
      // key0 was the oldest and should have been evicted
      expect(mgr.getCachedImage('key0')).toBeNull();
      expect(mgr.getCachedImage('key-new')).toBe(bigData);
    });

    it('skips caching items larger than 50MB', () => {
      const mgr = MemoryManager.shared;
      // 30M chars = ~60MB
      const hugeData = 'x'.repeat(30 * 1024 * 1024);
      mgr.cacheImage('huge', hugeData);
      expect(mgr.cacheEntryCount).toBe(0);
    });

    it('updates lastAccessed on getCachedImage', () => {
      const mgr = MemoryManager.shared;
      const chars = 5 * 1024 * 1024;
      const bigData = 'x'.repeat(chars);

      // Use fake timestamps to control LRU ordering
      let now = 1000;
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

      mgr.cacheImage('oldest', bigData);
      now = 2000;
      mgr.cacheImage('middle', bigData);
      now = 3000;
      mgr.cacheImage('newest', bigData);
      now = 4000;
      mgr.cacheImage('extra1', bigData);
      now = 5000;
      mgr.cacheImage('extra2', bigData);

      // Access oldest to bump its lastAccessed to a recent time
      now = 6000;
      mgr.getCachedImage('oldest');

      // Add a new entry — should evict 'middle' (lastAccessed=2000) instead of 'oldest' (lastAccessed=6000)
      now = 7000;
      mgr.cacheImage('trigger-evict', bigData);

      expect(mgr.getCachedImage('oldest')).toBe(bigData);
      expect(mgr.getCachedImage('middle')).toBeNull();

      dateSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('removes stale component refs', () => {
      const mgr = MemoryManager.shared;

      // Register a ref that "registered" 25 hours ago
      mgr.registerComponentRef('stale', { id: 'stale' });

      // Manually backdate the registration
      const refMap = (mgr as any).componentRefs as Map<string, any>;
      const entry = refMap.get('stale');
      entry.registered = Date.now() - 25 * 60 * 60 * 1000;

      mgr.cleanup();

      expect(mgr.getActiveComponentCount()).toBe(0);
    });
  });

  describe('createVirtualizedListConfig', () => {
    it('returns valid FlatList config', () => {
      const mgr = MemoryManager.shared;
      const config = mgr.createVirtualizedListConfig(100, 60, 800);

      expect(config.removeClippedSubviews).toBe(true);
      expect(config.initialNumToRender).toBeGreaterThan(0);
      expect(config.initialNumToRender).toBeLessThanOrEqual(100);
      expect(config.maxToRenderPerBatch).toBeGreaterThan(0);
      expect(config.windowSize).toBeGreaterThanOrEqual(3);
      expect(typeof config.getItemLayout).toBe('function');
    });

    it('getItemLayout returns correct offset and length', () => {
      const mgr = MemoryManager.shared;
      const config = mgr.createVirtualizedListConfig(100, 60, 800);
      const layout = config.getItemLayout(null, 5);

      expect(layout).toEqual({ length: 60, offset: 300, index: 5 });
    });
  });
});
