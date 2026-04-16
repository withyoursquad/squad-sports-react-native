/**
 * SelectingBottomSheet.tsx
 * Selection UI with carousel of squad members while SOTD is being chosen.
 * Ported from squad-demo/src/components/SOTD/SelectingBottomSheet.tsx
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import { BodyRegular } from '../../ux/text/Typography';
import UserImage from '../../ux/user-image/UserImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 224;
const CAROUSEL_INTERVAL = 600;
const MIN_DISPLAY_TIME = 3000;

export type SquadMember = {
  id: string;
  displayName: string;
  imageUrl?: string;
};

export type SOTDSelectingBottomSheetProps = {
  /** List of squad members to cycle through. */
  members: SquadMember[];
  /** Called when minimum display time has elapsed. Host should resolve selection. */
  onMinimumTimeElapsed?: () => void;
  /** Called when selection is complete and ready to show result. */
  onSelectionComplete?: (selectedMember: SquadMember) => void;
  /** If provided, this is the pre-selected member to land on. */
  selectedMember?: SquadMember | null;
};

export default function SOTDSelectingBottomSheet({
  members,
  onMinimumTimeElapsed,
  onSelectionComplete,
  selectedMember,
}: SOTDSelectingBottomSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minimumDisplayTime, setMinimumDisplayTime] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Cycle through members with animation
  useEffect(() => {
    if (members.length === 0) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: CAROUSEL_INTERVAL / 3,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.55,
          duration: CAROUSEL_INTERVAL / 3,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setCurrentIndex(prev => (prev + 1) % members.length);

        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: CAROUSEL_INTERVAL / 3,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: CAROUSEL_INTERVAL / 3,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, [members, fadeAnim, scaleAnim]);

  // Minimum display timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumDisplayTime(true);
      onMinimumTimeElapsed?.();
    }, MIN_DISPLAY_TIME);

    return () => clearTimeout(timer);
  }, [onMinimumTimeElapsed]);

  // Complete selection when both timer elapsed and member selected
  useEffect(() => {
    if (minimumDisplayTime && selectedMember) {
      onSelectionComplete?.(selectedMember);
    }
  }, [minimumDisplayTime, selectedMember, onSelectionComplete]);

  const currentMember = members[currentIndex];

  return (
    <View style={styles.container}>
      <BodyRegular style={styles.title}>
        Selecting which true friend deserves to hear your voice today...
      </BodyRegular>

      <View style={styles.carouselContainer}>
        {currentMember && (
          <Animated.View
            style={[
              styles.carouselItemContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <UserImage
              size={AVATAR_SIZE}
              imageUrl={currentMember.imageUrl}
              displayName={currentMember.displayName}
            />
          </Animated.View>
        )}
      </View>

      {/* Shadow indicator at bottom */}
      <View style={styles.shadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: AVATAR_SIZE,
    width: SCREEN_WIDTH,
  },
  carouselItemContainer: {
    alignSelf: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  shadow: {
    width: 250,
    height: 30,
    borderRadius: 125,
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ scaleY: 0.3 }],
  },
  title: {
    color: Colors.gray6,
    textAlign: 'center',
  },
});
