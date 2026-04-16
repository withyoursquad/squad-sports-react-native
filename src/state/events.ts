/**
 * Event atoms.
 * Ported from squad-demo/src/atoms/events.ts.
 */
import { atom } from 'recoil';
import type { Events } from '@squad-sports/core';

export const reActiveEvents = atom<Events | null>({
  key: 'squad-sdk:events:active',
  default: null,
});

export const reEventsRefresh = atom<number>({
  key: 'squad-sdk:events:refresh',
  default: 0,
});
