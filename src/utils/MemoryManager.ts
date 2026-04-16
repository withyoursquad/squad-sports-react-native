import { Image } from 'react-native';

const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50 MB
const REF_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: string;
  size: number;
  lastAccessed: number;
}

interface ComponentRef {
  ref: WeakRef<object>;
  registered: number;
}

/**
 * Singleton memory manager ported from squad-demo's memoryOptimizations.ts.
 *
 * Responsibilities:
 * - Track component lifetimes via weak refs
 * - LRU image cache with 50 MB limit
 * - Provide FlatList optimization config
 * - Lifecycle-based cleanup (no timers)
 */
export class MemoryManager {
  private static instance: MemoryManager | null = null;

  private componentRefs = new Map<string, ComponentRef>();
  private imageCache = new Map<string, CacheEntry>();
  private currentCacheSize = 0;

  static get shared(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /** Reset singleton — for testing only. */
  static resetShared(): void {
    MemoryManager.instance = null;
  }

  // ── Component Ref Tracking ──

  registerComponentRef(id: string, ref: object): void {
    this.componentRefs.set(id, {
      ref: new WeakRef(ref),
      registered: Date.now(),
    });
  }

  unregisterComponentRef(id: string): void {
    this.componentRefs.delete(id);
  }

  getActiveComponentCount(): number {
    let count = 0;
    for (const [, entry] of this.componentRefs) {
      if (entry.ref.deref() !== undefined) {
        count++;
      }
    }
    return count;
  }

  // ── Image Cache (LRU, 50 MB) ──

  cacheImage(key: string, data: string): void {
    const size = data.length * 2; // approximate byte size (UTF-16)

    // If single item exceeds limit, skip caching
    if (size > MAX_CACHE_BYTES) return;

    // Evict existing entry for this key first
    if (this.imageCache.has(key)) {
      this.evictEntry(key);
    }

    // Evict LRU entries until there is room
    while (this.currentCacheSize + size > MAX_CACHE_BYTES && this.imageCache.size > 0) {
      this.evictLRU();
    }

    this.imageCache.set(key, {
      data,
      size,
      lastAccessed: Date.now(),
    });
    this.currentCacheSize += size;
  }

  getCachedImage(key: string): string | null {
    const entry = this.imageCache.get(key);
    if (!entry) return null;
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  get cacheSize(): number {
    return this.currentCacheSize;
  }

  get cacheEntryCount(): number {
    return this.imageCache.size;
  }

  // ── Cleanup ──

  /**
   * Remove stale component refs (>24 hr) and evict oversized cache.
   * Call on app background or other lifecycle events — no timer needed.
   */
  cleanup(): void {
    const now = Date.now();

    // Remove expired or GC'd component refs
    for (const [id, entry] of this.componentRefs) {
      if (entry.ref.deref() === undefined || now - entry.registered > REF_EXPIRY_MS) {
        this.componentRefs.delete(id);
      }
    }

    // Evict oversized cache
    while (this.currentCacheSize > MAX_CACHE_BYTES && this.imageCache.size > 0) {
      this.evictLRU();
    }

    // Clear RN image memory cache when available
    try {
      if (typeof (Image as any).clearMemoryCache === 'function') {
        (Image as any).clearMemoryCache();
      }
    } catch {
      // Not available on all RN versions — ignore.
    }
  }

  // ── Virtualized List Config ──

  /**
   * Returns an optimized FlatList config for the given dimensions.
   */
  createVirtualizedListConfig(
    itemCount: number,
    itemHeight: number,
    windowHeight: number,
  ): {
    windowSize: number;
    maxToRenderPerBatch: number;
    initialNumToRender: number;
    removeClippedSubviews: boolean;
    getItemLayout: (_data: unknown, index: number) => { length: number; offset: number; index: number };
  } {
    const visibleItems = Math.ceil(windowHeight / itemHeight);
    // Render ~2 screens on each side
    const windowSize = Math.max(3, Math.ceil((visibleItems * 5) / visibleItems));
    const maxToRenderPerBatch = Math.max(2, Math.ceil(visibleItems / 2));
    const initialNumToRender = Math.min(itemCount, visibleItems + 2);

    return {
      windowSize,
      maxToRenderPerBatch,
      initialNumToRender,
      removeClippedSubviews: true,
      getItemLayout: (_data: unknown, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
    };
  }

  // ── Private ──

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.imageCache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.evictEntry(oldestKey);
    }
  }

  private evictEntry(key: string): void {
    const entry = this.imageCache.get(key);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.imageCache.delete(key);
    }
  }
}
