/**
 * Activity tab for the Lounge view.
 * Ported from squad-demo/src/screens/lounge/Activity.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { useApiClient } from '../../SquadProvider';
import {
  OmniScrollView,
  OmniScrollViewFixedChildSliver,
  type OmniScrollViewSliver,
} from '../OmniScrollView';
import ActivityPanel from './ActivityPanel';
import { TitleMedium, BodyRegular } from '../ux/text/Typography';
import type { User, UserActivity } from '@squad-sports/core';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoungeActivityProps {
  user: User;
  isOwnProfile: boolean;
  onScroll?: (event: any) => void;
}

export default function LoungeActivity({ user, isOwnProfile, onScroll }: LoungeActivityProps) {
  const apiClient = useApiClient();
  const [activityData, setActivityData] = useState<UserActivity | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    apiClient.getUserActivity(user.id)
      .then(setActivityData)
      .catch((err: any) => console.error('[LoungeActivity] Error:', err));
  }, [user?.id, apiClient]);

  if (!activityData) {
    return (
      <View style={styles.emptyContent}>
        <View style={styles.emojiContainer}>
          <TitleMedium>{'👀'}</TitleMedium>
        </View>
        <BodyRegular style={styles.emptyText}>
          {user.displayName ?? 'This user'} doesn't have any activity... yet
        </BodyRegular>
      </View>
    );
  }

  const slivers: Array<OmniScrollViewSliver> = [
    new OmniScrollViewFixedChildSliver('activity', () => (
      <ActivityPanel activityData={activityData} />
    )),
  ];

  return (
    <OmniScrollView slivers={slivers} onScroll={onScroll} style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  emptyContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginVertical: SCREEN_HEIGHT * 0.1,
  },
  emojiContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  emptyText: {
    color: Colors.white,
    textAlign: 'center',
    width: '70%',
  },
});
