import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { RecoilRoot } from 'recoil';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnalyticsTracker } from '@squad-sports/core';
import type { SquadApiClient } from '@squad-sports/core';
import type { SquadSDKConfig, SquadConfig } from '@squad-sports/core';

import { SquadSportsSDK } from './SquadSportsSDK';
import { ThemeProvider } from './theme/ThemeContext';
import { EventProcessor, type ConnectionQuality } from './realtime/EventProcessor';
import { NetworkMonitor } from './realtime/NetworkMonitor';
import { OfflineQueue } from './realtime/OfflineQueue';
import { NetworkBanner } from './components/ux/layout/NetworkBanner';

// --- Contexts ---

const SDKContext = createContext<SquadSportsSDK | null>(null);
const ApiClientContext = createContext<SquadApiClient | null>(null);

export function useSquadSDK(): SquadSportsSDK {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSquadSDK must be used within <SquadProvider>');
  }
  return sdk;
}

export function useApiClient(): SquadApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within <SquadProvider>');
  }
  return client;
}

// --- Internal: auto-connects real-time sync when authenticated ---

function RealtimeSyncSentinel({ apiClient }: { apiClient: SquadApiClient }) {
  const [isOnline, setIsOnline] = useState(true);
  const [sseQuality, setSSEQuality] = useState<ConnectionQuality>('disconnected');

  useEffect(() => {
    // Wire up EventProcessor
    const processor = EventProcessor.shared;
    processor.setApiClient(apiClient);

    // Only connect SSE if we have a token
    if (apiClient.currentToken) {
      processor.setShouldAllowEvents(true);
      processor.connect();
    }

    const onQuality = (q: ConnectionQuality) => setSSEQuality(q);
    processor.emitter.on('connection:quality', onQuality);

    // Wire up network monitoring
    const monitor = NetworkMonitor.shared;
    monitor.startMonitoring();

    const onNetworkChange = (online: boolean) => {
      setIsOnline(online);

      if (online) {
        // Reconnect SSE when back online
        if (apiClient.currentToken) {
          processor.setShouldAllowEvents(true);
          processor.connect();
        }

        // Flush offline queue
        const offlineQueue = new OfflineQueue();
        offlineQueue.processQueue(async (action) => {
          // Route actions to appropriate API calls
          try {
            switch (action.type) {
              case 'message:create': {
                const { Message } = await import('@squad-sports/core');
                const msg = new Message(action.payload as any);
                await apiClient.createMessage(msg);
                return true;
              }
              case 'freestyle:reaction': {
                const { FreestyleReaction } = await import('@squad-sports/core');
                const payload = action.payload as any;
                const reaction = new FreestyleReaction(payload.reaction);
                await apiClient.createFreestyleReaction(reaction, payload.freestyleId);
                return true;
              }
              case 'message:reaction': {
                const { MessageReaction } = await import('@squad-sports/core');
                const payload = action.payload as any;
                const reaction = new MessageReaction(payload.reaction);
                await apiClient.createMessageReaction(reaction, payload.messageId);
                return true;
              }
              default:
                return false;
            }
          } catch {
            return false;
          }
        });
      } else {
        processor.setShouldAllowEvents(false);
      }
    };

    monitor.addListener(onNetworkChange);

    // Listen for auth invalidation — disconnect SSE
    const onAuthInvalid = () => {
      processor.setShouldAllowEvents(false);
      processor.disconnect();
    };
    apiClient.emitter.on('auth:invalid', onAuthInvalid);

    return () => {
      processor.emitter.off('connection:quality', onQuality);
      monitor.removeListener(onNetworkChange);
      apiClient.emitter.off('auth:invalid', onAuthInvalid);
    };
  }, [apiClient]);

  // Return banner visibility — only show when offline
  return <NetworkBanner isOnline={isOnline} />;
}

// --- Provider ---

interface SquadProviderProps {
  children: React.ReactNode;
  /** Full or partner config. If omitted, uses SquadSportsSDK.shared. */
  config?: SquadConfig;
}

/**
 * Top-level provider that wraps the SDK experience.
 * Automatically sets up:
 * - RecoilRoot (state management)
 * - SafeAreaProvider
 * - GestureHandler
 * - Theme (from community config)
 * - API client context
 * - Real-time SSE sync (auto-connects when authenticated)
 * - Network monitoring + offline queue
 * - Offline banner
 */
export function SquadProvider({ children, config }: SquadProviderProps) {
  const [sdk, setSDK] = useState<SquadSportsSDK | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let instance: SquadSportsSDK;

        if (config) {
          instance = await SquadSportsSDK.setup(config);
        } else {
          instance = SquadSportsSDK.shared;
        }

        setSDK(instance);
      } catch (error) {
        console.error('[SquadProvider] Initialization error:', error);
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  // App lifecycle — flush analytics on background, reconnect on foreground
  useEffect(() => {
    if (!sdk) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        AnalyticsTracker.shared.flush();
        EventProcessor.shared.setShouldAllowEvents(false);
      } else if (nextState === 'active') {
        if (sdk.apiClient.currentToken) {
          EventProcessor.shared.setShouldAllowEvents(true);
          EventProcessor.shared.connect();
          sdk.apiClient.validateToken().then((valid: boolean) => {
            if (!valid) {
              sdk.apiClient.emitter.emit('auth:invalid', { status: 401, url: '' });
            }
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [sdk]);

  if (!ready || !sdk) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const communityConfig = sdk.config.community;

  return (
    <SDKContext.Provider value={sdk}>
      <ApiClientContext.Provider value={sdk.apiClient}>
        <RecoilRoot>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider
                communityColor={communityConfig.primaryColor}
                communitySecondaryColor={communityConfig.secondaryColor}
              >
                <RealtimeSyncSentinel apiClient={sdk.apiClient} />
                {children}
              </ThemeProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </RecoilRoot>
      </ApiClientContext.Provider>
    </SDKContext.Provider>
  );
}
