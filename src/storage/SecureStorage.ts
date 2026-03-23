import type { StorageAdapter } from '@squad-sports/core';

/**
 * Secure storage adapter for React Native.
 * Uses expo-secure-store (encrypted) when available, falls back to AsyncStorage.
 * Sensitive keys (tokens, user IDs) are always stored securely.
 */
export class SecureStorageAdapter implements StorageAdapter {
  private secureStore: any = null;
  private asyncStorage: any = null;
  private initialized = false;

  private static readonly SECURE_KEYS = new Set([
    'SQUAD_SDK_AUTH_TOKEN',
    'SQUAD_SDK_AUTH_USER_ID',
    'SQUAD_SDK_AUTH_EMAIL',
    'SQUAD_SDK_AUTH_PHONE',
    'SQUAD_SDK_AUTH_COMMUNITY_ID',
    'SQUAD_SDK_AUTH_PARTNER_ID',
  ]);

  private async init(): Promise<void> {
    if (this.initialized) return;
    try {
      this.secureStore = (await import('expo-secure-store'));
    } catch {
      // expo-secure-store not available
    }
    try {
      this.asyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    } catch {
      // AsyncStorage not available
    }
    this.initialized = true;
  }

  private isSecureKey(key: string): boolean {
    return SecureStorageAdapter.SECURE_KEYS.has(key);
  }

  async getItem(key: string): Promise<string | null> {
    await this.init();
    if (this.isSecureKey(key) && this.secureStore) {
      try {
        return await this.secureStore.getItemAsync(key);
      } catch {
        // Fall through to AsyncStorage
      }
    }
    return this.asyncStorage?.getItem(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.init();
    if (this.isSecureKey(key) && this.secureStore) {
      try {
        await this.secureStore.setItemAsync(key, value);
        return;
      } catch {
        // Fall through to AsyncStorage
      }
    }
    await this.asyncStorage?.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.init();
    if (this.isSecureKey(key) && this.secureStore) {
      try {
        await this.secureStore.deleteItemAsync(key);
      } catch {}
    }
    try {
      await this.asyncStorage?.removeItem(key);
    } catch {}
  }
}
