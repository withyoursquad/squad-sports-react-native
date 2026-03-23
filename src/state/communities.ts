/**
 * Community atoms.
 * Ported from squad-demo/src/atoms/communities.ts + community-reactions.ts + community-selection.ts + onboarding-community.ts.
 */
import { atom, selector, selectorFamily } from 'recoil';
import type { Community, Communities } from '@squad-sports/core';

export const reAllCommunities = atom<Community[]>({
  key: 'squad-sdk:communities:all',
  default: [],
});

export const reAllCommunitiesByGroups = atom<unknown | undefined>({
  key: 'squad-sdk:communities:byGroup',
  default: undefined,
});

export const reCommunityById = selectorFamily<Community | null, string>({
  key: 'squad-sdk:communities:byId',
  get: (id) => ({ get }) => {
    return get(reAllCommunities).find(c => c.id === id) ?? null;
  },
});

export const reCommunitiesRefresh = atom<number>({
  key: 'squad-sdk:communities:refresh',
  default: 0,
});

export const reUserCommunity = atom<Community | null>({
  key: 'squad-sdk:communities:userCommunity',
  default: null,
});

// Community reactions
export const reCommunityReactions = atom<Map<string, unknown[]>>({
  key: 'squad-sdk:communities:reactions',
  default: new Map(),
});

// Onboarding community selection
export const reOnboardingSelectedCommunity = atom<Community | null>({
  key: 'squad-sdk:onboarding:selectedCommunity',
  default: null,
});
