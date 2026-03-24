import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { AnalyticsTracker } from '@squad-sports/core';
import type { SquadSDKConfig, SquadConfig, SSOProvider, PartnerUserData } from '@squad-sports/core';

import { SquadProvider } from './SquadProvider';
import { SquadNavigator } from './navigation/SquadNavigator';
import { SquadSportsSDK } from './SquadSportsSDK';
import { useTheme } from './theme/ThemeContext';
import { ScreenErrorBoundary } from './components/ErrorBoundary';

function SquadNavigationContainer() {
  const { theme } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.screenBackground,
    },
  };

  const onReady = useCallback(() => {
    routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
  }, []);

  const onStateChange = useCallback(() => {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
    if (currentRouteName && currentRouteName !== routeNameRef.current) {
      AnalyticsTracker.shared.trackScreen(currentRouteName);
      routeNameRef.current = currentRouteName;
    }
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      {...{ independent: true } as any}
      onReady={onReady}
      onStateChange={onStateChange}
    >
      <SquadNavigator />
    </NavigationContainer>
  );
}

interface SquadExperienceProps {
  // --- Simple path (recommended) ---

  /** Your Nexus partner ID. Everything else auto-resolves. */
  partnerId?: string;

  /** Your API key from partners.squadforsports.com. Required when using partnerId. */
  apiKey?: string;

  /** Pre-authenticated SSO token (Ticketmaster, OAuth, etc.) */
  ssoToken?: string;

  /** SSO provider (defaults to 'ticketmaster' if ssoToken is provided) */
  ssoProvider?: SSOProvider;

  /** User data from host app for seamless partner auth (no login required) */
  userData?: PartnerUserData;

  /** Push notification token (APNs or FCM) for receiving Squad notifications */
  pushToken?: string;

  // --- Full config path ---

  /** Full SDK configuration (overrides partnerId if both provided) */
  config?: SquadConfig;

  // --- Callbacks ---

  /** Called when SDK initialization completes */
  onReady?: () => void;

  /** Called if SDK initialization fails */
  onError?: (error: Error) => void;
}

/**
 * Self-contained Squad Sports experience.
 *
 * Drop this into any React Native app. Three integration levels:
 *
 * **Simplest (Nexus partner):**
 * ```tsx
 * <SquadExperience partnerId="acme-sports" />
 * ```
 *
 * **With Ticketmaster SSO:**
 * ```tsx
 * <SquadExperience partnerId="acme-sports" ssoToken={tmToken} />
 * ```
 *
 * **Full control:**
 * ```tsx
 * <SquadExperience config={{ apiKey: '...', environment: 'production', community: { ... } }} />
 * ```
 */
export function SquadExperience({
  partnerId,
  apiKey,
  ssoToken,
  ssoProvider,
  userData,
  pushToken,
  config: configProp,
  onReady,
  onError,
}: SquadExperienceProps) {
  const [resolvedConfig, setResolvedConfig] = useState<SquadSDKConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      setError(null);

      try {
        let sdkConfig: SquadConfig;

        if (configProp) {
          // Full config provided
          sdkConfig = configProp;
        } else if (partnerId) {
          if (!apiKey) {
            throw new Error(
              '[SquadExperience] apiKey is required when using partnerId. Get your key at partners.squadforsports.com',
            );
          }
          // Simple partner path
          sdkConfig = {
            partnerId,
            apiKey,
            ssoToken,
            ssoProvider: ssoProvider ?? (ssoToken ? 'ticketmaster' : undefined),
            userData,
          };
        } else {
          throw new Error(
            '[SquadExperience] Either partnerId or config is required.',
          );
        }

        const sdk = await SquadSportsSDK.setup(sdkConfig);

        // Register push token if provided
        if (pushToken) {
          const platform = require('react-native').Platform.OS === 'ios' ? 'ios' : 'android';
          sdk.apiClient.updateDeviceInfo(pushToken, platform);
        }

        setResolvedConfig(sdk.config);
        onReady?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    };

    init();
  }, [partnerId, ssoToken, ssoProvider, userData, retryCount]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#1D1D1D', borderRadius: 12, padding: 24, maxWidth: 320 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF4478', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>!</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>
            Unable to load Squad
          </Text>
          <Text style={{ color: '#8A8A8A', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
            {error.message}
          </Text>
          <Pressable
            onPress={() => setRetryCount(c => c + 1)}
            style={{ backgroundColor: '#6E82E7', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!resolvedConfig) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6E82E7" />
      </View>
    );
  }

  return (
    <ScreenErrorBoundary screenName="SquadExperience">
      <SquadProvider config={resolvedConfig}>
        <SquadNavigationContainer />
      </SquadProvider>
    </ScreenErrorBoundary>
  );
}
