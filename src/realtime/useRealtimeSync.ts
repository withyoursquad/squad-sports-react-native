import { useEffect, useState, useCallback } from 'react';
import { EventProcessor, type ConnectionQuality } from './EventProcessor';
import { useApiClient } from '../SquadProvider';

/**
 * Hook that manages the real-time SSE connection lifecycle.
 * Wire this into your root provider to enable live updates.
 */
export function useRealtimeSync() {
  const apiClient = useApiClient();
  const [quality, setQuality] = useState<ConnectionQuality>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const processor = EventProcessor.shared;
    processor.setApiClient(apiClient);
    processor.setShouldAllowEvents(true);

    // Listen for quality changes
    const onQuality = (q: ConnectionQuality) => {
      setQuality(q);
      setIsConnected(q === 'good');
    };
    processor.emitter.on('connection:quality', onQuality);

    // Connect
    processor.connect();

    return () => {
      processor.emitter.off('connection:quality', onQuality);
      // Don't disconnect on unmount — EventProcessor is a singleton
      // that persists across the app lifecycle
    };
  }, [apiClient]);

  return { quality, isConnected };
}

/**
 * Hook that subscribes to a specific real-time event type.
 * Automatically cleans up the subscription on unmount.
 *
 * Usage:
 * ```ts
 * useRealtimeEvent('feed:update', (data) => {
 *   console.log('Feed updated:', data);
 *   refreshFeed();
 * });
 * ```
 */
export function useRealtimeEvent<T = unknown>(
  eventType: string,
  handler: (data: T) => void,
) {
  useEffect(() => {
    const processor = EventProcessor.shared;
    processor.emitter.on(eventType, handler);

    return () => {
      processor.emitter.off(eventType, handler);
    };
  }, [eventType, handler]);
}

/**
 * Hook that subscribes to connection-specific message events.
 */
export function useMessageUpdates(
  connectionId: string,
  onNewMessage: (data: unknown) => void,
) {
  useRealtimeEvent(`connection:${connectionId}:message:create`, onNewMessage);
}

/**
 * Hook that subscribes to squad membership changes.
 */
export function useSquadUpdates(
  onMemberAdded?: (data: unknown) => void,
  onMemberRemoved?: (data: unknown) => void,
) {
  useRealtimeEvent('squad:member:add', onMemberAdded ?? (() => {}));
  useRealtimeEvent('squad:member:remove', onMemberRemoved ?? (() => {}));
}
