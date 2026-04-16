# Changelog

All notable changes to the Squad Sports SDK for React Native are documented here.

For the full SDK changelog across all platforms, see [docs.squadforsports.com/changelog](https://docs.squadforsports.com/changelog/).

---

## 1.6.0 — 2026-04-16

### Added
- First partner-review release — full squad-demo parity across React Native, iOS, and Android
- `pushToken` parameter on `setup()` — pass the FCM / APNs token at initialization
- `SquadExperience` component exposes `onReady` and `onError` callbacks
- Partner auth: seamless authentication by passing user data from the host app
- SSO token exchange for Ticketmaster, OAuth2, and custom providers
- Sponsorship placements: branded polls, sponsored cards, banners, and interstitials
- Custom analytics adapter (forward events to Mixpanel, Amplitude, etc.)
- Structured logger with pluggable sinks (Sentry, Datadog, custom)
- `setEnabled()` for GDPR / CCPA analytics consent toggling

### Changed
- `apiKey` is required for all SDK initialization
- Auth tokens stored in `expo-secure-store` (hardware-backed keystore) with `AsyncStorage` fallback for non-sensitive state
- Silent re-auth on 401 / 403 for partner and SSO sessions (no user-visible login re-prompt)

### Security
- Encrypted token storage on device
- Cross-partner data isolation on user lookups
- HTTPS / TLS 1.2+ enforced on all API communication
- 15s global request timeout with exponential-backoff retry on 5xx, honor `Retry-After` on 429

---

## 1.3.x

Earlier versions were distributed privately to internal partners. See the [full changelog](https://docs.squadforsports.com/changelog/) for the complete history.
