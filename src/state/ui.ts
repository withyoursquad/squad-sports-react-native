/**
 * UI state atoms.
 * Ported from squad-demo/src/atoms/loading-overlay.ts + keyboard.ts + networkBannerState.ts + networkStateAtom.ts.
 */
import { atom } from 'recoil';

// Loading overlay
export const loadingOverlayVisible = atom<boolean>({
  key: 'squad-sdk:loading-overlay:visible',
  default: false,
});

export const loadingOverlayText = atom<string>({
  key: 'squad-sdk:loading-overlay:text',
  default: '',
});

// Keyboard
export const aKeyboardOpen = atom<boolean>({
  key: 'squad-sdk:keyboard:open',
  default: false,
});

// Network banner
export const networkBannerVisible = atom<boolean>({
  key: 'squad-sdk:network:bannerVisible',
  default: false,
});

export const networkStateAtom = atom<{
  isConnected: boolean;
  isInternetReachable: boolean | null;
}>({
  key: 'squad-sdk:network:state',
  default: { isConnected: true, isInternetReachable: true },
});
