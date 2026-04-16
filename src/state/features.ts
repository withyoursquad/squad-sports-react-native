/**
 * Feature flag and config atoms.
 * Ported from squad-demo/src/atoms/features.ts + config-app.ts + config-squad.ts + developer-access.ts + app-store.ts.
 */
import { atom, selector } from 'recoil';

// Feature flags
export const featureFlags = atom<Record<string, boolean>>({
  key: 'squad-sdk:features:flags',
  default: {
    squadLine: false,
    freestyle: true,
    messaging: true,
    polls: true,
    events: true,
    wallet: false,
  },
});

// App config
export interface ApiEnvironment {
  squadApiBaseUrl: string;
  name: string;
}

export const configApp = atom<{
  apiEnvironments: ApiEnvironment[];
}>({
  key: 'squad-sdk:config:app',
  default: {
    apiEnvironments: [{ squadApiBaseUrl: 'https://api-release.withyoursquad.com', name: 'production' }],
  },
});

// Developer access
export const developerAccessEnabled = atom<boolean>({
  key: 'squad-sdk:developer:access',
  default: false,
});

// App store version
export const reLatestAppStoreVersion = atom<string | null>({
  key: 'squad-sdk:appStore:latestVersion',
  default: null,
});

// Session count
export const sessionCount = atom<number>({
  key: 'squad-sdk:session:count',
  default: 0,
});

// Prerelease
export const rePrereleaseEnabled = atom<boolean>({
  key: 'squad-sdk:features:prerelease',
  default: false,
});
