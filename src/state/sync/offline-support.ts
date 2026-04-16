/**
 * Offline support atoms.
 * Ported from squad-demo/src/atoms/sync/offline-support.ts.
 */
import { atom } from 'recoil';

export type OfflineActionType =
  | 'message:create'
  | 'freestyle:create'
  | 'poll:response'
  | 'connection:invite'
  | 'message:reaction'
  | 'freestyle:reaction'
  | 'user:update';

export interface QueuedOfflineAction {
  id: string;
  type: OfflineActionType;
  payload: unknown;
  createdAt: number;
  attempts: number;
}

export const isOnlineAtom = atom<boolean>({
  key: 'squad-sdk:network:isOnline',
  default: true,
});

export const pendingActionsAtom = atom<QueuedOfflineAction[]>({
  key: 'squad-sdk:offline:pendingActions',
  default: [],
});

export const offlineCacheAtom = atom<Map<string, { data: unknown; timestamp: number }>>({
  key: 'squad-sdk:offline:cache',
  default: new Map(),
});

export const shouldUseOfflineDataSelector = atom<boolean>({
  key: 'squad-sdk:offline:shouldUseOfflineData',
  default: false,
});
