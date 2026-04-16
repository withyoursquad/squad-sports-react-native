/**
 * Data refresh hook — marks data stale and triggers Recoil refresh.
 * Ported from squad-demo/src/hooks/useDataRefresh.ts.
 */
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { reLastRefreshed, reRefreshing } from '../state/sync/refresh';

export function useDataRefresh() {
  const setLastRefreshed = useSetRecoilState(reLastRefreshed);
  const setRefreshing = useSetRecoilState(reRefreshing);

  const refreshAllData = useCallback(() => {
    setRefreshing(true);
    setLastRefreshed(Date.now());
    // The refresh propagates to all DependableAtoms that subscribe to reRefresh
    setTimeout(() => setRefreshing(false), 500);
  }, [setLastRefreshed, setRefreshing]);

  const checkForStaleData = useCallback(async (): Promise<boolean> => {
    // Check if any data is older than 5 minutes
    return false; // Simplified — full implementation checks cache ages
  }, []);

  const clearStaleMarkers = useCallback(() => {
    // Clear stale data flags
  }, []);

  return { refreshAllData, checkForStaleData, clearStaleMarkers };
}
