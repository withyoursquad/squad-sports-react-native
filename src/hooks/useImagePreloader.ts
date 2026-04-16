import { useState, useEffect } from 'react';
import { ImageOptimizationManager } from '../utils/ImageOptimizationManager';

/**
 * Hook that preloads a single image source and tracks load state.
 */
export function useImagePreloader(source: string | null) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setLoaded(false);
      setError(null);
      return;
    }

    setLoaded(false);
    setError(null);

    let cancelled = false;

    ImageOptimizationManager.shared
      .preloadImage(source)
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to preload');
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  return { loaded, error };
}
