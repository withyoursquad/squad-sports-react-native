/**
 * Lounge / Profile screen — full tabbed experience.
 * Ported from squad-demo/src/screens/lounge/Lounge.tsx.
 *
 * Tabs:
 *   - Messages (other profiles only)
 *   - Freestyles
 *   - Activity
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import Screen from '../../components/ux/layout/Screen';
import TabBar from '../../components/ux/layout/TabBar';
import CrossFade from '../../components/ux/layout/CrossFade';
import ExpandableHeader from '../../components/lounge/ExpandableHeader';
import LoungeFreestyles from '../../components/lounge/LoungeFreestyles';
import LoungeActivity from '../../components/lounge/LoungeActivity';
import { BodyRegular, TitleSmall } from '../../components/ux/text/Typography';
import type { User, Connection, UserActivity } from '@squad-sports/core';

type Route = RouteProp<RootStackParamList, 'Profile'>;

type LoungeTab = 'messages' | 'freestyles' | 'activity';

export function ProfileScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme, baseThemeColors } = useTheme();

  const { userId } = route.params;
  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [freestyles, setFreestyles] = useState<any[]>([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const isOwnProfile = loggedInUser?.id === user?.id;
  const isConnected = !!(connection as any)?.status && (connection as any).status === 2; // ACCEPTED

  const [activeTab, setActiveTab] = useState<LoungeTab>(isOwnProfile ? 'freestyles' : 'messages');

  // Build tab list based on profile type
  const tabs: Array<{ key: string; label: string }> = [];
  if (!isOwnProfile) tabs.push({ key: 'messages', label: 'Messages' });
  tabs.push({ key: 'freestyles', label: 'Freestyles' });
  tabs.push({ key: 'activity', label: 'Activity' });

  const loadData = useCallback(async () => {
    try {
      const [userData, loggedIn] = await Promise.all([
        apiClient.getUser(userId),
        apiClient.getLoggedInUser(),
      ]);
      setUser(userData);
      setLoggedInUser(loggedIn);

      // Determine if own profile and set default tab
      if (loggedIn?.id === userData?.id) {
        setActiveTab('freestyles');
      }

      // Load connection if viewing someone else
      if (loggedIn?.id !== userData?.id) {
        try {
          const connections = await apiClient.getUserConnections();
          const conn = (connections?.connections ?? []).find(
            (c: any) => c.creator?.id === userId || c.recipient?.id === userId
          );
          setConnection(conn ?? null);
        } catch {}
      }

      // Load user's freestyles
      try {
        const feed = await apiClient.getFeed(1, 50);
        const userFreestyles = (feed?.freestyles ?? []).filter(
          (f: any) => f.creator?.id === userId || f.creatorId === userId
        );
        setFreestyles(userFreestyles);
      } catch {}
    } catch (err) {
      console.error('[Lounge] Error loading profile:', err);
    }
  }, [userId, apiClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user || !loggedInUser) setLoadingTimeout(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [user, loggedInUser]);

  useEffect(() => {
    if (user && loggedInUser) setLoadingTimeout(false);
  }, [user, loggedInUser]);

  const onRefresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const onScrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
    { useNativeDriver: false }
  );

  // Loading state
  if (!user || !loggedInUser) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          {loadingTimeout ? (
            <View style={styles.timeoutContainer}>
              <BodyRegular style={styles.timeoutText}>
                Having trouble loading the profile. Please try again.
              </BodyRegular>
              <View style={styles.timeoutActions}>
                <Pressable onPress={() => navigation.goBack()}>
                  <BodyRegular style={styles.actionLink}>Go Back</BodyRegular>
                </Pressable>
                <Pressable onPress={() => { setLoadingTimeout(false); loadData(); }}>
                  <BodyRegular style={styles.actionLink}>Retry</BodyRegular>
                </Pressable>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="large" color={Colors.white} />
          )}
        </View>
      </Screen>
    );
  }

  // Non-squad member view
  if (!isOwnProfile && !isConnected) {
    return (
      <Screen>
        <ExpandableHeader
          user={user}
          scrollOffsetY={scrollOffsetY}
          isOwnProfile={false}
        />
        <View style={styles.nonSquadContainer}>
          <BodyRegular style={[styles.nonSquadText, {
            color: theme.isDarkMode ? baseThemeColors.primaryWhiteColor : baseThemeColors.primaryTextColor,
          }]}>
            You're not in {user.displayName}'s Circle yet. Their world is shared inside.
          </BodyRegular>
        </View>
      </Screen>
    );
  }

  // Tab styles matching squad-demo
  const activeTabColor = theme.isDarkMode
    ? baseThemeColors.primaryWhiteColor
    : baseThemeColors.primaryTextColor;

  return (
    <Screen>
      <ExpandableHeader
        user={user}
        scrollOffsetY={scrollOffsetY}
        isOwnProfile={isOwnProfile}
        onEditPhoto={() => {
          // Photo edit is handled in Settings for SDK
          (navigation as any).navigate('EditProfile');
        }}
        onSettingsPress={() => (navigation as any).navigate('Settings')}
      />

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={(key) => setActiveTab(key as LoungeTab)}
        activeColor={activeTabColor}
      />

      <View style={styles.tabContent}>
        {activeTab === 'messages' && !isOwnProfile && connection && (
          <View style={styles.messagingPlaceholder}>
            <Pressable
              style={styles.messageButton}
              onPress={() => (navigation as any).navigate('Messaging', { connectionId: connection.id })}
            >
              <TitleSmall style={styles.messageButtonText}>Open Messages</TitleSmall>
            </Pressable>
          </View>
        )}

        {activeTab === 'freestyles' && (
          <LoungeFreestyles
            user={user}
            freestyles={freestyles}
            isOwnProfile={isOwnProfile}
            onScroll={onScrollEvent}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'activity' && (
          <LoungeActivity
            user={user}
            isOwnProfile={isOwnProfile}
            onScroll={onScrollEvent}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeoutContainer: {
    alignItems: 'center',
  },
  timeoutText: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  timeoutActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionLink: {
    color: Colors.purple1,
  },
  nonSquadContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  nonSquadText: {
    color: Colors.white,
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
  },
  messagingPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageButton: {
    backgroundColor: Colors.purple1,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  messageButtonText: {
    color: Colors.black,
    fontWeight: '600',
  },
});
