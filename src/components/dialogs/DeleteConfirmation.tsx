/**
 * Delete account confirmation dialog.
 * Ported from squad-demo/src/components/dialogs/DeleteConfirmation.tsx
 *
 * Shows account deletion message with 24hr notice.
 */
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';
import { dialogStyles } from './DialogStyles';

export interface DeleteConfirmationProps {
  visible: boolean;
}

export default function DeleteConfirmation({ visible }: DeleteConfirmationProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>Account Deleted</TitleSmall>
          <BodyRegular style={[styles.text, styles.textOrange]}>
            Please give us 24hrs to fully delete your account and remove your
            data from our system.
          </BodyRegular>
          <BodyRegular style={styles.text}>
            Nothing left for you to do. Please close the app.
          </BodyRegular>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: dialogStyles.overlay,
  modal: {
    ...dialogStyles.modal,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    textAlign: 'center',
  },
  textOrange: {
    color: Colors.orange2,
    marginBottom: 20,
  },
  title: {
    color: Colors.white,
    marginBottom: 20,
  },
});
