/**
 * Image optimization hook — resizes and compresses images before upload.
 * Ported from squad-demo/src/hooks/useImageOptimization.ts + useImagePreloader.ts + useImageListPreloader.ts.
 */
import { useCallback } from 'react';

interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export function useImageOptimization() {
  const optimizeImage = useCallback(async (
    uri: string,
    maxWidth: number = 800,
    quality: number = 0.8,
  ): Promise<OptimizedImage> => {
    try {
      const ImageManipulator = await import('expo-image-manipulator');
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
      );
      return { uri: result.uri, width: result.width, height: result.height };
    } catch {
      return { uri, width: 0, height: 0 };
    }
  }, []);

  return { optimizeImage };
}

export function useImagePreloader() {
  const preloadImage = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const { Image } = await import('expo-image');
      await Image.prefetch(uri);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { preloadImage };
}

export function useImageListPreloader() {
  const preloadImages = useCallback(async (uris: string[]): Promise<void> => {
    try {
      const { Image } = await import('expo-image');
      await Promise.allSettled(uris.map(uri => Image.prefetch(uri)));
    } catch {}
  }, []);

  return { preloadImages };
}
