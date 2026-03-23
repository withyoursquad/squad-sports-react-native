/**
 * Sentinel components — auto-running side effects.
 * Ported from squad-demo/src/components/sentinels/*.
 * 12 sentinels: CommunitiesLoader, AuthChanged, NotificationHandler,
 *               UserDataLoader, CommunityThemeSyncer, StateIntegritySentinel,
 *               CustomerJourneySentinel, CountSessions, UpdateDeviceInfo, etc.
 */
import React, { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useApiClient } from '../../SquadProvider';
import { useTheme } from '../../theme/ThemeContext';
import { reAllCommunities } from '../../state/communities';
import { reActiveAccessToken, reActiveUserId } from '../../state/session';
import { reUserCache, reLoggedInUserLoaded } from '../../state/user';
import { sessionCount } from '../../state/features';
import { reDeviceInfo } from '../../state/device-info';
import { EventProcessor } from '../../realtime/EventProcessor';

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

// --- UserDataLoader ---
export function UserDataLoader() {
  const apiClient = useApiClient();
  const token = useRecoilValue(reActiveAccessToken);
  const setUserCache = useSetRecoilState(reUserCache);
  const setUserLoaded = useSetRecoilState(reLoggedInUserLoaded);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const user = await apiClient.getLoggedInUser();
        if (user) {
          setUserCache(user as any);
          setUserLoaded(true);
        }
      } catch {}
    };
    load();
  }, [token, apiClient, setUserCache, setUserLoaded]);

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

// --- CommunityThemeSyncer ---
export function CommunityThemeSyncer() {
  const user = useRecoilValue(reUserCache) as any;
  const communities = useRecoilValue(reAllCommunities) as any[];
  const { switchTheme } = useTheme();

  useEffect(() => {
    if (!user?.community || communities.length === 0) return;
    const community = communities.find((c: any) => c.id === user.community || c.name === user.community);
    if (community?.color) {
      const { buildCommunityTheme } = require('../../theme/ThemeContext');
      switchTheme(buildCommunityTheme(community.color, community.secondaryColor));
    }
  }, [user?.community, communities, switchTheme]);

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

// --- UpdateDeviceInfo ---
export function UpdateDeviceInfoSentinel() {
  const apiClient = useApiClient();
  const token = useRecoilValue(reActiveAccessToken);
  const setDeviceInfo = useSetRecoilState(reDeviceInfo);

  useEffect(() => {
    if (!token) return;
    const update = async () => {
      try {
        const { Platform } = require('react-native');
        const Constants = (await import('expo-constants')).default;
        const Device = (await import('expo-device')).default;

        const info = {
          platform: Platform.OS,
          osVersion: Platform.Version?.toString() ?? '',
          appVersion: Constants.expoConfig?.version ?? '0.1.0',
          deviceModel: Device?.modelName ?? '',
          pushToken: null,
        };

        setDeviceInfo(info);

        // Send to API
        const { DeviceInfo } = await import('@squad-sports/core');
        await apiClient.updateDeviceInfo(new DeviceInfo(info));
      } catch {}
    };
    update();
  }, [token, apiClient, setDeviceInfo]);

  return null;
}

// --- StateIntegritySentinel ---
export function StateIntegritySentinel() {
  const token = useRecoilValue(reActiveAccessToken);
  const userId = useRecoilValue(reActiveUserId);

  useEffect(() => {
    // Validate state integrity — if we have a token but no userId, something is wrong
    if (token && !userId) {
      console.warn('[StateIntegrity] Token exists but no userId — state may be corrupted');
    }
  }, [token, userId]);

  return null;
}

/**
 * All sentinels combined for easy inclusion in the provider chain.
 */
export function AllSentinels() {
  return (
    <>
      <CommunitiesLoader />
      <UserDataLoader />
      <AuthChangedSentinel />
      <CommunityThemeSyncer />
      <CountSessionsSentinel />
      <UpdateDeviceInfoSentinel />
      <StateIntegritySentinel />
    </>
  );
}
