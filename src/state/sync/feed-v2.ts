/**
 * Feed sync atoms.
 * Ported from squad-demo/src/atoms/sync/feed-v2.ts.
 */
import { atom, atomFamily, selector } from 'recoil';
import type { Feed, Freestyle, FreestyleReaction } from '@squad-sports/core';
import { type CrdtArray } from './crdt';

// Initial feed from API
export const reInitialFeed = atom<Feed | null>({
  key: 'squad-sdk:feed:initial:v2',
  default: null,
});

// Real-time feed updates
export const feedUpdates = atom<CrdtArray<string, Freestyle>>({
  key: 'squad-sdk:feed:updates',
  default: new Map(),
});

// Feed expiry tick (refreshes every 60s)
export const feedExpiryTickAtom = atom<number>({
  key: 'squad-sdk:feed:expiry-tick',
  default: 0,
});

// Freestyle reactions per freestyle
export const freestyleReactionUpdates = atomFamily<CrdtArray<string, FreestyleReaction>, string>({
  key: 'squad-sdk:freestyle:reactions',
  default: new Map(),
});

// Freestyle-specific state
export const reFreestylePrompts = atom<unknown[]>({
  key: 'squad-sdk:freestyle:prompts',
  default: [],
});

export const reFreestyleCreating = atom<boolean>({
  key: 'squad-sdk:freestyle:creating',
  default: false,
});
