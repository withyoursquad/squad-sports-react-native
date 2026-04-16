/**
 * Camera permission request dialog.
 * Ported from squad-demo/src/components/dialogs/CameraPermission.tsx
 *
 * Explains camera access for profile photos and QR code scanning.
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface CameraPermissionProps {
  visible: boolean;
  onContinue: () => void | Promise<void>;
}

export const CAMERA_TITLE = 'Camera Access';
export const CAMERA_BODY =
  'Camera access lets us update your profile photo and scan invitation QR codes.';

export default function CameraPermission({
  visible,
  onContinue,
}: CameraPermissionProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{CAMERA_TITLE}</TitleSmall>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>C</Text>
          </View>
          <BodyMedium style={styles.body}>{CAMERA_BODY}</BodyMedium>
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
