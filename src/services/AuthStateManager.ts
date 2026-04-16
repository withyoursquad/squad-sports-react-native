/**
 * AuthStateManager — manages email/phone session creation and verification.
 * Ported from squad-demo/src/services/AuthStateManager.ts.
 */
import type { SquadApiClient, CreateSessionStatus } from '@squad-sports/core';

export interface AuthState {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  hasDisplayName: boolean;
  currentAccessToken: string | null;
  currentUserId: string | null;
  isLoading: boolean;
}

/**
 * Create a new email session — sends magic link or OTP code.
 */
export async function createEmailSession(
  email: string,
  client: SquadApiClient,
  isFromMagicLink: boolean = false,
  firstName?: string,
): Promise<boolean> {
  try {
    const { CreateSessionRequest } = await import('@squad-sports/core');
    const request = new CreateSessionRequest({ email });

    const headers: Record<string, string> = {};
    if (firstName) headers['X-First-Name'] = firstName;

    const response = await client.createSessionV2(request, headers);
    return !!response;
  } catch (error) {
    console.error('[AuthStateManager] createEmailSession error:', error);
    return false;
  }
}

/**
 * Create a new phone session — sends SMS OTP code.
 */
export async function createPhoneSession(
  phone: string,
  client: SquadApiClient,
): Promise<boolean> {
  try {
    const { CreateSessionRequest } = await import('@squad-sports/core');
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const request = new CreateSessionRequest({ phone: formattedPhone });
    const response = await client.createSessionV2(request);
    return !!response;
  } catch (error) {
    console.error('[AuthStateManager] createPhoneSession error:', error);
    return false;
  }
}

/**
 * Verify a session with an OTP code.
 */
export async function fulfillSession(
  params: { phone?: string; email?: string; code: string },
  client: SquadApiClient,
): Promise<{ success: boolean; accessToken?: string; userId?: string }> {
  try {
    const { CreateSessionRequest, CreateSessionStatus } = await import('@squad-sports/core');
    const formattedPhone = params.phone
      ? params.phone.startsWith('+') ? params.phone : `+${params.phone}`
      : undefined;

    const request = new CreateSessionRequest({
      phone: formattedPhone,
      email: params.email,
      code: params.code.trim(),
    });

    const response = await client.fulfillSessionV2(request);

    if (response?.status === 1 && response?.accessToken) { // ACTIVE = 1
      return {
        success: true,
        accessToken: response.accessToken,
        userId: (response as any).userId,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('[AuthStateManager] fulfillSession error:', error);
    return { success: false };
  }
}
