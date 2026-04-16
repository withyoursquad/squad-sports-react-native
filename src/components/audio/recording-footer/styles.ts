/**
 * Shared styles and color constants for recording-footer buttons.
 * Ported from squad-demo/src/components/audio/recording-footer/styles.tsx.
 */
import { StyleSheet } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

export const recordingButtonColors = {
  background: Colors.white,
  backgroundDisabled: Colors.gray2,
  icon: Colors.blue,
  iconDisabled: Colors.gray6,
};

const recordingButtonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: recordingButtonColors.background,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: recordingButtonColors.backgroundDisabled,
  },
});

export default recordingButtonStyles;
