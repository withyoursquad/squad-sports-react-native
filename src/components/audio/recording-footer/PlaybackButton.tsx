/**
 * PlaybackButton — play / pause recorded audio.
 * Ported from squad-demo/src/components/audio/recording-footer/PlaybackButton.tsx.
 *
 * Shows a play triangle or pause bars inside a white circle. Uses community
 * color for the icon when enabled, gray when disabled.
 */
import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import { Circle } from '../../ux/shapes/Shapes';
import recordingButtonStyles, { recordingButtonColors } from './styles';

interface PlaybackButtonProps {
  /** Whether audio is currently playing. */
  isPlaying: boolean;
  /** Called to toggle play / pause. */
  onPress: () => void;
  /** Disables the button (e.g. while recording is active). */
  disabled?: boolean;
}

export default function PlaybackButton({
  isPlaying,
  onPress,
  disabled,
}: PlaybackButtonProps) {
  if (isPlaying) {
    return <PauseButton onPress={onPress} disabled={disabled} />;
  }
  return <PlayButton onPress={onPress} disabled={disabled} />;
}

/* --- Internal wrappers --- */

function PlaybackButtonWrapper({
  onPress,
  disabled,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: ReactElement;
}) {
  return (
    <Button onPress={onPress} disabled={disabled}>
      <Circle
        size={40}
        color={
          disabled
            ? recordingButtonColors.backgroundDisabled
            : recordingButtonColors.background
        }
      >
        {children}
      </Circle>
    </Button>
  );
}

function PlayButton({
  onPress,
  disabled,
}: {
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const iconColor = disabled
    ? recordingButtonColors.iconDisabled
    : theme.buttonColor || recordingButtonColors.icon;

  return (
    <PlaybackButtonWrapper onPress={onPress} disabled={disabled}>
      <View
        style={[
          styles.playTriangle,
          {
            borderLeftColor: iconColor,
          },
        ]}
      />
    </PlaybackButtonWrapper>
  );
}

function PauseButton({
  onPress,
  disabled,
}: {
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const iconColor = disabled
    ? recordingButtonColors.iconDisabled
    : theme.buttonColor || recordingButtonColors.icon;

  return (
    <PlaybackButtonWrapper onPress={onPress} disabled={disabled}>
      <View style={styles.pauseBars}>
        <View style={[styles.pauseBar, { backgroundColor: iconColor }]} />
        <View style={[styles.pauseBar, { backgroundColor: iconColor }]} />
      </View>
    </PlaybackButtonWrapper>
  );
}

const styles = StyleSheet.create({
  pauseBar: {
    borderRadius: 1,
    height: 14,
    width: 3,
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 3,
  },
  playTriangle: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 6,
    height: 0,
    marginLeft: 2,
    width: 0,
  },
});
