/**
 * QrLinkButton - QR code icon button for header navigation.
 * Ported from squad-demo/src/screens/invite/QrLinkButton.tsx.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';

export type QrLinkButtonProps = {
  onPress: () => void;
};

export default function QrLinkButton({ onPress }: QrLinkButtonProps) {
  return (
    <Button style={styles.qrButton} onPress={onPress}>
      <Text style={styles.icon}>QR</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  icon: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  qrButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 40,
    justifyContent: 'center',
    padding: 8,
  },
});
