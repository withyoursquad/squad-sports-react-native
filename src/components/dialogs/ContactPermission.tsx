/**
 * Contact / address-book permission request dialog.
 * Ported from squad-demo/src/components/dialogs/ContactPermission.tsx
 *
 * "Assemble Your Circle" — enable contact access to find friends.
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface ContactPermissionProps {
  visible: boolean;
  onRequest: () => void | Promise<void>;
}

export const CONTACT_TITLE = 'Assemble Your Circle';
export const CONTACT_BODY =
  'Enable contact access to bring the right people into your Circle.';

export default function ContactPermission({
  visible,
  onRequest,
}: ContactPermissionProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.root}>
        <View style={styles.backdrop} />
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{CONTACT_TITLE}</TitleSmall>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>P</Text>
          </View>
          <BodyMedium style={styles.body}>{CONTACT_BODY}</BodyMedium>
          <View style={styles.buttons}>
            <Button
              style={[styles.button, styles.onlyButton, styles.buttonRight]}
              onPress={onRequest}
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
  root: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
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
