/**
 * Unblock user confirmation dialog.
 * Ported from squad-demo/src/components/dialogs/UnblockConfirmation.tsx
 *
 * "Are you sure you want to unblock <user>?"
 */
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface UnblockConfirmationProps {
  visible: boolean;
  userName?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const BODY =
  'If you unblock this user, you will be able to add them back to your circle again.';

export default function UnblockConfirmation({
  visible,
  userName,
  onConfirm,
  onCancel,
}: UnblockConfirmationProps) {
  const [working, setWorking] = useState(false);

  const title = `Are you sure you want to unblock ${userName?.trim() ?? 'this user'}?`;

  const handleConfirm = useCallback(async () => {
    setWorking(true);
    try {
      await onConfirm();
    } finally {
      setWorking(false);
    }
  }, [onConfirm]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{title}</TitleSmall>
          <BodyMedium style={styles.body}>{BODY}</BodyMedium>
          <View style={styles.buttons}>
            <Button
              disabled={working}
              disabledStyle={styles.buttonLeftDisabled}
              style={[styles.button, styles.buttonLeft]}
              onPress={onCancel}
            >
              <Text style={styles.buttonLeftText}>Nah, I'm good</Text>
            </Button>
            <Button
              disabled={working}
              disabledStyle={styles.buttonRightDisabled}
              style={[styles.button, styles.buttonRight]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonRightText}>Yea, for sure</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ...dialogStyles,
  body: {
    ...dialogStyles.body,
    color: Colors.gray6,
  },
});
