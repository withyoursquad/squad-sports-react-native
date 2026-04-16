jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(),
    getInitialURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

import { DeepLinkHandler } from '../realtime/DeepLinkHandler';

describe('DeepLinkHandler', () => {
  describe('parseUrl', () => {
    // Squad scheme
    test('parses squad://invite/CODE', () => {
      const route = DeepLinkHandler.parseUrl('squad://invite/ABC123');
      expect(route).toEqual({ screen: 'Invite', params: { code: 'ABC123' } });
    });

    test('parses squad://profile/USER_ID', () => {
      const route = DeepLinkHandler.parseUrl('squad://profile/user-456');
      expect(route).toEqual({ screen: 'Profile', params: { userId: 'user-456' } });
    });

    test('parses squad://message/CONNECTION_ID', () => {
      const route = DeepLinkHandler.parseUrl('squad://message/conn-789');
      expect(route).toEqual({ screen: 'Messaging', params: { connectionId: 'conn-789' } });
    });

    test('parses squad://poll/POLL_ID', () => {
      const route = DeepLinkHandler.parseUrl('squad://poll/poll-101');
      expect(route).toEqual({ screen: 'PollResponse', params: { pollId: 'poll-101' } });
    });

    test('parses squad://events', () => {
      const route = DeepLinkHandler.parseUrl('squad://events');
      expect(route).toEqual({ screen: 'Events' });
    });

    test('parses squad://wallet', () => {
      const route = DeepLinkHandler.parseUrl('squad://wallet');
      expect(route).toEqual({ screen: 'Wallet' });
    });

    test('parses squad://freestyle', () => {
      const route = DeepLinkHandler.parseUrl('squad://freestyle');
      expect(route).toEqual({ screen: 'FreestyleCreate' });
    });

    // Universal links
    test('parses https://app.withyoursquad.com/invite/CODE', () => {
      const route = DeepLinkHandler.parseUrl('https://app.withyoursquad.com/invite/XYZ789');
      expect(route).toEqual({ screen: 'Invite', params: { code: 'XYZ789' } });
    });

    test('parses https://app.withyoursquad.com/profile/USER_ID', () => {
      const route = DeepLinkHandler.parseUrl('https://app.withyoursquad.com/profile/user-123');
      expect(route).toEqual({ screen: 'Profile', params: { userId: 'user-123' } });
    });

    // Edge cases
    test('returns null for unknown scheme', () => {
      expect(DeepLinkHandler.parseUrl('https://random.com/path')).toBeNull();
    });

    test('returns Home for unknown squad path', () => {
      const route = DeepLinkHandler.parseUrl('squad://unknown');
      expect(route).toEqual({ screen: 'Home' });
    });

    test('returns null for empty URL', () => {
      expect(DeepLinkHandler.parseUrl('')).toBeNull();
    });

    test('parses invite without code', () => {
      const route = DeepLinkHandler.parseUrl('squad://invite');
      expect(route).toEqual({ screen: 'Invite' });
    });

    test('profile without userId returns null', () => {
      const route = DeepLinkHandler.parseUrl('squad://profile');
      expect(route).toBeNull();
    });
  });

  describe('linkingConfig', () => {
    test('has correct prefixes', () => {
      const config = DeepLinkHandler.linkingConfig;
      expect(config.prefixes).toContain('squad://');
      expect(config.prefixes).toContain('https://app.withyoursquad.com');
    });

    test('has screen mappings', () => {
      const screens = DeepLinkHandler.linkingConfig.config.screens;
      expect(screens).toHaveProperty('Home');
      expect(screens).toHaveProperty('Invite');
      expect(screens).toHaveProperty('Profile');
      expect(screens).toHaveProperty('Messaging');
      expect(screens).toHaveProperty('PollResponse');
    });
  });
});
