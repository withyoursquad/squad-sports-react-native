/**
 * UserDataLoader — Loads user data on auth state change.
 * Fetches fresh user data in background without blocking the UI.
 * Handles auth errors by clearing cached data.
 * Ported from squad-demo/src/components/sentinels/UserDataLoader.tsx.
 */
import { useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { reActiveAccessToken } from '../../state/session';
import { reUserCache, reLoggedInUserLoaded } from '../../state/user';
import { reLastRefreshed } from '../../state/sync/refresh';
import { useApiClient } from '../../SquadProvider';

export default function UserDataLoader() {
  const apiClient = useApiClient();
  const accessToken = useRecoilValue(reActiveAccessToken);
  const refreshTimestamp = useRecoilValue(reLastRefreshed);
  const setUserCache = useSetRecoilState(reUserCache);
  const setUserLoaded = useSetRecoilState(reLoggedInUserLoaded);
  const hasRefreshedRef = useRef(false);

  // Initial load on auth state change
  useEffect(() => {
    if (!accessToken || !apiClient) return;
    if (hasRefreshedRef.current) return;

    const load = async () => {
      hasRefreshedRef.current = true;
      try {
        console.log('[UserDataLoader] Fetching fresh user data in background...');
        const user = await apiClient.getLoggedInUser();

        if (user) {
          setUserCache(user as any);
          setUserLoaded(true);
          console.log('[UserDataLoader] Fresh data loaded');
        } else {
          console.warn('[UserDataLoader] No user data returned, clearing cache');
          setUserCache(null);
          setUserLoaded(false);
        }
      } catch (error: any) {
        console.error('[UserDataLoader] Background refresh failed:', error);

        const isAuthError =
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.message?.includes('Unauthorized') ||
          error?.message?.includes('USER_NOT_FOUND') ||
          error?.message?.includes('INVALID_TOKEN');

        if (isAuthError) {
          console.error('[UserDataLoader] Auth error detected, clearing user cache');
          setUserCache(null);
          setUserLoaded(false);
        } else {
          // Allow retry for non-auth errors
          hasRefreshedRef.current = false;
        }
      }
    };

    load();
  }, [accessToken, apiClient, setUserCache, setUserLoaded]);

  // Refresh on pull-to-refresh or background return
  useEffect(() => {
    if (refreshTimestamp === 0 || !accessToken || !apiClient) return;

    const refresh = async () => {
      try {
        console.debug('[UserDataLoader] Refresh triggered, reloading user data');
        const user = await apiClient.getLoggedInUser();

        if (user) {
          setUserCache(user as any);
          setUserLoaded(true);
        } else {
          console.warn('[UserDataLoader] Refresh returned no data');
          setUserCache(null);
          setUserLoaded(false);
        }
      } catch (error: any) {
        console.error('[UserDataLoader] Error refreshing user data:', error);

        const isAuthError =
          error?.response?.status === 401 ||
          error?.response?.status === 403;

        if (isAuthError) {
          setUserCache(null);
          setUserLoaded(false);
        }
      }
    };

    refresh();
  }, [refreshTimestamp, accessToken, apiClient, setUserCache, setUserLoaded]);

  return null;
}
