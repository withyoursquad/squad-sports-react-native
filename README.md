# Squad Sports SDK for React Native

[![npm version](https://img.shields.io/npm/v/@squad-sports/react-native.svg)](https://www.npmjs.com/package/@squad-sports/react-native)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://docs.squadforsports.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Add fan engagement features to your sports app in minutes. Drop in a single component and get messaging, polls, freestyles, voice calling, sponsorship inventory, and real-time updates.

## Installation

```bash
npm install @squad-sports/react-native @squad-sports/core
```

### Peer Dependencies

```bash
npm install react-native-gesture-handler react-native-safe-area-context \
  @react-navigation/native @react-navigation/native-stack \
  @react-native-async-storage/async-storage @gorhom/bottom-sheet \
  recoil react-native-sse expo-secure-store expo-av expo-image
```

## Quick Start

```tsx
import { SquadExperience } from '@squad-sports/react-native';

export default function App() {
  return (
    <SquadExperience
      partnerId="your-partner-id"
      apiKey="your-api-key"
    />
  );
}
```

That's it. The SDK auto-resolves your community config, theming, and features from your partner ID.

### With Ticketmaster SSO

```tsx
<SquadExperience
  partnerId="your-partner-id"
  apiKey="your-api-key"
  ssoToken={ticketmasterAccessToken}
/>
```

### With Seamless Partner Auth (No Login Screen)

```tsx
<SquadExperience
  partnerId="your-partner-id"
  apiKey="your-api-key"
  userData={{
    email: user.email,
    displayName: user.name,
    externalUserId: user.id,
  }}
/>
```

## Features

- **Messaging** — 1:1 messaging with audio messages and reactions
- **Polls** — Interactive polls with live results and branded sponsor polls
- **Freestyles** — Audio posts with community-wide sharing
- **Squad Line** — Real-time voice calls via Twilio
- **Events** — Event attendance and check-ins
- **Wallet** — Rewards, coupons, and sponsor promotions
- **Sponsorship** — In-app sponsorship inventory (branded polls, content cards, banners, interstitials)
- **Real-Time** — Server-sent events with offline queueing
- **Analytics** — 28 event types with custom adapter support (Mixpanel, Amplitude)
- **SSO** — Ticketmaster, OAuth2, SAML, and custom providers

## Documentation

Full integration guide, API reference, and configuration options:

**[docs.squadforsports.com](https://docs.squadforsports.com)**

## Requirements

- React Native 0.72+
- React 18+
- iOS 15+ / Android SDK 24+ (Android 7.0)
- Expo SDK 50+ (if using Expo)

## Get Your Partner ID

Register at **[partners.squadforsports.com](https://partners.squadforsports.com)** to get your partner ID and API key.

## License

MIT. See [LICENSE](LICENSE).
