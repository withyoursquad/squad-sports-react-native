import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

interface TransparentOverlayProps {
  visible: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export default function TransparentOverlay({ visible, onPress, children }: TransparentOverlayProps) {
  if (!visible) return null;
  return (
    <Pressable style={styles.overlay} onPress={onPress}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9997 },
});
