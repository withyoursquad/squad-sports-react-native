import { useEffect, useState, useCallback } from 'react';

type NetworkListener = (isOnline: boolean) => void;

/**
 * Monitors network connectivity and notifies listeners.
 * Uses @react-native-community/netinfo when available.
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor | null = null;
  private listeners = new Set<NetworkListener>();
  private isOnline = true;
  private unsubscribe: (() => void) | null = null;

  static get shared(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  async startMonitoring(): Promise<void> {
    try {
      const NetInfo = (await import('@react-native-community/netinfo')).default;
      this.unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
        const online = !!(state.isConnected && state.isInternetReachable !== false);
        this.updateOnlineState(online);
      });
    } catch {
      // NetInfo not available — assume online
      this.isOnline = true;
    }
  }

  stopMonitoring(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  addListener(listener: NetworkListener): void {
    this.listeners.add(listener);
  }

  removeListener(listener: NetworkListener): void {
    this.listeners.delete(listener);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  private updateOnlineState(online: boolean): void {
    if (online === this.isOnline) return;
    this.isOnline = online;

    // Snapshot listeners to avoid mutation during iteration
    const snapshot = [...this.listeners];
    for (const listener of snapshot) {
      listener(online);
    }
  }
}

/**
 * Hook that provides current network connectivity status.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const monitor = NetworkMonitor.shared;
    monitor.startMonitoring();
    setIsOnline(monitor.getIsOnline());

    const listener = (online: boolean) => setIsOnline(online);
    monitor.addListener(listener);

    return () => {
      monitor.removeListener(listener);
    };
  }, []);

  return isOnline;
}
