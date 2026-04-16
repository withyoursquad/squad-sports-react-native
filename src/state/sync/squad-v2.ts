/**
 * Squad/connections sync atoms.
 * Ported from squad-demo/src/atoms/sync/squad-v2.ts.
 */
import { atom } from 'recoil';
import type { Squad, Connection } from '@squad-sports/core';
import { type CrdtArray } from './crdt';

// Initial connections from API
export const reInitialConnections = atom<Squad | null>({
  key: 'squad-sdk:squad:initial',
  default: null,
});

// Real-time connection updates
export const reConnectionUpdates = atom<CrdtArray<string, Connection>>({
  key: 'squad-sdk:squad:updates',
  default: new Map(),
});

// Connection by user ID
export const reConnectionWithUser = atom<Map<string, Connection>>({
  key: 'squad-sdk:squad:connectionByUser',
  default: new Map(),
});
