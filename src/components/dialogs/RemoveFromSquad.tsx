/**
 * Remove from squad confirmation dialog.
 * Ported from squad-demo/src/components/dialogs/RemoveFromSquad.tsx
 *
 * "Are you sure you want to remove this person from your circle?"
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface RemoveFromSquadProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TITLE = 'Are you sure you want to remove this person from your circle?';
const BODY =
  'By removing them from your circle you will no longer have access to their content.';

export default function RemoveFromSquad({
  visible,
  onAccept,
  onDecline,
}: RemoveFromSquadProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{TITLE}</TitleSmall>
          <BodyMedium style={styles.body}>{BODY}</BodyMedium>
          <View style={styles.buttons}>
            <Button
              style={[styles.button, styles.buttonLeft]}
              onPress={onDecline}
            >
              <Text style={styles.buttonLeftText}>Don't Remove</Text>
            </Button>
            <Button
              style={[styles.button, styles.buttonRight]}
              onPress={onAccept}
            >
              <Text style={styles.buttonRightText}>Yes, Remove</Text>
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
