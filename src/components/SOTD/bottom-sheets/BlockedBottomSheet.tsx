/**
 * BlockedBottomSheet.tsx
 * Shown when user is blocked from SOTD (not enough squad members).
 * Ported from squad-demo/src/components/SOTD/BlockedBottomSheet.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import {
  BodyRegular,
  ButtonLarge,
  TitleSmall,
} from '../../ux/text/Typography';

export type SOTDBlockedBottomSheetProps = {
  /** Called when the user acknowledges the message. */
  onDismiss: () => void;
  /** Number of friends needed to unlock. */
  friendsNeeded?: number;
};

export default function SOTDBlockedBottomSheet({
  onDismiss,
  friendsNeeded = 3,
}: SOTDBlockedBottomSheetProps) {
  return (
    <View style={styles.container}>
      <TitleSmall style={styles.title}>
        It's not a Squaddie party.....yet
      </TitleSmall>
      <BodyRegular style={styles.subtitle}>
        Unlock this feature when you get {friendsNeeded} friends to join your Squad.
      </BodyRegular>
      <Button style={styles.button} onPress={onDismiss}>
        <ButtonLarge style={styles.buttonText}>Bet, got it</ButtonLarge>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
    width: 142,
  },
  buttonText: {
    color: Colors.gray1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 16,
    padding: 24,
  },
  subtitle: {
    color: Colors.white,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
});
