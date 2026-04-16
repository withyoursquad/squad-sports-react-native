/**
 * Onboarding step guard — ensures users can't skip onboarding steps.
 * Ported from squad-demo/src/hooks/useOnboardingStepGuard.ts.
 */
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigation } from '@react-navigation/native';
import { reActiveAccessToken, reActiveUserId } from '../state/session';
import { reUserCache } from '../state/user';

export function useOnboardingStepGuard(requiredStep: 'token' | 'displayName' | 'community') {
  const navigation = useNavigation();
  const token = useRecoilValue(reActiveAccessToken);
  const userId = useRecoilValue(reActiveUserId);
  const user = useRecoilValue(reUserCache);

  useEffect(() => {
    switch (requiredStep) {
      case 'token':
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: 'Landing' as never }] });
        }
        break;
      case 'displayName':
        if (!token || !user?.displayName) {
          navigation.reset({ index: 0, routes: [{ name: 'OnboardingWelcome' as never }] });
        }
        break;
      case 'community':
        if (!token || !user?.community) {
          navigation.reset({ index: 0, routes: [{ name: 'OnboardingTeamSelect' as never }] });
        }
        break;
    }
  }, [token, userId, user, requiredStep, navigation]);
}
