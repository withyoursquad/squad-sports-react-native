/**
 * UpdateDeviceInfo — Sends device info to server on app start / token refresh.
 * Ported from squad-demo/src/components/sentinels/UpdateDeviceInfo.tsx.
 */
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { reActiveAccessToken } from '../../state/session';
import { reUserCache } from '../../state/user';
import { reDeviceInfo } from '../../state/device-info';
import { useApiClient } from '../../SquadProvider';

export default function UpdateDeviceInfo() {
  const apiClient = useApiClient();
  const accessToken = useRecoilValue(reActiveAccessToken);
  const loggedInUser = useRecoilValue(reUserCache) as any;
  const setDeviceInfo = useSetRecoilState(reDeviceInfo);

  useEffect(() => {
    if (!accessToken || !loggedInUser?.id || !apiClient) {
      return;
    }

    const update = async () => {
      try {
        const { Platform } = require('react-native');

        let deviceModel = '';
        let appVersion = '0.1.0';
        let pushToken: string | null = null;

        try {
          const Device = require('expo-device');
          deviceModel = Device?.modelName ?? '';
        } catch {
          // expo-device not available
        }

        try {
          const Constants = require('expo-constants').default;
          appVersion = Constants?.expoConfig?.version ?? '0.1.0';
        } catch {
          // expo-constants not available
        }

        try {
          const { PushNotificationHandler } = require('../../realtime/PushNotificationHandler');
          pushToken = await PushNotificationHandler.registerForPushNotifications();
        } catch {
          // Push not available
        }

        const info = {
          platform: Platform.OS,
          osVersion: String(Platform.Version ?? ''),
          appVersion,
          deviceModel,
          pushToken,
        };

        setDeviceInfo(info);

        // Send to server
        const { DeviceInfo } = await import('@squad-sports/core');
        const deviceInfoProto = new DeviceInfo({
          osName: info.platform,
          osVersion: info.osVersion,
          appVersion: info.appVersion,
          modelName: info.deviceModel,
          ...(info.pushToken ? (info.platform === 'ios' ? { apnsToken: info.pushToken } : { fcmToken: info.pushToken }) : {}),
        });
        await apiClient.updateDeviceInfo(deviceInfoProto);
        console.log('[UpdateDeviceInfo] Device info synced successfully');
      } catch (error) {
        console.error('[UpdateDeviceInfo] Failed to update device info:', error);
      }
    };

    update();
  }, [accessToken, loggedInUser?.id, apiClient, setDeviceInfo]);

  return null;
}
