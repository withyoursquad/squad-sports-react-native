import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import UserImage from '../../components/ux/user-image/UserImage';
import Button from '../../components/ux/buttons/Button';
import {
  TitleMedium,
  TitleSmall,
  BodyRegular,
  BodyMedium,
  BodySmall,
} from '../../components/ux/text/Typography';
import type { User, UserActivity } from '@squad-sports/core';

type Route = RouteProp<RootStackParamList, 'Profile'>;

export function ProfileScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const [userData, activityData, loggedInUser] = await Promise.all([
        apiClient.getUser(userId),
        apiClient.getUserActivity(userId),
        apiClient.getLoggedInUser(),
      ]);
      setUser(userData);
      setActivity(activityData);
      setIsOwnProfile(loggedInUser?.id === userId);
    } catch (err) {
      console.error('[Profile] Error loading profile:', err);
    }
  }, [userId, apiClient]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader
        title={isOwnProfile ? 'My Profile' : user.displayName ?? ''}
        right={
          isOwnProfile ? (
            <Pressable onPress={() => (navigation as any).navigate('Settings')}>
              <Text style={styles.settingsIcon}>{'...'}</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
        }
      >
        <View style={styles.profileHeader}>
          <UserImage
            imageUrl={user.imageUrl}
            displayName={user.displayName}
            size={96}
          />
          <TitleMedium style={styles.displayName}>
            {user.displayName}
          </TitleMedium>
          {user.community && (
            <BodyMedium style={styles.community}>{user.community}</BodyMedium>
          )}
        </View>

        {activity && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <TitleSmall style={styles.statValue}>
                {(activity as any).freestyleCount ?? activity.freestylesSent ?? 0}
              </TitleSmall>
              <BodySmall style={styles.statLabel}>Freestyles</BodySmall>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <TitleSmall style={styles.statValue}>
                {(activity as any).messageCount ?? activity.messagesSent ?? 0}
              </TitleSmall>
              <BodySmall style={styles.statLabel}>Messages</BodySmall>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <TitleSmall style={styles.statValue}>
                {(activity as any).callCount ?? activity.callsMade ?? 0}
              </TitleSmall>
              <BodySmall style={styles.statLabel}>Calls</BodySmall>
            </View>
          </View>
        )}

        {!isOwnProfile && (
          <View style={styles.actions}>
            <Button
              style={[styles.actionButton, { backgroundColor: theme.buttonColor }]}
              onPress={() =>
                (navigation as any).navigate('Messaging', { connectionId: userId })
              }
            >
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
                Message
              </Text>
            </Button>
            <Button
              style={styles.actionButtonOutline}
              onPress={() =>
                (navigation as any).navigate('AddCallTitle', { connectionId: userId })
              }
            >
              <Text style={styles.actionButtonOutlineText}>Call</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  displayName: {
    color: Colors.white,
    marginTop: 12,
  },
  community: {
    color: Colors.gray6,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
  },
  statLabel: {
    color: Colors.gray6,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.gray5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray5,
  },
  actionButtonOutlineText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  settingsIcon: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
