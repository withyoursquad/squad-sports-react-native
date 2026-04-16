/**
 * User created hook — tracks when a new user is created during onboarding.
 * Ported from squad-demo/src/hooks/useUserCreated.ts.
 */
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { reUserCache, reLoggedInUserLoaded } from '../state/user';
import { reActiveAccessToken, reActiveUserId } from '../state/session';
import type { User } from '@squad-sports/core';

export function useUserCreated() {
  const setUserCache = useSetRecoilState(reUserCache);
  const setUserLoaded = useSetRecoilState(reLoggedInUserLoaded);
  const setAccessToken = useSetRecoilState(reActiveAccessToken);
  const setUserId = useSetRecoilState(reActiveUserId);

  const onUserCreated = useCallback((user: User, accessToken: string) => {
    setUserCache(user);
    setUserLoaded(true);
    if (user.id) setUserId(user.id);
    setAccessToken(accessToken);
  }, [setUserCache, setUserLoaded, setAccessToken, setUserId]);

  return { onUserCreated };
}
