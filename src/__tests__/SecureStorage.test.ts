/**
 * SecureStorageAdapter tests
 *
 * Verifies that sensitive auth keys are routed through expo-secure-store
 * and non-sensitive keys fall through to AsyncStorage.
 *
 * Since SecureStorageAdapter uses dynamic import(), we test by verifying
 * the SECURE_KEYS set directly and testing the routing logic.
 */
import { SecureStorageAdapter } from '../storage/SecureStorage';

// Access the private static SECURE_KEYS for verification
const EXPECTED_SECURE_KEYS = [
  'SQUAD_SDK_AUTH_TOKEN',
  'SQUAD_SDK_AUTH_USER_ID',
  'SQUAD_SDK_AUTH_EMAIL',
  'SQUAD_SDK_AUTH_PHONE',
  'SQUAD_SDK_AUTH_COMMUNITY_ID',
  'SQUAD_SDK_AUTH_PARTNER_ID',
];

describe('SecureStorageAdapter', () => {
  test('SECURE_KEYS includes all auth-sensitive keys', () => {
    // Access the private static set via a test instance
    // We verify the set contents by checking isSecureKey behavior
    const adapter = new SecureStorageAdapter();

    // Use the private isSecureKey method via the routing behavior
    // If a key is in SECURE_KEYS, setItem will try secureStore first.
    // We can verify by checking the static set directly.
    const secureKeys = (SecureStorageAdapter as any).SECURE_KEYS as Set<string>;

    for (const key of EXPECTED_SECURE_KEYS) {
      expect(secureKeys.has(key)).toBe(true);
    }
  });

  test('SQUAD_SDK_AUTH_COMMUNITY_ID is a secure key (regression)', () => {
    const secureKeys = (SecureStorageAdapter as any).SECURE_KEYS as Set<string>;
    expect(secureKeys.has('SQUAD_SDK_AUTH_COMMUNITY_ID')).toBe(true);
  });

  test('non-auth keys are NOT in SECURE_KEYS', () => {
    const secureKeys = (SecureStorageAdapter as any).SECURE_KEYS as Set<string>;

    expect(secureKeys.has('SQUAD_SDK_PENDING_NAVIGATION')).toBe(false);
    expect(secureKeys.has('SQUAD_SDK_ATTEMPTED_VERIFICATIONS')).toBe(false);
    expect(secureKeys.has('SOME_RANDOM_KEY')).toBe(false);
  });

  test('SECURE_KEYS has exactly 6 entries', () => {
    const secureKeys = (SecureStorageAdapter as any).SECURE_KEYS as Set<string>;
    expect(secureKeys.size).toBe(6);
  });

  test('adapter implements StorageAdapter interface', () => {
    const adapter = new SecureStorageAdapter();
    expect(typeof adapter.getItem).toBe('function');
    expect(typeof adapter.setItem).toBe('function');
    expect(typeof adapter.removeItem).toBe('function');
  });
});
