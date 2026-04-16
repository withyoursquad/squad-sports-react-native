/**
 * IntroBottomSheet.tsx
 * Introduction overlay explaining the SOTD feature.
 * Ported from squad-demo/src/components/SOTD/IntroBottomSheet.tsx
 */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import {
  BodyRegular,
  ButtonLarge,
  TitleMedium,
  TitleTiny,
} from '../../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SOTDIntroBottomSheetProps = {
  /** Called when the user taps "Reveal". */
  onReveal: () => void;
  /** Called when the sheet is dismissed. */
  onDismiss?: () => void;
};

export default function SOTDIntroBottomSheet({
  onReveal,
  onDismiss,
}: SOTDIntroBottomSheetProps) {
  return (
    <View style={styles.container}>
      <TitleTiny style={styles.introText}>Introducing</TitleTiny>
      <TitleMedium style={styles.title}>Squaddie of the Day</TitleMedium>

      {/* Icon carousel placeholder -- uses static icon in SDK */}
      <View style={styles.carouselContainer}>
        <View style={styles.introIconPlaceholder}>
          <View style={styles.introStar} />
        </View>
      </View>

      <BodyRegular style={styles.subtitle}>
        Everyday a new Squaddie will be revealed. Message them to grow your
        friendship.
      </BodyRegular>

      <Button style={styles.button} onPress={onReveal}>
        <ButtonLarge style={styles.buttonText}>Reveal</ButtonLarge>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  buttonText: {
    color: Colors.gray1,
  },
  carouselContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    height: 128,
    width: SCREEN_WIDTH,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  introIconPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    opacity: 0.9,
  },
  introStar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray1,
  },
  introText: {
    color: Colors.purple1,
  },
  subtitle: {
    color: Colors.gray6,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
  },
});
