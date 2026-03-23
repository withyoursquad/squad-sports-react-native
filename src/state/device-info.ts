/**
 * Device info atoms.
 * Ported from squad-demo/src/atoms/device-info.ts.
 */
import { atom } from 'recoil';

export const reDeviceInfo = atom<{
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  pushToken: string | null;
}>({
  key: 'squad-sdk:device:info',
  default: {
    platform: '',
    osVersion: '',
    appVersion: '',
    deviceModel: '',
    pushToken: null,
  },
});
