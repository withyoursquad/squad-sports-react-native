/**
 * EventProcessor context — provides EventProcessor instance to the React tree.
 * Ported from squad-demo/src/contexts/EventProcessorContext.tsx + EventProcessorSetup.tsx.
 */
import React, { createContext, useContext, useEffect } from 'react';
import { EventProcessor } from '../realtime/EventProcessor';
import { useApiClient } from '../SquadProvider';

const EventProcessorCtx = createContext<EventProcessor>(EventProcessor.shared);

export function useEventProcessor(): EventProcessor {
  return useContext(EventProcessorCtx);
}

/**
 * Sets up EventProcessor with the current API client.
 * Wire this into the provider chain to auto-connect SSE.
 */
export function EventProcessorSetup({ children }: { children: React.ReactNode }) {
  const apiClient = useApiClient();

  useEffect(() => {
    const processor = EventProcessor.shared;
    processor.setApiClient(apiClient);

    if (apiClient.currentToken) {
      processor.setShouldAllowEvents(true);
      processor.connect();
    }

    return () => {
      // Don't disconnect — EventProcessor is a singleton
    };
  }, [apiClient]);

  return (
    <EventProcessorCtx.Provider value={EventProcessor.shared}>
      {children}
    </EventProcessorCtx.Provider>
  );
}
