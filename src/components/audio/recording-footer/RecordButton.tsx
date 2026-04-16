/**
 * RecordButton — start / stop recording with pulse animation.
 * Ported from squad-demo/src/components/audio/recording-footer/RecordButton.tsx.
 *
 * Uses community color from the SDK theme for the button background.
 * Grows from 72px to 104px while recording, with a red background.
 * Shows a microphone icon when idle, stop icon when recording.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import { Circle } from '../../ux/shapes/Shapes';

interface RecordButtonProps {
  /** Whether the recorder is currently recording. */
  isRecording: boolean;
  /** Called when the button is pressed. Parent handles start/stop logic. */
  onPress: () => void;
  /** Disables the button. */
  disabled?: boolean;
}

export default function RecordButton({
  isRecording,
  onPress,
  disabled,
}: RecordButtonProps) {
  const { theme } = useTheme();
  const communityColor = theme.buttonColor || Colors.blue;

  const [size, setSize] = useState(72);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate pulse while recording.
  useEffect(() => {
    if (isRecording) {
      setSize(104);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      setSize(72);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const buttonBackground = isRecording ? Colors.red : communityColor;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Button onPress={onPress} disabled={disabled} feedback={false}>
        <Circle
          size={size}
          color={disabled ? Colors.gray2 : buttonBackground}
        >
          {isRecording ? (
            <View style={styles.stopIcon} />
          ) : (
            <MicrophoneIcon color={disabled ? Colors.gray6 : Colors.white} />
          )}
        </Circle>
      </Button>
    </Animated.View>
  );
}

/** Simple microphone icon drawn with Views. */
function MicrophoneIcon({ color }: { color: string }) {
  return (
    <View style={styles.micContainer}>
      {/* Mic body */}
      <View
        style={[
          styles.micBody,
          { backgroundColor: color },
        ]}
      />
      {/* Mic base arc */}
      <View
        style={[
          styles.micArc,
          { borderColor: color },
        ]}
      />
      {/* Mic stem */}
      <View
        style={[
          styles.micStem,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  micArc: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    height: 14,
    width: 20,
  },
  micBody: {
    borderRadius: 5,
    height: 16,
    width: 10,
  },
  micContainer: {
    alignItems: 'center',
  },
  micStem: {
    height: 4,
    width: 2,
  },
  stopIcon: {
    backgroundColor: Colors.white,
    borderRadius: 4,
    height: 20,
    width: 20,
  },
});
