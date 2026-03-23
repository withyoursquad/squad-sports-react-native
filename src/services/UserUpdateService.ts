/**
 * UserUpdateService — handles user profile updates with retry logic.
 * Ported from squad-demo/src/services/UserUpdateService.ts.
 */
import type { SquadApiClient, User } from '@squad-sports/core';

/**
 * Update user profile with automatic retry on failure.
 */
export async function updateUser(
  client: SquadApiClient,
  user: User,
  maxRetries: number = 2,
): Promise<User | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.updateLoggedInUser(user);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise<void>(r => setTimeout(() => r(), 1000 * (attempt + 1)));
      }
    }
  }

  console.error('[UserUpdateService] All retry attempts failed:', lastError);
  return null;
}
