/**
 * Home screen — OmniScrollView with slivers pattern.
 * Ported from squad-demo/src/screens/Home.tsx + ContentMemoized.tsx.
 *
 * Slivers:
 *   1. SquadCircleDisplay (circular member arrangement)
 *   2. SquadOverflow ("More Of Your Shifters" horizontal list)
 *   3. Active Polls
 *   4. Feed section headers + freestyle cards (with sponsored content)
 *   5. Empty state
 *
 * Features:
 *   - Post-onboarding welcome overlay
 *   - OmniScrollView with heterogeneous sliver composition
 *   - Feed section headers ("What's New" / "Older")
 *   - Loading skeleton on initial load (no flash on pull-to-refresh)
 */
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import { useRealtimeEvent } from '../../realtime/useRealtimeSync';
import {
  OmniScrollView,
  OmniScrollViewBuilderSliver,
  OmniScrollViewFixedChildSliver,
  type OmniScrollViewSliver,
} from '../../components/OmniScrollView';
import SquadCircleDisplay from '../../components/home/SquadCircleDisplay';
import SquadOverflow from '../../components/home/SquadOverflow';
import PostOnboardingOverlay from '../../components/home/PostOnboardingOverlay';
import FreestyleFeedSectionHeader from '../../components/lounge/FreestyleFeedSectionHeader';
import FeedLoadingSkeleton from '../../components/feed/FeedLoadingSkeleton';
import FreestyleCard from '../../components/feed/FreestyleCard';
import PollCard from '../../components/feed/PollCard';
import SponsoredContentCard from '../../components/feed/SponsoredContentCard';
import InterstitialOverlay from '../../components/feed/InterstitialOverlay';
import UserImage from '../../components/ux/user-image/UserImage';
import Button from '../../components/ux/buttons/Button';
import { TitleSmall, TitleMedium, BodyRegular, BodySmall } from '../../components/ux/text/Typography';
import type { User, Connection } from '@squad-sports/core';
import { injectSponsoredContent, type SponsorshipPlacementData } from '@squad-sports/core/src/sponsorship/feed-injector';
import { ImpressionTracker } from '@squad-sports/core/src/sponsorship/impression-tracker';
import { InterstitialManager } from '@squad-sports/core/src/sponsorship/interstitial-manager';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function HomeScreen() {
  const apiClient = useApiClient();
  const { theme, baseThemeColors } = useTheme();
  const navigation = useNavigation<Nav>();

  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [freestyles, setFreestyles] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [placements, setPlacements] = useState<SponsorshipPlacementData[]>([]);
  const [interstitialPlacement, setInterstitialPlacement] = useState<SponsorshipPlacementData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showPostOnboarding, setShowPostOnboarding] = useState(false);

  const interstitialManagerRef = useRef(new InterstitialManager());
  const hasCompletedInitialLoad = useRef(false);

  const loadData = useCallback(async (forceFresh = false) => {
    try {
      setLoadError(false);
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

      if (!hasCompletedInitialLoad.current) {
        hasCompletedInitialLoad.current = true;
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
      setLoadError(true);
      if (!hasCompletedInitialLoad.current) {
        setIsInitialLoad(false);
      }
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
    await loadData(true);
  }, [loadData]);

  const primaryColor = theme.buttonColor;

  // Split freestyles into listened/unlistened
  const unlistened = freestyles.filter((f: any) => !f.listenedByMe);
  const listened = freestyles.filter((f: any) => f.listenedByMe);

  // Build slivers
  const slivers = useMemo(() => {
    const result: Array<OmniScrollViewSliver> = [];

    // Header
    result.push(
      new OmniScrollViewFixedChildSliver('header', () => (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => {
              if (user?.id) navigation.navigate('Profile', { userId: user.id });
            }}>
              <UserImage
                imageUrl={user?.imageUrl}
                displayName={user?.displayName}
                size={32}
              />
            </Pressable>
          </View>
          <View style={styles.headerCenter}>
            {/* Logo placeholder */}
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => navigation.navigate('Invite')}>
              <View style={[styles.headerIcon, { borderColor: primaryColor }]}>
                <Text style={[styles.headerIconText, { color: primaryColor }]}>+</Text>
              </View>
            </Pressable>
          </View>
        </View>
      ))
    );

    // Squad Circle Display
    result.push(
      new OmniScrollViewFixedChildSliver('squad-circle', () => (
        <SquadCircleDisplay
          connections={connections}
          loggedInUserId={user?.id}
          isLoading={isInitialLoad}
          primaryColor={primaryColor}
        />
      ))
    );

    // Squad Overflow
    if (connections.length > 5) {
      result.push(
        new OmniScrollViewFixedChildSliver('squad-overflow', () => (
          <SquadOverflow
            connections={connections}
            loggedInUserId={user?.id}
            primaryColor={primaryColor}
          />
        ))
      );
    }

    // Active Polls
    if (polls.length > 0) {
      result.push(
        new OmniScrollViewFixedChildSliver('polls', () => (
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
        ))
      );
    }

    // Feed section
    if (isInitialLoad && freestyles.length === 0) {
      result.push(
        new OmniScrollViewFixedChildSliver('feed-skeleton', () => (
          <FeedLoadingSkeleton />
        ))
      );
    } else if (loadError && freestyles.length === 0) {
      result.push(
        new OmniScrollViewFixedChildSliver('feed-error', () => (
          <View style={styles.errorContainer}>
            <BodyRegular style={styles.errorText}>Couldn't load your feed.</BodyRegular>
            <Pressable style={styles.retryButton} onPress={() => loadData(true)}>
              <BodyRegular style={styles.retryText}>Retry</BodyRegular>
            </Pressable>
          </View>
        ))
      );
    } else if (freestyles.length > 0) {
      // Inject sponsored content
      const injectedItems = injectSponsoredContent(freestyles, placements);

      if (unlistened.length > 0) {
        result.push(
          new OmniScrollViewFixedChildSliver('whats-new-header', () => (
            <FreestyleFeedSectionHeader>{"What\u2019s New"}</FreestyleFeedSectionHeader>
          ))
        );
      }

      // All feed items as a single sliver
      result.push(
        new OmniScrollViewBuilderSliver({
          data: injectedItems,
          extractKey: (item: any) => {
            if (item.type === 'sponsored') return `sp-${item.data.id}`;
            return item.data?.id ?? '';
          },
          builder: (item: any) => {
            if (item.type === 'sponsored') {
              const sp = item.data as SponsorshipPlacementData;
              return (
                <SponsoredContentCard
                  key={`sp-${sp.id}`}
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
          },
        })
      );

      if (listened.length > 0 && unlistened.length > 0) {
        result.push(
          new OmniScrollViewFixedChildSliver('older-header', () => (
            <FreestyleFeedSectionHeader>Older</FreestyleFeedSectionHeader>
          ))
        );
      }
    } else if (connections.length === 0) {
      // Empty state
      result.push(
        new OmniScrollViewFixedChildSliver('empty', () => (
          <View style={styles.emptyState}>
            <TitleSmall style={styles.emptyTitle}>Your circle is listening.</TitleSmall>
            <BodyRegular style={styles.emptySubtitle}>
              Drop your first take or invite friends to get started.
            </BodyRegular>
            <View style={styles.emptyActions}>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: primaryColor }]}
                onPress={() => navigation.navigate('FreestyleCreate')}
              >
                <Text style={[styles.emptyButtonText, { color: theme.buttonText }]}>
                  Freestyle
                </Text>
              </Pressable>
              <Pressable
                style={styles.emptyButtonOutline}
                onPress={() => navigation.navigate('Invite')}
              >
                <Text style={styles.emptyButtonOutlineText}>Invite</Text>
              </Pressable>
            </View>
          </View>
        ))
      );
    }

    return result;
  }, [
    user,
    connections,
    freestyles,
    polls,
    placements,
    isInitialLoad,
    loadError,
    primaryColor,
    theme,
    navigation,
    unlistened.length,
    listened.length,
    handleImpression,
    handleCtaPress,
    loadData,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <OmniScrollView
        slivers={slivers}
        onRefresh={onRefresh}
        style={styles.scrollContent}
      />

      {/* Post-onboarding overlay */}
      <PostOnboardingOverlay
        visible={showPostOnboarding}
        onHide={() => setShowPostOnboarding(false)}
        hasConnections={connections.length > 0}
        hasError={loadError}
      />

      {/* Interstitial sponsorship overlay */}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {},
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {},
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 20,
    fontWeight: '300',
    marginTop: -2,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.white,
    marginBottom: 12,
  },

  // Error
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.purple1,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: Colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.gray6,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  emptyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyButtonOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray5,
  },
  emptyButtonOutlineText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
