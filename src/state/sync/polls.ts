/**
 * Poll sync atoms.
 * Ported from squad-demo/src/atoms/sync/polls.ts.
 */
import { atom, atomFamily } from 'recoil';
import type { PollFeed, PollResponse, PollResponseReaction } from '@squad-sports/core';
import { type CrdtArray } from './crdt';

// Initial poll feed from API
export const reInitialPollFeed = atom<PollFeed | null>({
  key: 'squad-sdk:polls:active:initial:v2',
  default: null,
});

// Real-time poll updates
export const rePollUpdates = atom<CrdtArray<string, unknown>>({
  key: 'squad-sdk:poll-feed:updates:v2',
  default: new Map(),
});

// Poll response updates per poll
export const rePollResponseUpdates = atomFamily<CrdtArray<string, PollResponse>, string>({
  key: 'squad-sdk:poll:responses:updates:v2',
  default: new Map(),
});

// Poll response reaction updates
export const rePollResponseReactionsUpdates = atomFamily<CrdtArray<string, PollResponseReaction>, string>({
  key: 'squad-sdk:poll:response:reactions:updates',
  default: new Map(),
});

// Poll nudge updates
export const rePollNudgesUpdates = atomFamily<CrdtArray<string, unknown>, string>({
  key: 'squad-sdk:poll:nudges:updates',
  default: new Map(),
});
