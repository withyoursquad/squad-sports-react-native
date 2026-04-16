/**
 * Flag / report content confirmation dialog.
 * Ported from squad-demo/src/components/dialogs/FlagConfirmation.tsx
 *
 * "Are you sure you want to flag this content?"
 * Will block the user and notify admins.
 */
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface FlagConfirmationProps {
  visible: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const TITLE = 'Are you sure you want to flag this content?';
const BODY =
  'By flagging this content, we will block this user and admins will be notified about their offensive content.';

export default function FlagConfirmation({
  visible,
  onConfirm,
  onCancel,
}: FlagConfirmationProps) {
  const [working, setWorking] = useState(false);

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
          <TitleSmall style={styles.title}>{TITLE}</TitleSmall>
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
});
