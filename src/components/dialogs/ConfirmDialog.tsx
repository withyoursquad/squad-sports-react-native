import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <TitleSmall style={styles.title}>{title}</TitleSmall>
        <BodyRegular style={styles.message}>{message}</BodyRegular>

        <View style={styles.buttons}>
          <Button
            style={[styles.confirmButton, destructive && styles.destructiveButton]}
            onPress={onConfirm}
          >
            <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
              {confirmLabel}
            </Text>
          </Button>
          <Button style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 9999, padding: 32,
  },
  dialog: {
    backgroundColor: Colors.gray2, borderRadius: 20,
    padding: 32, width: '100%', maxWidth: 340, alignItems: 'center',
  },
  title: { color: Colors.white, marginBottom: 8, textAlign: 'center' },
  message: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  buttons: { width: '100%', gap: 8 },
  confirmButton: {
    height: 48, borderRadius: 24, backgroundColor: Colors.purple1,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmText: { color: Colors.gray1, fontSize: 15, fontWeight: '600' },
  destructiveButton: { backgroundColor: Colors.red },
  destructiveText: { color: Colors.white },
  cancelButton: { height: 48, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: Colors.gray6, fontSize: 15 },
});
