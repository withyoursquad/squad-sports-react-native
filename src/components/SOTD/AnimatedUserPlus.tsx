/**
 * AnimatedUserPlus.tsx
 * Animated "+" icon for empty squad slots (breathing scale animation).
 * Ported from squad-demo/src/components/SOTD/AnimatedUserPlus.tsx
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';

type AvatarIconCircleSize = 40 | 36 | 32;
const avatarIconSize: AvatarIconCircleSize[] = [40, 36, 32];

export type AnimatedUserPlusProps = {
  /** Index of this slot (affects size and animation delay). */
  index: number;
  /** Whether the entrance animation should play. */
  shouldAnimate?: boolean;
  /** Called when this slot's add button is pressed. */
  onPress?: () => void;
  /** Circle diameter for this slot (overrides default calculation). */
  diameter?: number;
};

/** Animation delay per slot in ms. */
export const ANIMATION_DELAY = 600;
/** Indices used for staggered animation. */
export const ANIMATION_DATA = [0, 3, 9];

/** Default diameters per slot index. */
const defaultDiameters = [72, 64, 56];

export function AnimatedUserPlus({
  index,
  shouldAnimate = false,
  onPress,
  diameter,
}: AnimatedUserPlusProps) {
  const opacityValue = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const hasAnimated = useRef(false);
  const { theme } = useTheme();

  const slotDiameter = diameter ?? defaultDiameters[index] ?? 56;
  const iconSize = avatarIconSize[index] ?? 32;

  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current) {
      hasAnimated.current = true;

      Animated.timing(opacityValue, {
        toValue: 1,
        delay: index * ANIMATION_DELAY,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }
  }, [shouldAnimate, index, opacityValue]);

  return (
    <Animated.View
      key={index}
      style={[
        styles.squaddy,
        {
          opacity: opacityValue,
          width: slotDiameter,
          height: slotDiameter,
          borderRadius: slotDiameter / 2,
          backgroundColor: theme.primaryColor,
        },
      ]}
    >
      <Button style={styles.squaddyButton} onPress={onPress}>
        <View style={styles.plusIcon}>
          <View
            style={[
              styles.plusHorizontal,
              {
                width: iconSize * 0.5,
                backgroundColor: Colors.white,
              },
            ]}
          />
          <View
            style={[
              styles.plusVertical,
              {
                height: iconSize * 0.5,
                backgroundColor: Colors.white,
              },
            ]}
          />
        </View>
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  squaddy: {
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderColor: Colors.white,
    borderRadius: 36,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  squaddyButton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  plusIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    height: 2,
    borderRadius: 1,
  },
  plusVertical: {
    width: 2,
    borderRadius: 1,
    position: 'absolute',
  },
});
