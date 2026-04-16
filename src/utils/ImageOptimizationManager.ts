import { Image } from 'react-native';

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CONCURRENT = 5;

type UseCase = 'avatar' | 'thumbnail' | 'full' | 'background';

interface PreloadConfig {
  ttl?: number;
}

interface CacheEntry {
  source: string;
  cachedAt: number;
  ttl: number;
  loadTimeMs: number;
}

interface CacheStats {
  hitRate: number;
  avgLoadTimeMs: number;
  cacheSize: number;
}

/**
 * Singleton image preload & cache manager.
 *
 * Ported from squad-demo's imageOptimizationManager.ts with lifecycle-based
 * cleanup instead of a 5-minute timer. Call `performCleanup()` from the
 * provider's app-state handler rather than relying on setInterval.
 */
export class ImageOptimizationManager {
  private static instance: ImageOptimizationManager | null = null;

  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private totalLoadTimeMs = 0;
  private totalLoads = 0;

  static get shared(): ImageOptimizationManager {
    if (!ImageOptimizationManager.instance) {
      ImageOptimizationManager.instance = new ImageOptimizationManager();
    }
    return ImageOptimizationManager.instance;
  }

  /** Reset singleton — for testing only. */
  static resetShared(): void {
    ImageOptimizationManager.instance = null;
  }

  // ── Preload ──

  async preloadImage(source: string, config?: PreloadConfig): Promise<void> {
    const ttl = config?.ttl ?? DEFAULT_TTL_MS;

    // Already cached and still valid?
    const existing = this.cache.get(source);
    if (existing && Date.now() - existing.cachedAt < existing.ttl) {
      this.hits++;
      return;
    }
    this.misses++;

    const start = Date.now();
    await this.doPreload(source);
    const loadTimeMs = Date.now() - start;

    this.totalLoadTimeMs += loadTimeMs;
    this.totalLoads++;

    this.cache.set(source, {
      source,
      cachedAt: Date.now(),
      ttl,
      loadTimeMs,
    });
  }

  async preloadImages(
    sources: string[],
    config?: PreloadConfig,
  ): Promise<void> {
    // Process in chunks of MAX_CONCURRENT
    for (let i = 0; i < sources.length; i += MAX_CONCURRENT) {
      const chunk = sources.slice(i, i + MAX_CONCURRENT);
      await Promise.all(
        chunk.map((source) => this.preloadImage(source, config)),
      );
    }
  }

  // ── Cache Access ──

  getCachedImage(source: string): CacheEntry | null {
    const entry = this.cache.get(source);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() - entry.cachedAt > entry.ttl) {
      // Expired — remove and report miss
      this.cache.delete(source);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry;
  }

  clearCache(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.totalLoadTimeMs = 0;
    this.totalLoads = 0;
  }

  // ── Stats ──

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hitRate: total > 0 ? this.hits / total : 0,
      avgLoadTimeMs: this.totalLoads > 0 ? this.totalLoadTimeMs / this.totalLoads : 0,
      cacheSize: this.cache.size,
    };
  }

  // ── Optimization by Use Case ──

  optimizeForUseCase(
    source: string,
    useCase: UseCase,
  ): { uri: string; width?: number; height?: number; priority?: string } {
    switch (useCase) {
      case 'avatar':
        return { uri: source, width: 80, height: 80, priority: 'high' };
      case 'thumbnail':
        return { uri: source, width: 200, height: 200, priority: 'normal' };
      case 'full':
        return { uri: source, priority: 'normal' };
      case 'background':
        return { uri: source, priority: 'low' };
      default:
        return { uri: source };
    }
  }

  // ── Lifecycle Cleanup ──

  /**
   * Evict expired entries from the cache.
   * Call this from SquadProvider on app background — no timer needed.
   */
  performCleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.cachedAt > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // ── Private ──

  private doPreload(source: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        Image.prefetch(source).then(
          () => resolve(),
          (err) => reject(err),
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

/**
 * Standalone cleanup function for SquadProvider to call on app background.
 */
export function performCleanup(): void {
  ImageOptimizationManager.shared.performCleanup();
}
