/**
 * ProfilePollCollection - Collection of polls on profile.
 * Ported from squad-demo/src/screens/profile/slivers/PollCollection.tsx.
 */
import React, { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import ProfilePollCard, {
  ProfilePollCardPoll,
  ProfilePollCardUser,
} from './ProfilePollCard';

export type PollCollectionData = {
  id: string;
  polls: ProfilePollCardPoll[];
};

export type ProfilePollCollectionProps = {
  collection: PollCollectionData;
  isMyProfile: boolean;
  user: ProfilePollCardUser;
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

export default function ProfilePollCollection({
  collection,
  isMyProfile,
  user,
  MyPollCardComponent,
  SquaddyPollCardComponent,
}: ProfilePollCollectionProps) {
  const filteredPolls = useMemo(
    () =>
      collection.polls.filter((poll) => {
        const startTime = (poll as any).startingAt
          ? new Date((poll as any).startingAt)
          : null;
        return !(startTime && startTime > new Date());
      }),
    [collection.polls],
  );

  const renderPoll = useCallback(
    ({ item: poll }: { item: ProfilePollCardPoll }) => (
      <ProfilePollCard
        key={`profile-collection-${collection.id}-${poll.id}`}
        isMyProfile={isMyProfile}
        poll={poll}
        user={user}
        collectionId={collection.id}
        MyPollCardComponent={MyPollCardComponent}
        SquaddyPollCardComponent={SquaddyPollCardComponent}
      />
    ),
    [collection.id, isMyProfile, user, MyPollCardComponent, SquaddyPollCardComponent],
  );

  if (filteredPolls.length === 0) {
    return null;
  }

  if (filteredPolls.length === 1) {
    return renderPoll({ item: filteredPolls[0]! });
  }

  return (
    <FlatList
      data={filteredPolls}
      keyExtractor={(poll) => `profile-collection-${collection.id}-${poll.id}`}
      renderItem={renderPoll}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
}
