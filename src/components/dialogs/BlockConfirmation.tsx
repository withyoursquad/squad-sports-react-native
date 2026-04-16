/**
 * Block confirmation dialog.
 * Ported from squad-demo/src/components/dialogs/BlockConfirmation.tsx
 *
 * "Are you sure you want to block this person?"
 * Confirm/cancel with Accept/Decline footer.
 */
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, View, Text, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface BlockConfirmationProps {
  visible: boolean;
  userName?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const TITLE = 'Are you sure you want to block this person?';
const BODY =
  'By blocking them you will no longer have access to their content.';

export default function BlockConfirmation({
  visible,
  userName,
  onConfirm,
  onCancel,
}: BlockConfirmationProps) {
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
              <Text style={styles.buttonLeftText}>Don't Block</Text>
            </Button>
            <Button
              disabled={working}
              disabledStyle={styles.buttonRightDisabled}
              style={[styles.button, styles.buttonRight]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonRightText}>Yes, Block</Text>
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
