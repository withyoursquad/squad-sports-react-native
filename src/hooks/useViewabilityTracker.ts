import { useEffect, useRef } from 'react';

/**
 * Tracks how long a component has been in the viewport.
 * Fires the onImpression callback once after the threshold is met.
 *
 * @param placementId - Unique placement identifier
 * @param thresholdMs - Minimum viewport time to count as impression (1000 for cards, 5000 for banners)
 * @param onImpression - Called once when threshold is met
 * @param active - Whether tracking is active (e.g., component is visible)
 */
export function useViewabilityTracker(
  placementId: string,
  thresholdMs: number,
  onImpression: (placementId: string, durationMs: number) => void,
  active: boolean = true,
): void {
  const firedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || firedRef.current) return;

    timerRef.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onImpression(placementId, thresholdMs);
      }
    }, thresholdMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [placementId, thresholdMs, onImpression, active]);

  // Reset when placement changes
  useEffect(() => {
    firedRef.current = false;
  }, [placementId]);
}
