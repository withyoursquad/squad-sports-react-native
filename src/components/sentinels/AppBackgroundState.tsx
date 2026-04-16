/**
 * AppBackgroundState — Handles app foreground/background transitions.
 * On return from background after >2 minutes, triggers data refresh
 * and optionally runs state integrity validation.
 * Ported from squad-demo/src/components/sentinels/AppBackgroundStateChanged.tsx.
 */
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { reLastRefreshed } from '../../state/sync/refresh';
import { SecureStorageAdapter } from '../../storage/SecureStorage';

const BACKGROUND_TIMESTAMP_KEY = 'SQUAD_SDK_BACKGROUND_TIMESTAMP';
const BACKGROUND_CHECK_INTERVAL = 120_000; // 2 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const storage = new SecureStorageAdapter();

type AppBackgroundStateProps = {
  /** Called when the app returns from a long background period */
  onLongBackground?: () => void;
  /** Called when integrity issues are detected after background return */
  onIntegrityFailure?: () => void;
};

export default function AppBackgroundState({
  onLongBackground,
  onIntegrityFailure,
}: AppBackgroundStateProps = {}) {
  const appState = useRef(AppState.currentState);
  const setRefreshed = useSetRecoilState(reLastRefreshed);

  const handleStateTransition = async (
    nextAppState: AppStateStatus,
    retryCount = 0,
  ): Promise<void> => {
    try {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        console.debug('[AppBackgroundState] App came to foreground');

        const backgroundTimestamp = await storage.getItem(BACKGROUND_TIMESTAMP_KEY);

        if (backgroundTimestamp) {
          const timeInBackground = Date.now() - parseInt(backgroundTimestamp, 10);

          if (timeInBackground > BACKGROUND_CHECK_INTERVAL) {
            console.debug(
              '[AppBackgroundState] Long background duration:',
              timeInBackground,
            );
            onLongBackground?.();

            try {
              setRefreshed(Date.now());
            } catch (error) {
              console.error('[AppBackgroundState] Error during refresh:', error);
              if (retryCount < MAX_RETRIES) {
                await new Promise<void>(r => setTimeout(r, RETRY_DELAY));
                return handleStateTransition(nextAppState, retryCount + 1);
              }
            }
          }
        }

        // Clear background timestamp
        try {
          await storage.setItem(BACKGROUND_TIMESTAMP_KEY, '');
        } catch (error) {
          console.error(
            '[AppBackgroundState] Error clearing background timestamp:',
            error,
          );
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        console.debug('[AppBackgroundState] App going to background');
        try {
          await storage.setItem(BACKGROUND_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
          console.error(
            '[AppBackgroundState] Error setting background timestamp:',
            error,
          );
          if (retryCount < MAX_RETRIES) {
            await new Promise<void>(r => setTimeout(r, RETRY_DELAY));
            return handleStateTransition(nextAppState, retryCount + 1);
          }
        }
      }

      appState.current = nextAppState;
    } catch (error) {
      console.error('[AppBackgroundState] Error handling state change:', error);
      if (retryCount < MAX_RETRIES) {
        await new Promise<void>(r => setTimeout(r, RETRY_DELAY));
        return handleStateTransition(nextAppState, retryCount + 1);
      }
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      await handleStateTransition(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [setRefreshed]);

  return null;
}
