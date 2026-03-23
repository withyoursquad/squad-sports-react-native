import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  SectionList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import { useRealtimeEvent } from '../../realtime/useRealtimeSync';
import UserImage from '../../components/ux/user-image/UserImage';
import FreestyleCard from '../../components/feed/FreestyleCard';
import PollCard from '../../components/feed/PollCard';
import SponsoredContentCard from '../../components/feed/SponsoredContentCard';
import InterstitialOverlay from '../../components/feed/InterstitialOverlay';
import Button from '../../components/ux/buttons/Button';
import { TitleSmall, BodyRegular, BodySmall, TitleMedium } from '../../components/ux/text/Typography';
import type { User, Connection } from '@squad-sports/core';
import { injectSponsoredContent, type SponsorshipPlacementData } from '@squad-sports/core/src/sponsorship/feed-injector';
import { ImpressionTracker } from '@squad-sports/core/src/sponsorship/impression-tracker';
import { InterstitialManager } from '@squad-sports/core/src/sponsorship/interstitial-manager';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function HomeScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [freestyles, setFreestyles] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [placements, setPlacements] = useState<SponsorshipPlacementData[]>([]);
  const [interstitialPlacement, setInterstitialPlacement] = useState<SponsorshipPlacementData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const interstitialManagerRef = useRef(new InterstitialManager());

  const loadData = useCallback(async (forceFresh = false) => {
    try {
      const [userData, squad, feed, pollFeed, sponsorships] = await Promise.all([
        apiClient.getLoggedInUser(),
        apiClient.getUserConnections(forceFresh),
        apiClient.getFeed(1, 10, forceFresh).catch(() => null),
        apiClient.getActivePolls(forceFresh).catch(() => null),
        apiClient.getActivePlacements(forceFresh).catch(() => null),
      ]);
      setUser(userData);
      setConnections(squad?.connections ?? []);
      setFreestyles(feed?.freestyles ?? []);
      setPolls(pollFeed?.polls ?? []);

      const loadedPlacements: SponsorshipPlacementData[] = (sponsorships?.placements ?? []).map((p: any) => ({
        id: p.id,
        type: p.type,
        brandId: p.brandId ?? p.brand?.id ?? '',
        brandName: p.brand?.name ?? '',
        brandImageUrl: p.brand?.imageUrl,
        headline: p.headline,
        bodyText: p.bodyText,
        imageUrl: p.imageUrl,
        ctaText: p.ctaText,
        ctaUrl: p.ctaUrl,
        isHouseAd: p.isHouseAd ?? false,
        config: p.config,
      }));
      setPlacements(loadedPlacements);
      interstitialManagerRef.current.configure(loadedPlacements);
      ImpressionTracker.shared.configure(apiClient);
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
    }
  }, [apiClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live updates
  useRealtimeEvent('feed:update', () => loadData());
  useRealtimeEvent('poll:update', () => loadData());
  useRealtimeEvent('squad:member:add', () => loadData());

  // Game moment → interstitial sponsorship
  useRealtimeEvent('game:moment', (data: { type: string }) => {
    const placement = interstitialManagerRef.current.onGameMoment(data.type);
    if (placement) setInterstitialPlacement(placement);
  });

  const handleImpression = useCallback((placementId: string, durationMs: number) => {
    ImpressionTracker.shared.record(placementId, durationMs, 'feed', false);
  }, []);

  const handleCtaPress = useCallback((placementId: string) => {
    ImpressionTracker.shared.record(placementId, 0, 'feed', true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  const primaryColor = theme.buttonColor;

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TitleMedium style={styles.greeting}>
                  Hey, {user?.displayName ?? 'there'}
                </TitleMedium>
                <BodySmall style={styles.squadCount}>
                  {connections.length} in your squad
                </BodySmall>
              </View>
              <View style={styles.headerRight}>
                <Pressable onPress={() => navigation.navigate('Invite')}>
                  <View style={[styles.actionIcon, { borderColor: primaryColor }]}>
                    <Text style={[styles.actionIconText, { color: primaryColor }]}>+</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Settings')}>
                  <View style={styles.settingsIcon}>
                    <Text style={styles.settingsIconText}>...</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Squad Circle */}
            {connections.length > 0 && (
              <View style={styles.squadCircleSection}>
                <FlatList
                  data={connections.slice(0, 8)}
                  keyExtractor={(item) => item.id ?? ''}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.squadCircleList}
                  renderItem={({ item }) => {
                    const other = item.recipient ?? item.creator;
                    return (
                      <Pressable
                        style={styles.squadMember}
                        onPress={() => navigation.navigate('Profile', { userId: other?.id ?? item.id ?? '' })}
                      >
                        <UserImage
                          imageUrl={other?.imageUrl}
                          displayName={other?.displayName}
                          size={56}
                          borderColor={primaryColor}
                        />
                        <BodySmall style={styles.squadMemberName} numberOfLines={1}>
                          {other?.displayName?.split(' ')[0] ?? ''}
                        </BodySmall>
                      </Pressable>
                    );
                  }}
                />
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Button
                style={[styles.actionButton, { backgroundColor: Colors.gray2 }]}
                onPress={() => navigation.navigate('FreestyleCreate')}
              >
                <Text style={[styles.actionButtonIcon, { color: primaryColor }]}>{'M'}</Text>
                <BodySmall style={styles.actionButtonLabel}>Freestyle</BodySmall>
              </Button>
              <Button
                style={[styles.actionButton, { backgroundColor: Colors.gray2 }]}
                onPress={() => navigation.navigate('Invite')}
              >
                <Text style={[styles.actionButtonIcon, { color: primaryColor }]}>{'+'}</Text>
                <BodySmall style={styles.actionButtonLabel}>Invite</BodySmall>
              </Button>
            </View>

            {/* Active Polls */}
            {polls.length > 0 && (
              <View style={styles.section}>
                <TitleSmall style={styles.sectionTitle}>Active Polls</TitleSmall>
                {polls.slice(0, 2).map((poll: any) => (
                  <PollCard
                    key={poll.id}
                    id={poll.id}
                    question={poll.question ?? ''}
                    options={(poll.options ?? []).map((o: any) => ({
                      id: o.id ?? '',
                      text: o.text ?? '',
                      percentage: o.percentage,
                    }))}
                    hasVoted={!!poll.myResponse}
                    selectedOptionId={poll.myResponse?.optionId}
                    totalVotes={poll.totalVotes}
                    primaryColor={primaryColor}
                    onPress={() => navigation.navigate('PollResponse', { pollId: poll.id })}
                  />
                ))}
              </View>
            )}

            {/* Feed */}
            {freestyles.length > 0 && (
              <View style={styles.section}>
                <TitleSmall style={styles.sectionTitle}>Latest Freestyles</TitleSmall>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.feedSection}>
            {injectSponsoredContent(freestyles, placements).map((item, index) => {
              if (item.type === 'sponsored') {
                const sp = item.data as SponsorshipPlacementData;
                return (
                  <SponsoredContentCard
                    key={`sp-${sp.id}-${index}`}
                    placementId={sp.id}
                    brandName={sp.brandName}
                    brandImageUrl={sp.brandImageUrl}
                    headline={sp.headline}
                    bodyText={sp.bodyText}
                    ctaText={sp.ctaText}
                    ctaUrl={sp.ctaUrl}
                    onImpression={handleImpression}
                    onCtaPress={handleCtaPress}
                  />
                );
              }
              const freestyle = item.data as any;
              return (
                <FreestyleCard
                  key={freestyle.id}
                  id={freestyle.id}
                  audioUrl={freestyle.audioUrl}
                  duration={freestyle.duration}
                  creatorName={freestyle.creator?.displayName}
                  creatorImageUrl={freestyle.creator?.imageUrl}
                  createdAt={freestyle.createdAt}
                  listenCount={freestyle.listenCount}
                  reactionCount={freestyle.reactionCount}
                  prompt={freestyle.prompt?.text}
                />
              );
            })}

            {connections.length === 0 && freestyles.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>{'squad'}</Text>
                <TitleSmall style={styles.emptyTitle}>Build Your Squad</TitleSmall>
                <BodyRegular style={styles.emptySubtitle}>
                  Invite friends to start sharing freestyles, messages, and polls
                </BodyRegular>
                <Button
                  style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                  onPress={() => navigation.navigate('Invite')}
                >
                  <Text style={[styles.emptyButtonText, { color: theme.buttonText }]}>
                    Invite Friends
                  </Text>
                </Button>
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
        }
      />

      {/* Interstitial sponsorship overlay — triggered by game moments */}
      {interstitialPlacement && (
        <InterstitialOverlay
          visible={!!interstitialPlacement}
          placementId={interstitialPlacement.id}
          brandName={interstitialPlacement.brandName}
          brandImageUrl={interstitialPlacement.brandImageUrl}
          headline={interstitialPlacement.headline}
          bodyText={interstitialPlacement.bodyText}
          ctaText={interstitialPlacement.ctaText}
          ctaUrl={interstitialPlacement.ctaUrl}
          onImpression={(id, ms) => ImpressionTracker.shared.record(id, ms, 'interstitial', false)}
          onCtaPress={(id) => ImpressionTracker.shared.record(id, 0, 'interstitial', true)}
          onDismiss={() => setInterstitialPlacement(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {},
  headerRight: { flexDirection: 'row', gap: 12 },
  greeting: { color: Colors.white },
  squadCount: { color: Colors.gray6, marginTop: 2 },
  actionIcon: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  actionIconText: { fontSize: 20, fontWeight: '300', marginTop: -2 },
  settingsIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.gray2, justifyContent: 'center', alignItems: 'center',
  },
  settingsIconText: { color: Colors.white, fontSize: 16, fontWeight: '700', marginTop: -4 },

  // Squad circle
  squadCircleSection: { marginBottom: 16 },
  squadCircleList: { paddingHorizontal: 24, gap: 16 },
  squadMember: { alignItems: 'center', width: 64 },
  squadMemberName: { color: Colors.white, marginTop: 6, textAlign: 'center' },

  // Actions
  actionRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  actionButton: {
    flex: 1, height: 72, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  actionButtonIcon: { fontSize: 20, fontWeight: '600' },
  actionButtonLabel: { color: Colors.white },

  // Sections
  section: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.white, marginBottom: 12 },

  // Feed
  feedSection: { paddingHorizontal: 24, paddingBottom: 48 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 16, color: Colors.gray6 },
  emptyTitle: { color: Colors.white, marginBottom: 8 },
  emptySubtitle: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  emptyButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24 },
  emptyButtonText: { fontSize: 15, fontWeight: '600' },
});
