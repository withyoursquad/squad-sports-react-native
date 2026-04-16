/**
 * User state atoms.
 * Ported from squad-demo/src/atoms/user.ts + user-tag.ts + sync/user-v2.ts.
 */
import { atom, atomFamily, selectorFamily } from 'recoil';
import type { User } from '@squad-sports/core';
import { type CrdtArray, type CrdtArrayItem } from './sync/crdt';

// Logged-in user cache
export const reUserCache = atom<User | null>({
  key: 'squad-sdk:user:cache',
  default: null,
});

export const reLoggedInUserLoaded = atom<boolean>({
  key: 'squad-sdk:user:loaded',
  default: false,
});

// Per-user updates from SSE
export const userUpdates = atomFamily<CrdtArrayItem<User> | null, string>({
  key: 'squad-sdk:user:updates',
  default: null,
});

// User by ID (selector family)
export const reUser = selectorFamily<User | null, string>({
  key: 'squad-sdk:user:byId',
  get: (id) => ({ get }) => {
    const cache = get(reUserCache);
    if (cache?.id === id) return cache;
    return null; // Would need API call for other users
  },
});

// User tag
export const reUserTag = atom<string | null>({
  key: 'squad-sdk:user:tag',
  default: null,
});

// Sophia (AI assistant)
export const reSophiaUser = atom<User | null>({
  key: 'squad-sdk:user:sophia',
  default: null,
});
