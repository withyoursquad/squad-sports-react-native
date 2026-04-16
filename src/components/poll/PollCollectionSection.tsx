/**
 * PollCollectionSection — Carousel / card-stack of polls within a collection.
 * Uses RN Animated + PanResponder for the card stack swipe animation.
 * Ported from squad-demo poll-collection/CardStack.tsx + PollCollectionSection.tsx.
 */
import React, { useCallback, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
  ActivityIndicator,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { TitleSmall, BodySmall } from '../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_SWIPE_THRESHOLD = 10;
const VERTICAL_SWIPE_THRESHOLD = 40;
const SWIPE_ANIM_DURATION = 300;

// ---------------------------------------------------------------------------
// Generic CardStack
// ---------------------------------------------------------------------------

interface CardStackProps<T> {
  initialSelectedIndex?: number;
  stackSpacing?: number;
  data: T[];
  renderItem: (item: T) => React.ReactElement;
}

function CardStack<T>({
  initialSelectedIndex = 0,
  stackSpacing = 45,
  data,
  renderItem,
}: CardStackProps<T>) {
  const [viewPan] = useState(new Animated.Value(0));
  const [viewStackedAnim] = useState(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(initialSelectedIndex);

  const isPanEnabled = useCallback(
    (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      const { dx, dy } = gs;
      return (
        (dx > HORIZONTAL_SWIPE_THRESHOLD || dx < -HORIZONTAL_SWIPE_THRESHOLD) &&
        (dy < VERTICAL_SWIPE_THRESHOLD || dy > -VERTICAL_SWIPE_THRESHOLD)
      );
    },
    [],
  );

  const advanceCard = useCallback(
    (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      if (data.length <= 0) return;
      if (!isPanEnabled(_, gs)) return;

      Animated.timing(viewPan, {
        toValue: 0,
        duration: SWIPE_ANIM_DURATION,
        useNativeDriver: false,
      }).start();

      Animated.timing(viewStackedAnim, {
        toValue: 1,
        duration: SWIPE_ANIM_DURATION,
        useNativeDriver: false,
      }).start(() => {
        viewStackedAnim.setValue(0);
        setCurrentIndex(prev => (prev + 1 >= data.length ? 0 : prev + 1));
      });
    },
    [data.length, isPanEnabled, viewPan, viewStackedAnim],
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: isPanEnabled,
    onStartShouldSetPanResponderCapture: isPanEnabled,
    onMoveShouldSetPanResponder: isPanEnabled,
    onMoveShouldSetPanResponderCapture: isPanEnabled,
    onPanResponderMove: (_, gs) => viewPan.setValue(gs.dx),
    onPanResponderRelease: advanceCard,
    onPanResponderTerminate: advanceCard,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => false,
  });

  const frontTransform = {
    transform: [
      { translateX: viewPan },
      {
        scale: viewStackedAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.8],
        }),
      },
      {
        rotate: viewPan.interpolate({
          inputRange: [-(SCREEN_WIDTH / 2), 0, SCREEN_WIDTH / 2],
          outputRange: ['-30deg', '0deg', '30deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity: viewStackedAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    bottom: viewStackedAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, stackSpacing],
    }),
  };

  const middleTransform = {
    transform: [
      {
        scale: viewStackedAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
    bottom: viewStackedAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [stackSpacing, 0],
    }),
  };

  const backTransform = {
    transform: [
      {
        scale: viewStackedAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 0.9],
        }),
      },
    ],
    bottom: viewStackedAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [stackSpacing * 2, stackSpacing],
    }),
  };

  const getZIndex = (index: number) => {
    if (currentIndex === index) return 2;
    if ((currentIndex + 1) % data.length === index) return 1;
    return -index;
  };

  const getTransform = (index: number) => {
    if (currentIndex === index) return frontTransform;
    const next = (currentIndex + 1) % data.length;
    if (next === index) return middleTransform;
    return backTransform;
  };

  return (
    <View style={[stackStyles.stack, { marginTop: stackSpacing + 16 }]}>
      {data.map((item, index) => {
        const isCurrent = currentIndex === index;
        return (
          <View
            style={[
              stackStyles.container,
              { position: isCurrent ? 'relative' : 'absolute', zIndex: getZIndex(index) },
            ]}
            key={`card-stack-${index}`}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={getTransform(index)}
            >
              {renderItem(isCurrent ? data[currentIndex]! : item)}
              {!isCurrent && (
                <View style={stackStyles.blurOverlay} />
              )}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

const stackStyles = StyleSheet.create({
  stack: {
    flex: 1,
    width: '100%',
  },
  container: {
    width: '100%',
  },
  blurOverlay: {
    borderRadius: 8,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

// ---------------------------------------------------------------------------
// PollCollectionSection
// ---------------------------------------------------------------------------

export interface PollCollectionData {
  id: string;
  name: string;
  endingAt?: Date;
  polls: any[];
}

interface PollCollectionSectionProps {
  collections: PollCollectionData[];
  loading?: boolean;
  /** Render function for each poll inside a collection */
  renderPollCard: (poll: any, collection: PollCollectionData) => React.ReactElement;
}

function getEndTimeString(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  if (diff <= 0) return 'Expires soon';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours >= 24) return `Ends in ${Math.floor(hours / 24)}d`;
  if (hours > 0) return `Ends in ${hours}h`;
  const mins = Math.floor(diff / (1000 * 60));
  return mins > 0 ? `Ends in ${mins}m` : 'Expires soon';
}

export default function PollCollectionSection({
  collections,
  loading = false,
  renderPollCard,
}: PollCollectionSectionProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.pollLoading}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <>
      {collections.map(collection => {
        if (collection.polls.length <= 0) return null;

        return (
          <View key={`polls-collection-${collection.id}`}>
            <View style={styles.headerRow}>
              <TitleSmall
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.isDarkMode
                      ? Colors.white
                      : Colors.gray1,
                  },
                ]}
              >
                {collection.name}
              </TitleSmall>

              {collection.endingAt && (
                <View
                  style={[
                    styles.timeBadge,
                    {
                      backgroundColor: theme.isDarkMode
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <BodySmall
                    style={{
                      color: theme.isDarkMode ? Colors.white : Colors.gray1,
                    }}
                  >
                    {getEndTimeString(collection.endingAt)}
                  </BodySmall>
                </View>
              )}
            </View>

            <CardStack
              data={collection.polls}
              renderItem={(poll: any) => renderPollCard(poll, collection)}
            />
          </View>
        );
      })}
    </>
  );
}

export { CardStack };

const styles = StyleSheet.create({
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sectionTitle: {
    color: Colors.white,
  },
  timeBadge: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollLoading: {
    alignSelf: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    marginBottom: 24,
    marginHorizontal: 16,
    padding: 16,
    width: '100%',
  },
});
