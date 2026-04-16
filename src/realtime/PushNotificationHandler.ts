import { EventProcessor } from './EventProcessor';

export type NotificationType =
  | 'message'
  | 'squad_invite'
  | 'incoming_call'
  | 'poll'
  | 'freestyle'
  | 'reaction';

export interface PushNotificationPayload {
  type: NotificationType;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface NotificationRouteAction {
  screen: string;
  params?: Record<string, string>;
}

/**
 * Handles incoming push notifications and routes them to the correct screen.
 * Integrators should call `handleNotification()` from their notification handler.
 *
 * Usage:
 * ```ts
 * import { PushNotificationHandler } from '@squad-sports/react-native';
 *
 * // In your app's notification handler:
 * Notifications.addNotificationResponseReceivedListener(response => {
 *   const data = response.notification.request.content.data;
 *   const action = PushNotificationHandler.handleNotification(data);
 *   if (action) {
 *     navigation.navigate(action.screen, action.params);
 *   }
 * });
 * ```
 */
export class PushNotificationHandler {
  /**
   * Process a push notification payload and return the navigation action.
   */
  static handleNotification(
    payload: PushNotificationPayload | Record<string, string>,
  ): NotificationRouteAction | null {
    const type = (payload as any).type as NotificationType;
    const data = (payload as any).data ?? payload;

    switch (type) {
      case 'message':
        return {
          screen: 'Messaging',
          params: { connectionId: data.connectionId ?? data.connection_id },
        };

      case 'squad_invite':
        return {
          screen: 'Home',
        };

      case 'incoming_call': {
        // Emit call event to EventProcessor for the IncomingCallOverlay
        EventProcessor.shared.emitter.emit('incoming_call', {
          callerId: data.callerId ?? data.caller_id,
          callerName: data.callerName ?? data.caller_name,
          connectionId: data.connectionId ?? data.connection_id,
          title: data.title,
        });
        return null; // IncomingCallOverlay handles this
      }

      case 'poll':
        return {
          screen: 'PollResponse',
          params: { pollId: data.pollId ?? data.poll_id },
        };

      case 'freestyle':
        return {
          screen: 'Home',
        };

      case 'reaction':
        if (data.connectionId || data.connection_id) {
          return {
            screen: 'Messaging',
            params: { connectionId: data.connectionId ?? data.connection_id },
          };
        }
        return { screen: 'Home' };

      default:
        return null;
    }
  }

  /**
   * Register for push notifications.
   * Call this after authentication.
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      const Notifications = await import('expo-notifications');

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch {
      return null;
    }
  }
}
