/**
 * StateIntegritySentinel — Validates app state consistency on mount
 * and at key trigger points (reconnection, health checks).
 * Ported from squad-demo/src/components/sentinels/StateIntegritySentinel.tsx.
 */
import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { reActiveAccessToken, reActiveUserId } from '../../state/session';
import { EventProcessor } from '../../realtime/EventProcessor';

const HEALTH_CHECK_DEBOUNCE_MS = 60_000; // Don't run more than once per minute

type StateIntegritySentinelProps = {
  /** Called when state inconsistency is detected */
  onIntegrityFailure?: (details: {
    hasToken: boolean;
    hasUserId: boolean;
    source: string;
  }) => void;
};

export default function StateIntegritySentinel({
  onIntegrityFailure,
}: StateIntegritySentinelProps = {}) {
  const token = useRecoilValue(reActiveAccessToken);
  const userId = useRecoilValue(reActiveUserId);

  const isRunningRef = useRef(false);
  const lastHealthCheckRunRef = useRef(0);

  const runCheck = (source: string) => {
    // Mutex -- don't run concurrent checks
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    try {
      const hasToken = !!token;
      const hasUserId = !!userId;

      // Token without userId = corrupted state
      if (hasToken && !hasUserId) {
        console.warn(
          `[StateIntegritySentinel] Integrity issue detected (${source}):`,
          { hasToken, hasUserId },
        );

        onIntegrityFailure?.({ hasToken, hasUserId, source });
      }

      // UserId without token = session expired
      if (!hasToken && hasUserId) {
        console.warn(
          `[StateIntegritySentinel] Session may have expired (${source}):`,
          { hasToken, hasUserId },
        );

        onIntegrityFailure?.({ hasToken, hasUserId, source });
      }
    } finally {
      isRunningRef.current = false;
    }
  };

  // Check on mount
  useEffect(() => {
    runCheck('mount');
  }, [token, userId]);

  // Check on reconnection and health check events
  useEffect(() => {
    const processor = EventProcessor.shared;

    const onReconnect = () => {
      runCheck('reconnect');
    };

    const onRefresh = () => {
      const now = Date.now();
      if (now - lastHealthCheckRunRef.current >= HEALTH_CHECK_DEBOUNCE_MS) {
        lastHealthCheckRunRef.current = now;
        runCheck('health_check');
      }
    };

    processor.emitter.on('reconnect', onReconnect);
    processor.emitter.on('connected', onRefresh);

    return () => {
      processor.emitter.off('reconnect', onReconnect);
      processor.emitter.off('connected', onRefresh);
    };
  }, [token, userId]);

  return null;
}
