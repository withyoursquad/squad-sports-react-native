/**
 * SendButton — submit recorded audio.
 * Ported from squad-demo/src/components/audio/recording-footer/SendButton.tsx.
 *
 * Enabled only after recording has stopped. Shows a loading spinner when
 * the parent is uploading.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import { Circle } from '../../ux/shapes/Shapes';
import recordingButtonStyles, { recordingButtonColors } from './styles';

interface SendButtonProps {
  /** Called when the user taps send. */
  onPress: () => void;
  /** Disables the button (e.g. while still recording). */
  disabled?: boolean;
  /** Shows a loading indicator instead of the send icon. */
  loading?: boolean;
}

export default function SendButton({ onPress, disabled, loading }: SendButtonProps) {
  const { theme } = useTheme();
  const communityColor = theme.buttonColor || Colors.blue;

  const isDisabled = disabled || loading;

  return (
    <Button onPress={onPress} disabled={isDisabled}>
      <Circle
        size={40}
        color={
          isDisabled
            ? recordingButtonColors.backgroundDisabled
            : recordingButtonColors.background
        }
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <SendIcon
            color={
              isDisabled
                ? recordingButtonColors.iconDisabled
                : communityColor
            }
          />
        )}
      </Circle>
    </Button>
  );
}

/** Simple send / arrow icon drawn with Views. */
function SendIcon({ color }: { color: string }) {
  return (
    <View style={styles.sendContainer}>
      <View
        style={[
          styles.sendArrow,
          {
            borderLeftColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sendArrow: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 8,
    borderLeftWidth: 14,
    borderTopColor: 'transparent',
    borderTopWidth: 8,
    height: 0,
    marginLeft: 2,
    width: 0,
  },
  sendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
