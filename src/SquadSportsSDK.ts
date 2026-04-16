import {
  SquadApiClient,
  SessionManager,
  SSOManager,
  TokenStorage,
  InMemoryStorage,
  NexusPartnerRegistry,
  PartnerAuthManager,
  AnalyticsTracker,
  Logger,
  getApiBaseUrl,
  isPartnerConfig,
} from '@squad-sports/core';
import type {
  SquadSDKConfig,
  SquadPartnerConfig,
  SquadConfig,
  StorageAdapter,
} from '@squad-sports/core';
import { SecureStorageAdapter } from './storage/SecureStorage';

/**
 * Main entry point for the Squad Sports SDK.
 *
 * Two ways to initialize:
 *
 * **Simple (recommended):** Just provide your partner ID.
 * Everything auto-resolves from the Nexus partner registry.
 * ```ts
 * await SquadSportsSDK.setup({ partnerId: 'acme-sports' });
 * ```
 *
 * **With SSO:** Pass a Ticketmaster (or other) token and users are auto-authenticated.
 * ```ts
 * await SquadSportsSDK.setup({
 *   partnerId: 'acme-sports',
 *   ssoToken: ticketmasterAccessToken,
 *   ssoProvider: 'ticketmaster',
 * });
 * ```
 *
 * **Full control:** Provide every config value manually.
 * ```ts
 * SquadSportsSDK.initialize({ apiKey: '...', environment: 'production', community: { ... } });
 * ```
 */
export class SquadSportsSDK {
  private static instance: SquadSportsSDK | null = null;

  readonly config: SquadSDKConfig;
  readonly apiClient: SquadApiClient;
  readonly sessionManager: SessionManager;
  readonly ssoManager: SSOManager;
  readonly partnerAuthManager: PartnerAuthManager;
  readonly tokenStorage: TokenStorage;

  private constructor(config: SquadSDKConfig) {
    this.config = config;

    const storage: StorageAdapter = config.storage ?? new SecureStorageAdapter();
    this.tokenStorage = new TokenStorage(storage);

    const baseUrl = getApiBaseUrl(config.environment, config.apiBaseUrl);

    this.apiClient = new SquadApiClient({
      baseUrl,
      apiKey: config.apiKey,
    });

    this.sessionManager = new SessionManager(this.apiClient, this.tokenStorage);
    this.ssoManager = new SSOManager(this.apiClient, this.tokenStorage);
    this.partnerAuthManager = new PartnerAuthManager(this.apiClient, this.tokenStorage);
  }

  // --- Initialization paths ---

