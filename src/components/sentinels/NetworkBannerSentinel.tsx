/**
 * NetworkBannerSentinel — Monitors network connectivity and API client state.
 * Shows/hides network status banner with debouncing for sporadic mobile connections.
 * Ported from squad-demo/src/components/sentinels/NetworkBannerSentinel.tsx.
 */
import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { networkBannerVisible, networkStateAtom } from '../../state/ui';
import { EventProcessor } from '../../realtime/EventProcessor';

const DEBOUNCE_DISCONNECT = 3000; // 3s before showing offline banner
const DEBOUNCE_RECONNECT = 2000;  // 2s before hiding banner on reconnect

export default function NetworkBannerSentinel() {
  const setBannerVisible = useSetRecoilState(networkBannerVisible);
  const setNetworkState = useSetRecoilState(networkStateAtom);
  const disconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOnline = useRef(true);
  const apiConnected = useRef(true);
  const disconnectCount = useRef(0);

  const clearAllTimers = () => {
    if (disconnectTimer.current) {
      clearTimeout(disconnectTimer.current);
      disconnectTimer.current = null;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const showBanner = () => {
    setBannerVisible(true);
  };

  const hideBanner = () => {
    setBannerVisible(false);
  };

  const handleDisconnect = () => {
    clearAllTimers();
    apiConnected.current = false;
    disconnectCount.current++;

    disconnectTimer.current = setTimeout(() => {
      if (!apiConnected.current) {
        if (!isOnline.current) {
          setNetworkState({ isConnected: false, isInternetReachable: false });
          showBanner();
        } else if (disconnectCount.current >= 2) {
          setNetworkState({ isConnected: true, isInternetReachable: false });
          showBanner();
        }
      }
    }, DEBOUNCE_DISCONNECT);
  };

  const handleReconnect = () => {
    clearAllTimers();
    apiConnected.current = true;
    disconnectCount.current = 0;

    reconnectTimer.current = setTimeout(() => {
      setNetworkState({ isConnected: true, isInternetReachable: true });
      hideBanner();
    }, DEBOUNCE_RECONNECT);
  };

  useEffect(() => {
    const processor = EventProcessor.shared;

    // Subscribe to EventProcessor connection state changes
    const onDisconnect = () => handleDisconnect();
    const onReconnect = () => handleReconnect();

    processor.emitter.on('disconnect', onDisconnect);
    processor.emitter.on('reconnect', onReconnect);
    processor.emitter.on('connected', onReconnect);

    // Subscribe to NetInfo if available
    let unsubscribeNetInfo: (() => void) | null = null;
    try {
      const NetInfo = require('@react-native-community/netinfo');
      unsubscribeNetInfo = NetInfo.addEventListener((state: any) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        isOnline.current = online;
        setNetworkState({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable,
        });

        if (!online) {
          if (!disconnectTimer.current) {
            disconnectTimer.current = setTimeout(() => {
              if (!isOnline.current) {
                showBanner();
              }
            }, DEBOUNCE_DISCONNECT);
          }
        } else if (apiConnected.current) {
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
          }
          reconnectTimer.current = setTimeout(() => {
            hideBanner();
          }, DEBOUNCE_RECONNECT);
        }
      });
    } catch {
      // NetInfo not available — rely on EventProcessor events only
    }

    return () => {
      clearAllTimers();
      processor.emitter.off('disconnect', onDisconnect);
      processor.emitter.off('reconnect', onReconnect);
      processor.emitter.off('connected', onReconnect);
      unsubscribeNetInfo?.();
    };
  }, [setBannerVisible, setNetworkState]);

  return null;
}
