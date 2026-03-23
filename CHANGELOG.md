# Changelog

All notable changes to the Squad Sports SDK are documented here.

---

## 1.3.1 — 2026-03-24

### Added
- Sponsorship placement framework: branded polls, sponsored content cards, chat-adjacent banners, and interstitial moments
- Impression tracking with batched reporting
- `setEnabled()` method for GDPR/CCPA analytics consent toggling
- Silent re-auth for SSO sessions (in addition to partner sync)
- Error message + retry button on SDK initialization failure
- Full API parity across React Native, iOS, and Android

### Fixed
- Partner dashboard URL in error messages (now partners.squadforsports.com)
- Auth tokens now stored in encrypted storage on all platforms
- Community-scoped user search (partner data isolation)

---

## 1.3.0 — 2026-03-23

### Added
- Partner auth: seamless authentication by passing user data from host app (no login screen)
- SSO token exchange for Ticketmaster, OAuth2, and custom providers
- Silent re-authentication on 401/403 for partner flows (automatic token refresh)
- Structured logger with pluggable sinks (Sentry, Datadog, custom)
- Custom analytics adapter support (forward events to Mixpanel, Amplitude, etc.)

### Changed
- API key now required for all partner SDK initialization
- Provision endpoint requires authenticated API key (prevents config leakage)
- Auth cache moved from in-memory to Redis (supports multi-instance deployments)
- Rate limiting moved from in-memory to Redis (survives server restarts)
- OTP codes now generated with cryptographically secure randomness

### Security
- Encrypted token storage on all platforms (Keychain, EncryptedSharedPreferences, expo-secure-store)
- Cross-partner data isolation on user lookups (community-scoped)
- OTP rate limiting: 3 attempts/minute, 10/hour per identifier
- Security headers on all API responses (HSTS, X-Frame-Options, nosniff)
- Sanitized error responses (no PII in error payloads)
- CORS restricted to authorized origins

---

## 1.2.0 — 2026-03-19

### Added
- Partner provisioning endpoint (`GET /v2/partners/:partnerId/provision`)
- Partner user sync endpoint (`POST /v2/auth/partner-sync`)
- SSO token exchange endpoint (`POST /v2/auth/sso/:provider`)
- Partner analytics ingestion endpoint
- Nexus partner registry: auto-resolve config from partner ID
- Community-scoped onboarding skip for partner flows

### Changed
- Navigation state machine supports partner flow (auth -> main, skip onboarding)
- API client sends `X-Squad-API-Key` header when configured

---

## 1.1.0 — 2026-03-12

### Added
- Android SDK: Jetpack Compose UI, OkHttp networking, EncryptedSharedPreferences
- iOS SDK: SwiftUI screens, URLSession networking, Keychain storage
- Real-time SSE event processor with deduplication and reconnect backoff
- Network monitoring with offline action queue
- Push notification routing
- Deep link handling (squad:// scheme and universal links)
- Squad Line: real-time voice calls via Twilio

### Changed
- EventProcessor deduplication uses TTL-based pruning (1 hour expiry, 5K cap)
- Upload requests use 30s timeout (vs 15s default)

---

## 1.0.0 — 2026-02-28

### Added
- React Native SDK: `<SquadExperience>` drop-in component
- Core TypeScript package: API client, session management, token storage
- Community feed with freestyles (audio posts) and reactions
- 1:1 messaging with audio messages
- Interactive polls with live results
- Event attendance and check-ins
- Wallet with rewards and coupons
- User profiles and connections (squad)
- Invitation system with QR codes
- Squaddie of the Day feature
- Error boundaries on all navigator screens
- 15s global request timeout with exponential backoff retry
- 429 rate limit handling with Retry-After
- SDK version header on all requests
