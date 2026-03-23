import { PushNotificationHandler } from '../realtime/PushNotificationHandler';

describe('PushNotificationHandler', () => {
  describe('handleNotification', () => {
    test('routes message notification to Messaging screen', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'message',
        connectionId: 'conn-123',
      } as any);
      expect(action).toEqual({
        screen: 'Messaging',
        params: { connectionId: 'conn-123' },
      });
    });

    test('routes message with snake_case key', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'message',
        connection_id: 'conn-456',
      } as any);
      expect(action).toEqual({
        screen: 'Messaging',
        params: { connectionId: 'conn-456' },
      });
    });

    test('routes squad_invite to Home', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'squad_invite',
      } as any);
      expect(action).toEqual({ screen: 'Home' });
    });

    test('routes poll notification to PollResponse', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'poll',
        pollId: 'poll-789',
      } as any);
      expect(action).toEqual({
        screen: 'PollResponse',
        params: { pollId: 'poll-789' },
      });
    });

    test('routes freestyle to Home', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'freestyle',
      } as any);
      expect(action).toEqual({ screen: 'Home' });
    });

    test('routes reaction with connectionId to Messaging', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'reaction',
        connectionId: 'conn-abc',
      } as any);
      expect(action).toEqual({
        screen: 'Messaging',
        params: { connectionId: 'conn-abc' },
      });
    });

    test('routes reaction without connectionId to Home', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'reaction',
      } as any);
      expect(action).toEqual({ screen: 'Home' });
    });

    test('incoming_call returns null (handled by overlay)', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'incoming_call',
        callerId: 'caller-1',
        title: 'Hey!',
      } as any);
      expect(action).toBeNull();
    });

    test('unknown type returns null', () => {
      const action = PushNotificationHandler.handleNotification({
        type: 'unknown_type',
      } as any);
      expect(action).toBeNull();
    });

    test('missing type returns null', () => {
      const action = PushNotificationHandler.handleNotification({} as any);
      expect(action).toBeNull();
    });
  });
});
