/**
 * Photo library / images permission request dialog.
 * Ported from squad-demo/src/components/dialogs/ImagesPermission.tsx
 *
 * Photo library access for profile and sharing.
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface ImagesPermissionProps {
  visible: boolean;
  onContinue: () => void | Promise<void>;
}

export const IMAGES_TITLE = 'Photo Library Access';
export const IMAGES_BODY =
  'Photo library access lets you select photos for your profile and share with your squad.';

export default function ImagesPermission({
  visible,
  onContinue,
}: ImagesPermissionProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{IMAGES_TITLE}</TitleSmall>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>I</Text>
          </View>
          <BodyMedium style={styles.body}>{IMAGES_BODY}</BodyMedium>
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
