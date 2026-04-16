/**
 * NudgeButton — Animated button to "nudge" a friend to answer a poll.
 * Uses RN Animated API for a shake animation (replacing Lottie from demo
 * to keep deps minimal).
 */
import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleTiny } from '../ux/text/Typography';

interface NudgeButtonProps {
  /** Whether the user has already been nudged */
  hasNudged?: boolean;
  /** Callback when the nudge button is pressed */
  onNudge: () => void;
  disabled?: boolean;
}

export default function NudgeButton({
  hasNudged = false,
  onNudge,
  disabled = false,
}: NudgeButtonProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const playShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handlePress = useCallback(() => {
    if (hasNudged || disabled) return;
    playShake();
    onNudge();
  }, [hasNudged, disabled, playShake, onNudge]);

  const isDisabled = hasNudged || disabled;
  const nudgeTextColor = isDisabled ? Colors.gray6 : Colors.white;
  const nudgeButtonText = hasNudged ? 'Nudged' : 'Nudge';

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-6, 0, 6],
  });

  return (
    <Button
      style={[styles.container, isDisabled && styles.containerDisabled]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <Animated.Text
        style={[styles.handEmoji, { transform: [{ translateX }] }]}
      >
        {'\u{1F44B}'}
      </Animated.Text>
      <TitleTiny style={[styles.text, { color: nudgeTextColor }]}>
        {nudgeButtonText}
      </TitleTiny>
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray1,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  handEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    color: Colors.white,
  },
});