  /**
   * RECOMMENDED: One-step async setup.
   * Accepts either a simple partnerId config or a full config.
   * Resolves partner config from Nexus, restores session, and handles SSO.
   */
  static async setup(config: SquadConfig): Promise<SquadSportsSDK> {
    let resolvedConfig: SquadSDKConfig;

    if (isPartnerConfig(config)) {
      // Simple path — resolve everything from partner ID
      resolvedConfig = await NexusPartnerRegistry.resolve(config);
    } else {
      resolvedConfig = config;
    }

    SquadSportsSDK.reset();
    const sdk = new SquadSportsSDK(resolvedConfig);
    SquadSportsSDK.instance = sdk;

    // Configure logger
    Logger.shared.configure({
      partnerId: resolvedConfig.partnerAuth?.partnerId,
      environment: resolvedConfig.environment,
    });

    // Configure analytics
    AnalyticsTracker.shared.configure({
      apiClient: sdk.apiClient,
      partnerId: resolvedConfig.partnerAuth?.partnerId,
      enabled: true,
    });

    // Auto-restore previous session
    const restored = await sdk.restoreSession();

    if (restored) {
      AnalyticsTracker.shared.track('session_restored');
      const userId = await sdk.tokenStorage.getUserId();
      if (userId) {
        AnalyticsTracker.shared.setUserId(userId);
        Logger.shared.setUserId(userId);
      }
    }

    // If restored, check community scoping — re-auth if community changed
    if (restored && resolvedConfig.partnerAuth?.communityId) {
      const storedCommunityId = await sdk.tokenStorage.getCommunityId();
      if (storedCommunityId && storedCommunityId !== resolvedConfig.partnerAuth.communityId) {
        await sdk.tokenStorage.clearAll();
        sdk.apiClient.clearAuthState();
      }
    }

    // Auto-authenticate via SSO if configured
    if (resolvedConfig.sso?.accessToken && !sdk.apiClient.currentToken) {
      await sdk.ssoManager.authenticate(resolvedConfig.sso);
      AnalyticsTracker.shared.track('sso_login', { provider: resolvedConfig.sso.provider });
      // Persist community/partner context after SSO
      if (resolvedConfig.partnerAuth && sdk.apiClient.currentToken) {
        await sdk.tokenStorage.setCommunityId(resolvedConfig.partnerAuth.communityId);
        await sdk.tokenStorage.setPartnerId(resolvedConfig.partnerAuth.partnerId);
      }
    }

    // Partner user sync — if userData provided and still no valid token
    if (resolvedConfig.partnerAuth?.userData && !sdk.apiClient.currentToken) {
      const syncResult = await sdk.partnerAuthManager.syncUser(
        resolvedConfig.partnerAuth.partnerId,
        resolvedConfig.partnerAuth.communityId,
        resolvedConfig.partnerAuth.userData,
      );
      if (syncResult.success) {
        AnalyticsTracker.shared.track('partner_sync_success', { partnerId: resolvedConfig.partnerAuth.partnerId });
        if (syncResult.userId) {
          AnalyticsTracker.shared.setUserId(syncResult.userId);
          Logger.shared.setUserId(syncResult.userId);
        }
      } else {
        AnalyticsTracker.shared.track('partner_sync_failed', { partnerId: resolvedConfig.partnerAuth.partnerId });
        Logger.shared.warn('Partner user sync failed. User will be directed to auth screen.');
      }
    }

    // Wire silent re-auth on 401 (interceptor-level, can retry original request)
    // Supports both partner sync and SSO token refresh
    const ssoConfig = resolvedConfig.sso;
    const partnerAuth = resolvedConfig.partnerAuth;
    const hasPartnerUserData = !!partnerAuth?.userData;
    const hasSSOToken = !!ssoConfig?.accessToken;

    if (hasPartnerUserData || hasSSOToken) {
      sdk.apiClient.setSilentReAuth(async () => {
        // Try partner re-auth first (most reliable — server-side user sync)
        if (hasPartnerUserData && partnerAuth?.userData) {
          Logger.shared.info('Attempting silent partner re-auth');
          const reSync = await sdk.partnerAuthManager.syncUser(
            partnerAuth.partnerId,
            partnerAuth.communityId,
            partnerAuth.userData,
          );
          if (reSync.success) {
            Logger.shared.info('Silent partner re-auth succeeded');
            return true;
          }
        }

        // Try SSO token re-exchange (works if the external SSO token is still valid)
        if (hasSSOToken && ssoConfig) {
          Logger.shared.info('Attempting silent SSO re-auth');
          try {
            const result = await sdk.ssoManager.authenticate(ssoConfig);
            if (result?.success) {
              Logger.shared.info('Silent SSO re-auth succeeded');
              // Persist community/partner context after SSO refresh
              if (partnerAuth && sdk.apiClient.currentToken) {
                await sdk.tokenStorage.setCommunityId(partnerAuth.communityId);
                await sdk.tokenStorage.setPartnerId(partnerAuth.partnerId);
              }
              return true;
            }
          } catch {
            Logger.shared.warn('Silent SSO re-auth failed');
          }
        }

        Logger.shared.warn('All silent re-auth attempts failed');
        return false;
      });
    }

    AnalyticsTracker.shared.track('sdk_initialized', {
      partnerId: resolvedConfig.partnerAuth?.partnerId,
      environment: resolvedConfig.environment,
    });

    return sdk;
  }

  /**
   * Synchronous initialization with full config (no auto-resolution).
   * Use this when you already have all config values.
   */
  static initialize(config: SquadSDKConfig): SquadSportsSDK {
    if (SquadSportsSDK.instance) {
      console.warn('[SquadSportsSDK] Already initialized. Call reset() first to reinitialize.');
      return SquadSportsSDK.instance;
    }

    SquadSportsSDK.instance = new SquadSportsSDK(config);
    return SquadSportsSDK.instance;
  }

  /**
   * Get the current SDK instance. Throws if not initialized.
   */
  static get shared(): SquadSportsSDK {
    if (!SquadSportsSDK.instance) {
      throw new Error(
        '[SquadSportsSDK] Not initialized. Call SquadSportsSDK.setup() or SquadSportsSDK.initialize() first.',
      );
    }
    return SquadSportsSDK.instance;
  }

  static get isInitialized(): boolean {
    return SquadSportsSDK.instance !== null;
  }

  static reset(): void {
    if (SquadSportsSDK.instance) {
      SquadSportsSDK.instance.apiClient.cancelAllRequests();
      SquadSportsSDK.instance.apiClient.clearAllCaches();
      AnalyticsTracker.shared.destroy();
    }
    SquadSportsSDK.instance = null;
  }

  // --- Session ---

  /**
   * Restore a previous session from stored tokens.
   */
  async restoreSession(): Promise<boolean> {
    const token = await this.tokenStorage.getAccessToken();
    if (!token) return false;

    this.apiClient.updateAccessToken(token);
    const isValid = await this.sessionManager.validateSession();

    if (!isValid) {
      await this.tokenStorage.clearAll();
      this.apiClient.clearAuthState();
      return false;
    }

    return true;
  }

  /**
   * Authenticate via SSO with an external token.
   * Convenience method for post-initialization SSO.
   */
  async authenticateWithSSO(
    provider: 'ticketmaster' | 'oauth2' | 'custom',
    token: string,
  ): Promise<boolean> {
    const result = await this.ssoManager.authenticateWithToken(provider, token);
    return result.success;
  }
}
