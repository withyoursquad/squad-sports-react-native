/**
 * UserDataManager — manages loading/caching user data with storage sync.
 * Ported from squad-demo/src/services/UserDataManager.ts.
 */
import type { SquadApiClient, User } from '@squad-sports/core';

class UserDataManager {
  private cachedUser: User | null = null;

  async loadUserData(client: SquadApiClient): Promise<User | null> {
    try {
      const user = await client.getLoggedInUser();
      if (user) {
        this.cachedUser = user;
        await this.persistUser(user);
      }
      return user;
    } catch (error) {
      console.error('[UserDataManager] Error loading user:', error);
      return this.cachedUser;
    }
  }

  getCachedUser(): User | null {
    return this.cachedUser;
  }

  setCachedUser(user: User): void {
    this.cachedUser = user;
  }

  clearCache(): void {
    this.cachedUser = null;
  }

  private async persistUser(user: User): Promise<void> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('SQUAD_SDK_CACHED_USER', JSON.stringify(user));
      if (user.id) {
        await AsyncStorage.setItem('SQUAD_SDK_AUTH_USER_ID', user.id);
      }
    } catch {}
  }

  async loadCachedUser(): Promise<User | null> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const raw = await AsyncStorage.getItem('SQUAD_SDK_CACHED_USER');
      if (raw) {
        this.cachedUser = JSON.parse(raw);
        return this.cachedUser;
      }
    } catch {}
    return null;
  }
}

export const userDataManager = new UserDataManager();
