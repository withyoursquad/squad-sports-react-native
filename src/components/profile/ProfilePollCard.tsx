/**
 * ProfilePollCard - Poll card variant for profile activity tab.
 * Ported from squad-demo/src/screens/profile/slivers/Poll.tsx.
 */
import React from 'react';

export type ProfilePollCardUser = {
  id: string;
  displayName: string;
  imageUrl?: string | null;
};

export type ProfilePollCardPoll = {
  id: string;
  [key: string]: unknown;
};

export type ProfilePollCardProps = {
  isMyProfile: boolean;
  poll: ProfilePollCardPoll;
  user: ProfilePollCardUser;
  collectionId?: string;
  /** Render component for the user's own active poll card. */
  MyPollCardComponent?: React.ComponentType<{
    poll: ProfilePollCardPoll;
    collectionId?: string;
  }>;
  /** Render component for another user's active poll card. */
  SquaddyPollCardComponent?: React.ComponentType<{
    poll: ProfilePollCardPoll;
    user: ProfilePollCardUser;
    collectionId?: string;
  }>;
};

export default function ProfilePollCard({
  isMyProfile,
  poll,
  user,
  collectionId,
  MyPollCardComponent,
  SquaddyPollCardComponent,
}: ProfilePollCardProps) {
  if (isMyProfile && MyPollCardComponent) {
    return (
      <MyPollCardComponent
        key={`poll-${poll.id}`}
        poll={poll}
        collectionId={collectionId}
      />
    );
  }

  if (!isMyProfile && SquaddyPollCardComponent) {
    return (
      <SquaddyPollCardComponent
        key={`poll-${poll.id}`}
        poll={poll}
        user={user}
        collectionId={collectionId}
      />
    );
  }

  // Fallback: return null if no render components provided
  return null;
}
