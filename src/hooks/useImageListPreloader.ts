import { useState, useEffect, useRef } from 'react';
import { ImageOptimizationManager } from '../utils/ImageOptimizationManager';

interface PreloadProgress {
  loaded: number;
  total: number;
  complete: boolean;
}

/**
 * Hook that batch-preloads an array of image sources with progress tracking.
 */
export function useImageListPreloader(sources: string[]) {
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: sources.length,
    complete: sources.length === 0,
  });

  // Stable reference to avoid effect re-runs on every render
  const sourcesRef = useRef(sources);
  const serialized = JSON.stringify(sources);

  useEffect(() => {
    sourcesRef.current = sources;
  }, [serialized]);

  useEffect(() => {
    const current = sourcesRef.current;
    if (current.length === 0) {
      setProgress({ loaded: 0, total: 0, complete: true });
      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    setProgress({ loaded: 0, total: current.length, complete: false });

    const promises = current.map((source) =>
      ImageOptimizationManager.shared
        .preloadImage(source)
        .then(() => {
          if (!cancelled) {
            loadedCount++;
            setProgress({
              loaded: loadedCount,
              total: current.length,
              complete: loadedCount >= current.length,
            });
          }
        })
        .catch(() => {
          // Count failures as "loaded" for progress purposes
          if (!cancelled) {
            loadedCount++;
            setProgress({
              loaded: loadedCount,
              total: current.length,
              complete: loadedCount >= current.length,
            });
          }
        }),
    );

    Promise.all(promises).then(() => {
      if (!cancelled) {
        setProgress({
          loaded: current.length,
          total: current.length,
          complete: true,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [serialized]);

  return progress;
}
