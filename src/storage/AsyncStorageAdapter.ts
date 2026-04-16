import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@squad-sports/core';

/**
 * StorageAdapter backed by React Native AsyncStorage.
 *
 * Delegates every operation directly to AsyncStorage so the core
 * package can remain platform-agnostic.
 */
export class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async multiSet(entries: [string, string][]): Promise<void> {
    await AsyncStorage.multiSet(entries);
  }

  async multiRemove(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  }

  async getAllKeys(): Promise<string[]> {
    return (await AsyncStorage.getAllKeys()) as string[];
  }
}
