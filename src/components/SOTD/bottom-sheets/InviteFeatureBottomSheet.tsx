/**
 * InviteFeatureBottomSheet.tsx
 * Invite friends to unlock SOTD feature.
 * Ported from squad-demo/src/components/SOTD/InviteFeatureBottomSheet.tsx
 */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import {
  BodyMedium,
  ButtonLarge,
  TitleMedium,
} from '../../ux/text/Typography';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export type InviteFeatureBottomSheetProps = {
  /** Called when the user taps the action button to invite. */
  onInvite: () => void;
  /** Called when the sheet is dismissed. */
  onDismiss?: () => void;
};

export default function InviteFeatureBottomSheet({
  onInvite,
  onDismiss,
}: InviteFeatureBottomSheetProps) {
  return (
    <View style={styles.container}>
      <TitleMedium style={styles.title}>Draft Your Inner Circle</TitleMedium>
      <BodyMedium style={styles.description}>
        Select the ones committed to leveling up -- consistently. Iron sharpens
        iron. Who are you shifting with?
      </BodyMedium>

      {/* Animation placeholder (replaces Lottie from demo) */}
      <View style={styles.animationContainer}>
        <View style={styles.animationPlaceholder}>
          <View style={styles.circleGroup}>
            <View style={[styles.circle, styles.circleLeft]} />
            <View style={[styles.circle, styles.circleCenter]} />
            <View style={[styles.circle, styles.circleRight]} />
          </View>
        </View>
      </View>

      <Button style={styles.button} onPress={onInvite}>
        <ButtonLarge style={styles.buttonText}>Bet, got it</ButtonLarge>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationPlaceholder: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 6,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: Colors.gray1,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.white,
    backgroundColor: Colors.gray2,
  },
  circleCenter: {
    zIndex: 1,
    transform: [{ scale: 1.2 }],
  },
  circleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -15,
  },
  circleLeft: {
    opacity: 0.6,
  },
  circleRight: {
    opacity: 0.6,
  },
  container: {
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  description: {
    color: Colors.gray6,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
});
