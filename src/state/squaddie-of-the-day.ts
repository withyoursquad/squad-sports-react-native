/**
 * Squaddie of the Day atoms.
 * Ported from squad-demo/src/atoms/squaddie-of-the-day.ts + sotd-animation.ts.
 */
import { atom } from 'recoil';
import type { SquaddieOfTheDay } from '@squad-sports/core';

export const reSquaddieOfTheDay = atom<SquaddieOfTheDay | null>({
  key: 'squad-sdk:sotd:data',
  default: null,
});

export const reSOTDAnimationShown = atom<boolean>({
  key: 'squad-sdk:sotd:animationShown',
  default: false,
});

export const reSOTDIntroShown = atom<boolean>({
  key: 'squad-sdk:sotd:introShown',
  default: false,
});
