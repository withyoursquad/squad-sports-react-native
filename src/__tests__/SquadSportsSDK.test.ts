import { SquadSportsSDK } from '../SquadSportsSDK';
import {
  SquadApiClient,
  SessionManager,
  SSOManager,
  PartnerAuthManager,
  TokenStorage,
  InMemoryStorage,
  AnalyticsTracker,
  Logger,
  NexusPartnerRegistry,
} from '@squad-sports/core';

// --- Mock all @squad-sports/core classes ---

jest.mock('@squad-sports/core', () => {
  const mockApiClient = {
    currentToken: null as string | null,
    baseUrl: 'https://api.test.com',
    updateAccessToken: jest.fn(),
    clearAuthState: jest.fn(),
    cancelAllRequests: jest.fn(),
    clearAllCaches: jest.fn(),
    setSilentReAuth: jest.fn(),
  };

  const mockSessionManager = {
    validateSession: jest.fn().mockResolvedValue(true),
  };

  const mockSSOManager = {
    authenticate: jest.fn().mockResolvedValue({ success: true }),
    authenticateWithToken: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockPartnerAuthManager = {
    syncUser: jest.fn().mockResolvedValue({ success: true, userId: 'user-123' }),
  };

  const mockTokenStorage = {
    getAccessToken: jest.fn().mockResolvedValue(null),
    getUserId: jest.fn().mockResolvedValue(null),
    getCommunityId: jest.fn().mockResolvedValue(null),
    setCommunityId: jest.fn().mockResolvedValue(undefined),
    setPartnerId: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  };

  const mockAnalytics = {
    configure: jest.fn(),
    track: jest.fn(),
    setUserId: jest.fn(),
    destroy: jest.fn(),
  };

  const mockLogger = {
    configure: jest.fn(),
    setUserId: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  return {
    SquadApiClient: jest.fn(() => mockApiClient),
    SessionManager: jest.fn(() => mockSessionManager),
    SSOManager: jest.fn(() => mockSSOManager),
    PartnerAuthManager: jest.fn(() => mockPartnerAuthManager),
    TokenStorage: jest.fn(() => mockTokenStorage),
    InMemoryStorage: jest.fn(),
    NexusPartnerRegistry: {
      resolve: jest.fn().mockResolvedValue({
        apiKey: 'resolved-key',
        environment: 'staging',
        partnerAuth: {
          partnerId: 'test-partner',
          communityId: 'test-community',
        },
      }),
    },
    AnalyticsTracker: {
      shared: mockAnalytics,
    },
    Logger: {
      shared: mockLogger,
    },
    isPartnerConfig: jest.fn((c: any) => !!c.partnerId && !c.apiKey),
    getApiBaseUrl: jest.fn(() => 'https://api.test.com'),
  };
});

// Helper to get mock instances from the module mock
function getMockApiClient() {
  return (SquadApiClient as unknown as jest.Mock).mock.results[0]?.value ?? (SquadApiClient as any)();
}

function getMockTokenStorage() {
  return (TokenStorage as unknown as jest.Mock).mock.results[0]?.value ?? (TokenStorage as any)();
}

function getMockPartnerAuth() {
  return (PartnerAuthManager as unknown as jest.Mock).mock.results[0]?.value ?? (PartnerAuthManager as any)();
}

describe('SquadSportsSDK', () => {
  beforeEach(() => {
    // Reset the singleton
    if (SquadSportsSDK.isInitialized) {
      SquadSportsSDK.reset();
    }

    // Clear all mock call data
    jest.clearAllMocks();

    // Reset mock defaults
    const tokenStorage = (TokenStorage as any)();
    tokenStorage.getAccessToken.mockResolvedValue(null);
    tokenStorage.getUserId.mockResolvedValue(null);
    tokenStorage.getCommunityId.mockResolvedValue(null);

    const apiClient = (SquadApiClient as any)();
    apiClient.currentToken = null;

    const partnerAuth = (PartnerAuthManager as any)();
    partnerAuth.syncUser.mockResolvedValue({ success: true, userId: 'user-123' });
  });

  // --- setup() ---

  describe('setup()', () => {
    const fullConfig = {
      partnerId: 'test-partner',
      apiKey: 'test-key',
      environment: 'staging' as const,
      partnerAuth: {
        partnerId: 'test-partner',
        communityId: 'test-community',
        userData: { externalId: 'ext-1', email: 'test@example.com' },
      },
    };

    test('configures analytics and logger', async () => {
      await SquadSportsSDK.setup(fullConfig);

      expect(AnalyticsTracker.shared.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          partnerId: 'test-partner',
          enabled: true,
        }),
      );
      expect(Logger.shared.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          partnerId: 'test-partner',
          environment: 'staging',
        }),
      );
    });

    test('restores session and tracks session_restored', async () => {
      const tokenStorage = (TokenStorage as any)();
      tokenStorage.getAccessToken.mockResolvedValue('saved-token');
      tokenStorage.getUserId.mockResolvedValue('user-42');

      const apiClient = (SquadApiClient as any)();
      // After restoreSession sets the token, currentToken should return it
      apiClient.updateAccessToken.mockImplementation((t: string) => {
        apiClient.currentToken = t;
      });

      await SquadSportsSDK.setup(fullConfig);

      expect(AnalyticsTracker.shared.track).toHaveBeenCalledWith('session_restored');
      expect(AnalyticsTracker.shared.setUserId).toHaveBeenCalledWith('user-42');
      expect(Logger.shared.setUserId).toHaveBeenCalledWith('user-42');
    });

    test('partner sync success tracks partner_sync_success', async () => {
      await SquadSportsSDK.setup(fullConfig);

      expect(AnalyticsTracker.shared.track).toHaveBeenCalledWith(
        'partner_sync_success',
        expect.objectContaining({ partnerId: 'test-partner' }),
      );
    });

    test('partner sync failure tracks partner_sync_failed', async () => {
      const partnerAuth = (PartnerAuthManager as any)();
      partnerAuth.syncUser.mockResolvedValue({ success: false });

      await SquadSportsSDK.setup(fullConfig);

      expect(AnalyticsTracker.shared.track).toHaveBeenCalledWith(
        'partner_sync_failed',
        expect.objectContaining({ partnerId: 'test-partner' }),
      );
    });

    test('wires silent re-auth on apiClient when userData provided', async () => {
      await SquadSportsSDK.setup(fullConfig);

      const apiClient = (SquadApiClient as any)();
      expect(apiClient.setSilentReAuth).toHaveBeenCalledWith(expect.any(Function));
    });

    test('does not wire silent re-auth when no userData', async () => {
      const configNoUserData = {
        partnerId: 'test-partner',
        apiKey: 'test-key',
        environment: 'staging' as const,
      };

      await SquadSportsSDK.setup(configNoUserData);

      const apiClient = (SquadApiClient as any)();
      expect(apiClient.setSilentReAuth).not.toHaveBeenCalled();
    });

    test('tracks sdk_initialized at the end', async () => {
      await SquadSportsSDK.setup(fullConfig);

      expect(AnalyticsTracker.shared.track).toHaveBeenCalledWith(
        'sdk_initialized',
        expect.objectContaining({
          partnerId: 'test-partner',
          environment: 'staging',
        }),
      );
    });
  });

  // --- reset() ---

  describe('reset()', () => {
    test('destroys analytics and clears caches', async () => {
      const config = { partnerId: 'test', apiKey: 'k', environment: 'staging' as const };
      await SquadSportsSDK.setup(config);

      jest.clearAllMocks();
      SquadSportsSDK.reset();

      const apiClient = (SquadApiClient as any)();
      expect(apiClient.cancelAllRequests).toHaveBeenCalled();
      expect(apiClient.clearAllCaches).toHaveBeenCalled();
      expect(AnalyticsTracker.shared.destroy).toHaveBeenCalled();
      expect(SquadSportsSDK.isInitialized).toBe(false);
    });
  });

  // --- initialize() ---

  describe('initialize()', () => {
    test('prevents double-init and returns existing instance', () => {
      const config = { apiKey: 'k', environment: 'staging' as const, community: { id: 'c1', name: 'Test', primaryColor: '#000' } } as any;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const first = SquadSportsSDK.initialize(config);
      const second = SquadSportsSDK.initialize(config);

      expect(first).toBe(second);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already initialized'),
      );

      warnSpy.mockRestore();
    });
  });

  // --- shared ---

  describe('shared', () => {
    test('throws when not initialized', () => {
      expect(() => SquadSportsSDK.shared).toThrow('Not initialized');
    });

    test('returns instance when initialized', () => {
      const config = { apiKey: 'k', environment: 'staging' as const, community: { id: 'c1', name: 'Test', primaryColor: '#000' } } as any;
      SquadSportsSDK.initialize(config);
      expect(SquadSportsSDK.shared).toBeDefined();
    });
  });
});
