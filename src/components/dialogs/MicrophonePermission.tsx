/**
 * Microphone permission request dialog.
 * Ported from squad-demo/src/components/dialogs/MicrophonePermission.tsx
 *
 * "Let's Talk" — mic access for voice messages, freestyles, etc.
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface MicrophonePermissionProps {
  visible: boolean;
  onContinue: () => void | Promise<void>;
}

export const MIC_TITLE = "Let's Talk";
export const MIC_BODY =
  'Mic access lets you send voice messages, post Freestyles, and connect inside the app.';

export default function MicrophonePermission({
  visible,
  onContinue,
}: MicrophonePermissionProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{MIC_TITLE}</TitleSmall>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>M</Text>
          </View>
          <BodyMedium style={styles.body}>{MIC_BODY}</BodyMedium>
          <View style={styles.buttons}>
            <Button
              style={[styles.button, styles.onlyButton, styles.buttonRight]}
              onPress={onContinue}
            >
              <Text style={[styles.buttonRightText, styles.onlyButtonText]}>
                Bet, next
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ...dialogStyles,
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
});
