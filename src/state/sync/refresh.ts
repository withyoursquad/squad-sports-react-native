/**
 * Refresh trigger atom.
 * Ported from squad-demo/src/atoms/sync/refresh.ts.
 */
import { atom } from 'recoil';
import { DependableSelector } from './dependable';

export const reLastRefreshed = atom<number>({
  key: 'squad-sdk:last-refreshed',
  default: Date.now(),
});

export const reRefresh = new DependableSelector<number>({
  key: 'squad-sdk:refresh',
  get: ({ get }) => get(reLastRefreshed),
  set: ({ set }, newValue) => {
    set(reLastRefreshed, typeof newValue === 'number' ? newValue : Date.now());
  },
});

export const reRefreshing = atom<boolean>({
  key: 'squad-sdk:refreshing',
  default: false,
});
