import { Linking } from 'react-native';

export interface DeepLinkRoute {
  screen: string;
  params?: Record<string, string>;
}

const SQUAD_SCHEME = 'squad';
const UNIVERSAL_LINK_HOST = 'app.withyoursquad.com';

/**
 * Parses Squad deep links and universal links into navigation actions.
 *
 * Supported URLs:
 * - squad://invite/{code}
 * - squad://profile/{userId}
 * - squad://message/{connectionId}
 * - squad://poll/{pollId}
 * - https://app.withyoursquad.com/invite/{code}
 * - https://app.withyoursquad.com/profile/{userId}
 */
export class DeepLinkHandler {
  private static listener: ReturnType<typeof Linking.addEventListener> | null = null;

  /**
   * Parse a URL into a navigation route.
   */
  static parseUrl(url: string): DeepLinkRoute | null {
    try {
      let path: string;

      if (url.startsWith(`${SQUAD_SCHEME}://`)) {
        path = url.replace(`${SQUAD_SCHEME}://`, '');
      } else if (url.includes(UNIVERSAL_LINK_HOST)) {
        const urlObj = new URL(url);
        path = urlObj.pathname.replace(/^\//, '');
      } else {
        return null;
      }

      const segments = path.split('/').filter(Boolean);
      if (segments.length === 0) return null;

      const [type, id] = segments;

      switch (type) {
        case 'invite':
          return id ? { screen: 'Invite', params: { code: id } } : { screen: 'Invite' };
        case 'profile':
          return id ? { screen: 'Profile', params: { userId: id } } : null;
        case 'message':
        case 'messaging':
          return id ? { screen: 'Messaging', params: { connectionId: id } } : null;
        case 'poll':
          return id ? { screen: 'PollResponse', params: { pollId: id } } : null;
        case 'event':
        case 'events':
          return { screen: 'Events' };
        case 'wallet':
          return { screen: 'Wallet' };
        case 'freestyle':
          return { screen: 'FreestyleCreate' };
        default:
          return { screen: 'Home' };
      }
    } catch {
      return null;
    }
  }

  /**
   * Start listening for deep links.
   * Returns a cleanup function.
   */
  static startListening(onRoute: (route: DeepLinkRoute) => void): () => void {
    // Handle initial URL (cold start)
    Linking.getInitialURL().then(url => {
      if (url) {
        const route = DeepLinkHandler.parseUrl(url);
        if (route) onRoute(route);
      }
    });

    // Handle URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const route = DeepLinkHandler.parseUrl(url);
      if (route) onRoute(route);
    });

    return () => subscription.remove();
  }

  /**
   * React Navigation linking config for automatic deep link handling.
   */
  static get linkingConfig() {
    return {
      prefixes: [`${SQUAD_SCHEME}://`, `https://${UNIVERSAL_LINK_HOST}`],
      config: {
        screens: {
          Home: '',
          Invite: 'invite/:code?',
          Profile: 'profile/:userId',
          Messaging: 'message/:connectionId',
          PollResponse: 'poll/:pollId',
          Events: 'events',
          Wallet: 'wallet',
          FreestyleCreate: 'freestyle',
        },
      },
    };
  }
}
