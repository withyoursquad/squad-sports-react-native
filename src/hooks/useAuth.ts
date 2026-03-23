/**
 * Auth hook — provides auth state from Recoil atoms.
 * Ported from squad-demo/src/hooks/useAuth.ts.
 */
import { useRecoilValue } from 'recoil';
import { reActiveAccessToken, reActiveUserId, reAuthHydrated } from '../state/session';
import { reUserCache } from '../state/user';
import type { User } from '@squad-sports/core';

export function useAuth() {
  const accessToken = useRecoilValue(reActiveAccessToken);
  const userId = useRecoilValue(reActiveUserId);
  const hydrated = useRecoilValue(reAuthHydrated);
  const user = useRecoilValue(reUserCache);

  return {
    isAuthenticated: !!accessToken && !!userId,
    isLoading: !hydrated,
    accessToken,
    userId,
    user: user as User | null,
  };
}
