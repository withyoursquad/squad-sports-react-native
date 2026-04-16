/**
 * SotdButtonLocked.tsx
 * Locked state: grayed out with lock icon, shows "Get X more Shifters".
 * Ported from squad-demo/src/components/SOTD/SotdButton_locked.tsx
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { BodySmall } from '../ux/text/Typography';
import { ANIMATION_DELAY, ANIMATION_DATA } from './AnimatedUserPlus';

export type SotdButtonLockedProps = {
  /** Called when the locked button is tapped. */
  onPress?: () => void;
  /** Number of additional shifters needed to unlock. */
  shiftersNeeded?: number;
  /** Whether the fade-in animation should play. */
  shouldAnimate?: boolean;
  /** Called when the animation completes. */
  onAnimationComplete?: () => void;
};

export default function SotdButtonLocked({
  onPress,
  shiftersNeeded = 3,
  shouldAnimate = false,
  onAnimationComplete,
}: SotdButtonLockedProps) {
  const opacityValue = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current) {
      hasAnimated.current = true;

      Animated.timing(opacityValue, {
        toValue: 1,
        delay: ANIMATION_DATA.length * ANIMATION_DELAY,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [shouldAnimate, opacityValue, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityValue }]}>
      <Button style={styles.inactiveContainer} onPress={onPress}>
        <View style={styles.lockIconContainer}>
          <View style={styles.lockIcon}>
            <View style={styles.lockBody} />
            <View style={styles.lockShackle} />
          </View>
        </View>
        <BodySmall style={styles.text}>
          {shiftersNeeded > 0
            ? `Get ${shiftersNeeded} more Shifters to unlock`
            : 'Unlock when 3 friends join your Squad world'}
        </BodySmall>
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '40%',
  },
  inactiveContainer: {
    alignItems: 'center',
    width: '100%',
  },
  lockIconContainer: {
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    alignItems: 'center',
  },
  lockBody: {
    width: 20,
    height: 14,
    backgroundColor: Colors.gray4,
    borderRadius: 3,
  },
  lockShackle: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderColor: Colors.gray4,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomWidth: 0,
    position: 'absolute',
    top: -8,
  },
  text: {
    color: Colors.gray6,
    marginTop: 8,
    textAlign: 'center',
  },
});
