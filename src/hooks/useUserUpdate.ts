/**
 * User update hook — updates user profile and syncs state.
 * Ported from squad-demo/src/hooks/useUserUpdate.ts.
 */
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { useApiClient } from '../SquadProvider';
import { reUserCache } from '../state/user';
import { updateUser } from '../services/UserUpdateService';
import type { User } from '@squad-sports/core';

export function useUserUpdate() {
  const apiClient = useApiClient();
  const setUserCache = useSetRecoilState(reUserCache);

  const update = useCallback(async (user: User): Promise<User | null> => {
    const result = await updateUser(apiClient, user);
    if (result) {
      setUserCache(result);
    }
    return result;
  }, [apiClient, setUserCache]);

  return { updateUser: update };
}
