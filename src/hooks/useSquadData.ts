import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '../SquadProvider';
import type { User, Connection, Feed } from '@squad-sports/core';

/**
 * Hook to load and manage the logged-in user's data.
 */
export function useCurrentUser() {
  const apiClient = useApiClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await apiClient.getLoggedInUser();
      setUser(userData);
    } catch (error) {
      console.error('[useCurrentUser] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
}

/**
 * Hook to load and manage squad connections.
 */
export function useSquadConnections() {
  const apiClient = useApiClient();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (forceFresh = false) => {
    setLoading(true);
    try {
      const squad = await apiClient.getUserConnections(forceFresh);
      setConnections(squad?.connections ?? []);
    } catch (error) {
      console.error('[useSquadConnections] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { connections, loading, refresh };
}

/**
 * Hook to load the freestyle feed.
 */
export function useFeed() {
  const apiClient = useApiClient();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (forceFresh = false) => {
    setLoading(true);
    try {
      const data = await apiClient.getFeed(1, 20, forceFresh);
      setFeed(data);
    } catch (error) {
      console.error('[useFeed] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { feed, loading, refresh };
}
