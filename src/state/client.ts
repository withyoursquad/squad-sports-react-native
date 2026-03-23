/**
 * API client selectors.
 * Ported from squad-demo/src/atoms/client.ts.
 */
import { selector } from 'recoil';
import { reActiveAccessToken } from './session';
import { configApp } from './features';

// Preferred API environment
export const rePreferredApiEnvironment = selector<string>({
  key: 'squad-sdk:client:preferredApiEnvironment',
  get: ({ get }) => {
    const config = get(configApp);
    return config.apiEnvironments[0]?.squadApiBaseUrl ?? 'https://api-release.withyoursquad.com';
  },
});

// Client selector that creates API client from current token + environment
export const reAnyClient = selector<{ baseUrl: string; accessToken: string | null }>({
  key: 'squad-sdk:client:any',
  get: ({ get }) => {
    const accessToken = get(reActiveAccessToken);
    const baseUrl = get(rePreferredApiEnvironment);
    return { baseUrl, accessToken };
  },
});
