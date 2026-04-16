/**
 * NotificationHandler — Subscribes to push notifications and handles routing.
 * Registers for push tokens, listens for foreground/background notifications,
 * and handles cold-start notification routing.
 * Ported from squad-demo/src/components/sentinels/NotificationHandler.tsx.
 */
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { PushNotificationHandler, type NotificationRouteAction } from '../../realtime/PushNotificationHandler';

type NotificationHandlerProps = {
  /** Called when a notification is tapped and needs navigation */
  onNavigate?: (action: NotificationRouteAction) => void;
  /** Expo project ID for push token registration */
  projectId?: string;
  /** Called on data refresh (e.g., pull-to-refresh trigger) */
  onRefresh?: () => void;
};

export default function NotificationHandler({
  onNavigate,
  projectId,
  onRefresh,
}: NotificationHandlerProps) {
  const [_pushToken, setPushToken] = useState<string | null>(null);
  const foregroundListener = useRef<any>(null);
  const tapListener = useRef<any>(null);

  // 1. Register + get push token
  useEffect(() => {
    PushNotificationHandler.registerForPushNotifications().then(token => {
      setPushToken(token);
      if (token && __DEV__) {
        console.log('[NotificationHandler] Push Token:', token);
      }
    });
  }, []);

  // 2. Foreground listener
  useEffect(() => {
    let Notifications: any = null;
    try {
      Notifications = require('expo-notifications');
    } catch {
      return; // expo-notifications not available
    }

    foregroundListener.current = Notifications!.addNotificationReceivedListener(
      (notification: any) => {
        if (__DEV__) {
          console.log('[NotificationHandler] Foreground notification:', notification);
        }
      },
    );

    return () => {
      if (foregroundListener.current && Notifications) {
        Notifications.removeNotificationSubscription(foregroundListener.current);
      }
    };
  }, []);

  // 3. Tap listener (background or cold start)
  useEffect(() => {
    let Notifications: any = null;
    try {
      Notifications = require('expo-notifications');
    } catch {
      return;
    }

    tapListener.current = Notifications!.addNotificationResponseReceivedListener(
      (response: any) => {
        if (Platform.OS === 'ios') {
          Notifications!.setBadgeCountAsync(0).catch(() => {});
        }

        onRefresh?.();

        const data = response.notification.request.content.data || {};
        const action = PushNotificationHandler.handleNotification(data);

        if (action && onNavigate) {
          onNavigate(action);
        }
      },
    );

    // Cold start check
    const checkColdStart = async () => {
      try {
        const last = await Notifications!.getLastNotificationResponseAsync();
        if (last) {
          if (Platform.OS === 'ios') {
            Notifications!.setBadgeCountAsync(0).catch(() => {});
          }
          const data = last.notification.request.content.data || {};
          const action = PushNotificationHandler.handleNotification(data);

          if (action && onNavigate) {
            // Small timeout ensures navigation state is ready
            setTimeout(() => {
              onNavigate(action);
            }, 500);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.log('[NotificationHandler] Cold start check failed:', error);
        }
      }
    };

    checkColdStart();

    return () => {
      if (tapListener.current && Notifications) {
        Notifications.removeNotificationSubscription(tapListener.current);
      }
    };
  }, [onNavigate, onRefresh]);

  // 4. Clear iOS badge count
  useEffect(() => {
    if (Platform.OS === 'ios') {
      try {
        const Notifications = require('expo-notifications');
        Notifications.setBadgeCountAsync(0).catch(() => {});
      } catch {
        // Not available
      }
    }
  }, []);

  return null;
}
