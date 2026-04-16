/**
 * Sentinel components — auto-running side effects.
 * Ported from squad-demo/src/components/sentinels/*.
 *
 * Each sentinel is now in its own file. This module re-exports them
 * and provides AllSentinels for easy inclusion in the provider chain.
 */
import React, { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useApiClient } from '../../SquadProvider';
import { reAllCommunities } from '../../state/communities';
import { reActiveAccessToken } from '../../state/session';
import { sessionCount } from '../../state/features';
import { EventProcessor } from '../../realtime/EventProcessor';

// Re-export individual sentinel components
export { default as NetworkBannerSentinel } from './NetworkBannerSentinel';
export { default as NotificationHandler } from './NotificationHandler';
export { default as UpdateDeviceInfo } from './UpdateDeviceInfo';
export { WatchForFirstSquaddy } from './FirstSquaddy';
export { default as CommunityThemeSyncer } from './CommunityThemeSyncer';
export { default as AppBackgroundState } from './AppBackgroundState';
export { default as StateIntegritySentinel } from './StateIntegritySentinel';
export { default as UserDataLoader } from './UserDataLoader';

// --- CommunitiesLoader ---
export function CommunitiesLoader() {
  const apiClient = useApiClient();
  const setCommunities = useSetRecoilState(reAllCommunities);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiClient.fetchAllCommunities();
        if (result?.communities) {
          setCommunities(result.communities as any[]);
        }
      } catch {}
    };
    load();
  }, [apiClient, setCommunities]);

  return null;
}

// --- AuthChanged ---
export function AuthChangedSentinel() {
  const token = useRecoilValue(reActiveAccessToken);

  useEffect(() => {
    const processor = EventProcessor.shared;
    if (token) {
      processor.setShouldAllowEvents(true);
      processor.connect();
    } else {
      processor.setShouldAllowEvents(false);
      processor.disconnect();
    }
  }, [token]);

  return null;
}

// --- CountSessions ---
export function CountSessionsSentinel() {
  const setSessionCount = useSetRecoilState(sessionCount);

  useEffect(() => {
    setSessionCount(prev => prev + 1);
  }, [setSessionCount]);

  return null;
}

// Import individual sentinels for AllSentinels composition
import NetworkBannerSentinelComponent from './NetworkBannerSentinel';
import NotificationHandlerComponent from './NotificationHandler';
import UpdateDeviceInfoComponent from './UpdateDeviceInfo';
import CommunityThemeSyncerComponent from './CommunityThemeSyncer';
import AppBackgroundStateComponent from './AppBackgroundState';
import StateIntegritySentinelComponent from './StateIntegritySentinel';
import UserDataLoaderComponent from './UserDataLoader';

/**
 * All sentinels combined for easy inclusion in the provider chain.
 */
export function AllSentinels() {
  return (
    <>
      <CommunitiesLoader />
      <UserDataLoaderComponent />
      <AuthChangedSentinel />
      <CommunityThemeSyncerComponent />
      <CountSessionsSentinel />
      <UpdateDeviceInfoComponent />
      <StateIntegritySentinelComponent />
      <NetworkBannerSentinelComponent />
      <NotificationHandlerComponent />
      <AppBackgroundStateComponent />
    </>
  );
}
