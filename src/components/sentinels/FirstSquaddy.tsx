/**
 * FirstSquaddy — Watches for first connection and triggers celebration.
 * Monitors squad members and fires a milestone event when the first
 * accepted connection is detected.
 * Ported from squad-demo/src/components/sentinels/FirstSquaddy.tsx.
 */
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { reUserCache } from '../../state/user';
import { reInitialConnections } from '../../state/sync/squad-v2';

type FirstSquaddyProps = {
  /** Called when the first squad member connection is detected */
  onFirstSquaddy?: (data: {
    loggedInUser: any;
    squaddyName: string;
    squaddyId: string;
  }) => void;
};

export function WatchForFirstSquaddy({ onFirstSquaddy }: FirstSquaddyProps) {
  const loggedInUser = useRecoilValue(reUserCache) as any;
  const connections = useRecoilValue(reInitialConnections) as any;

  useEffect(() => {
    if (!loggedInUser || !connections || !onFirstSquaddy) return;

    // Extract accepted connections
    const acceptedConnections = (connections?.connections ?? []).filter(
      (c: any) => c.status === 'ACCEPTED' || c.status === 2,
    );

    if (acceptedConnections.length > 0) {
      const firstConnection = acceptedConnections[0];
      // Find the other user in the connection
      const otherUser =
        firstConnection.user1?.id === loggedInUser.id
          ? firstConnection.user2
          : firstConnection.user1;

      if (otherUser && otherUser.attributes?.status === 'active') {
        onFirstSquaddy({
          loggedInUser,
          squaddyName: otherUser.displayName ?? '',
          squaddyId: otherUser.id ?? '',
        });
      }
    }
  }, [loggedInUser, connections, onFirstSquaddy]);

  return null;
}
