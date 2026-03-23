/**
 * Pending navigation hook — handles post-onboarding redirects.
 * Ported from squad-demo/src/hooks/usePendingNavigation.ts.
 */
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { rePendingNavigation } from '../state/session';
import { useNavigation } from '@react-navigation/native';

export function usePendingNavigation() {
  const [pending, setPending] = useRecoilState(rePendingNavigation);
  const navigation = useNavigation();

  const executePendingNavigation = useCallback(() => {
    if (pending.hasPendingInviter && pending.inviterId) {
      (navigation as any).navigate('Profile', { userId: pending.inviterId });
      setPending({ hasPendingInviter: false });
    }
  }, [pending, setPending, navigation]);

  const setPendingInviter = useCallback((inviterId: string) => {
    setPending({ hasPendingInviter: true, inviterId });
  }, [setPending]);

  return { pending, executePendingNavigation, setPendingInviter };
}
