/**
 * Navigation atoms.
 * Ported from squad-demo/src/atoms/navigation.ts + onboarding.ts + post-onboarding.ts.
 */
import { atom } from 'recoil';

export type ScreenName = string;

export const currentStack = atom<ScreenName[]>({
  key: 'squad-sdk:navigation:currentStack',
  default: [],
});

export const navigationState = atom<'auth' | 'onboarding' | 'main'>({
  key: 'squad-sdk:navigation:state',
  default: 'auth',
});

// Onboarding step tracking
export type OnboardingStep =
  | 'welcome'
  | 'teamSelect'
  | 'accountSetup'
  | 'complete';

export const reOnboardingStep = atom<OnboardingStep>({
  key: 'squad-sdk:onboarding:step',
  default: 'welcome',
});

export const rePostOnboardingLoadingActive = atom<boolean>({
  key: 'squad-sdk:onboarding:postLoadingActive',
  default: false,
});
