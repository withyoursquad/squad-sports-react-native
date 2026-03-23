/**
 * Auth/Session atoms.
 * Ported from squad-demo/src/atoms/session.ts.
 *
 * Uses SecureStorageAdapter for all auth key persistence so that
 * sensitive values (tokens, user IDs, email, phone) are stored in
 * encrypted storage (expo-secure-store) rather than plain AsyncStorage.
 */
import { atom, type AtomEffect } from 'recoil';
import { SecureStorageAdapter } from '../storage/SecureStorage';

// --- Shared secure storage instance for Recoil effects ---
const secureStorage = new SecureStorageAdapter();

// --- Storage hydration tracking ---

const storageHydrationComplete = new Map<string, boolean>();
const storageLoadingPromises = new Map<string, Promise<string | null>>();
const CRITICAL_STORAGE_KEYS = ['SQUAD_SDK_AUTH_TOKEN', 'SQUAD_SDK_AUTH_USER_ID'];

function markStorageKeyLoaded(key: string) {
  storageHydrationComplete.set(key, true);
}

/**
 * Secure storage persistence effect.
 * Uses SecureStorageAdapter which routes sensitive keys through
 * expo-secure-store and non-sensitive keys through AsyncStorage.
 */
function secureStorageEffect(storageKey: string): AtomEffect<string | null> {
  return ({ setSelf, onSet, trigger }) => {
    let isInitialLoad = true;

    if (trigger === 'get') {
      // Dedup concurrent loads
      if (storageLoadingPromises.has(storageKey)) {
        storageLoadingPromises.get(storageKey)!.then(val => {
          setSelf(val);
          isInitialLoad = false;
          markStorageKeyLoaded(storageKey);
        });
        return;
      }

      const loadingPromise = secureStorage.getItem(storageKey).catch(() => null);

      storageLoadingPromises.set(storageKey, loadingPromise);

      loadingPromise.then(val => {
        setSelf(val);
        storageLoadingPromises.delete(storageKey);
        markStorageKeyLoaded(storageKey);
        isInitialLoad = false;
      });
    }

    onSet(async newValue => {
      try {
        if (!newValue && !isInitialLoad) {
          await secureStorage.removeItem(storageKey);
        } else if (newValue) {
          await secureStorage.setItem(storageKey, newValue);
        }
      } catch {}
      setSelf(newValue);
    });
  };
}

function secureStorageObjectEffect<T>(storageKey: string): AtomEffect<T> {
  return ({ setSelf, onSet, trigger }) => {
    let isInitialLoad = true;

    if (trigger === 'get') {
      (async () => {
        try {
          const val = await secureStorage.getItem(storageKey);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object') {
              setSelf(parsed);
            }
          }
        } catch {}
        isInitialLoad = false;
      })();
    }

    onSet(async newValue => {
      if (!isInitialLoad && newValue && typeof newValue === 'object') {
        try {
          await secureStorage.setItem(storageKey, JSON.stringify(newValue));
        } catch {}
      }
      setSelf(newValue);
    });
  };
}

function secureStorageArrayEffect<T>(storageKey: string): AtomEffect<T[]> {
  return ({ setSelf, onSet, trigger }) => {
    let isInitialLoad = true;

    if (trigger === 'get') {
      (async () => {
        try {
          const val = await secureStorage.getItem(storageKey);
          if (val) setSelf(JSON.parse(val));
        } catch {}
        isInitialLoad = false;
      })();
    }

    onSet(async newValue => {
      try {
        if ((!newValue || (newValue as T[]).length === 0) && !isInitialLoad) {
          await secureStorage.removeItem(storageKey);
        } else if (newValue) {
          await secureStorage.setItem(storageKey, JSON.stringify(newValue));
        }
      } catch {}
      setSelf(newValue);
    });
  };
}

// --- Session atoms ---

export const reActivePhoneNumber = atom<string | null>({
  key: 'squad-sdk:auth:phone',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_PHONE')],
});

export const reActiveEmail = atom<string | null>({
  key: 'squad-sdk:auth:email',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_EMAIL')],
});

export const reActiveCode = atom<string | null>({
  key: 'squad-sdk:auth:code',
  default: null,
});

export const reActiveAccessToken = atom<string | null>({
  key: 'squad-sdk:session:activeAccessToken',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_TOKEN')],
});

export const reActiveUserId = atom<string | null>({
  key: 'squad-sdk:session:activeUserId',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_USER_ID')],
});

export const reUserRefresh = atom<number>({
  key: 'squad-sdk:session:userRefresh',
  default: 0,
});

export const reAuthHydrated = atom<boolean>({
  key: 'squad-sdk:auth:hydrated',
  default: false,
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger === 'get') {
        const check = async () => {
          await new Promise<void>(r => setTimeout(() => r(), 50));
          const maxWait = 2000;
          const start = Date.now();
          while (Date.now() - start < maxWait) {
            if (CRITICAL_STORAGE_KEYS.every(k => storageHydrationComplete.get(k))) {
              setSelf(true);
              return;
            }
            await new Promise<void>(r => setTimeout(() => r(), 50));
          }
          setSelf(true); // Timeout — proceed anyway
        };
        check();
      }
    },
  ],
});

export const reActiveCommunityId = atom<string | null>({
  key: 'squad-sdk:session:activeCommunityId',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_COMMUNITY_ID')],
});

export const reActivePartnerId = atom<string | null>({
  key: 'squad-sdk:session:activePartnerId',
  default: null,
  effects: [secureStorageEffect('SQUAD_SDK_AUTH_PARTNER_ID')],
});

export const rePendingNavigation = atom<{
  hasPendingInviter: boolean;
  inviterId?: string;
}>({
  key: 'squad-sdk:session:pendingNavigation',
  default: { hasPendingInviter: false },
  effects: [secureStorageObjectEffect('SQUAD_SDK_PENDING_NAVIGATION')],
});

export type AttemptedVerification = { key: string; timestamp: number };
export const ATTEMPTED_VERIFICATION_WINDOW_MS = 10 * 60 * 1000;

export const reAttemptedVerifications = atom<AttemptedVerification[]>({
  key: 'squad-sdk:auth:attempted-verifications',
  default: [],
  effects: [secureStorageArrayEffect('SQUAD_SDK_ATTEMPTED_VERIFICATIONS')],
});

export function pruneExpiredAttemptedVerifications(
  entries: AttemptedVerification[],
  now: number = Date.now(),
): AttemptedVerification[] {
  return entries.filter(e => now - e.timestamp < ATTEMPTED_VERIFICATION_WINDOW_MS);
}
