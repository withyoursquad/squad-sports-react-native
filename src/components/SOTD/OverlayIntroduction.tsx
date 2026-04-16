/**
 * OverlayIntroduction.tsx
 * Full-screen tutorial overlay for first-time SOTD users.
 * Ported from squad-demo/src/components/SOTD/OverlayIntroduction.tsx
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodySmall } from '../ux/text/Typography';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export type SOTDOverlayIntroductionProps = {
  /** Vertical position of the SOTD icon to point at. */
  positionY?: number;
  /** Called when the overlay is tapped. */
  onPress: () => void;
};

export default function SOTDOverlayIntroduction({
  positionY,
  onPress,
}: SOTDOverlayIntroductionProps) {
  const emojiPositionY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiPositionY, {
          toValue: 16,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(emojiPositionY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [emojiPositionY]);

  return (
    <TouchableOpacity style={styles.fullPageContainer} onPress={onPress}>
      <View style={[styles.container, { top: positionY || 0 }]}>
        {/* Gold SOTD icon placeholder */}
        <View style={styles.sotdIcon}>
          <View style={styles.sotdIconInner} />
        </View>

        <BodySmall style={styles.text}>
          Tap to reveal your Squaddie of the Day
        </BodySmall>

        <Animated.View style={{ transform: [{ translateY: emojiPositionY }] }}>
          <Text style={styles.emoji}>{'\u261D'}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },
  emoji: {
    alignSelf: 'center',
    fontSize: 30,
    textAlign: 'center',
  },
  fullPageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  sotdIcon: {
    width: 40,
    height: 45,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sotdIconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray1,
  },
  text: {
    color: Colors.gray6,
    marginTop: 8,
    textAlign: 'center',
    width: '55%',
  },
});
