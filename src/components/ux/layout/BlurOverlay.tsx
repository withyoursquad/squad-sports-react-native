import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BlurOverlayProps {
  visible: boolean;
  children?: React.ReactNode;
}

export default function BlurOverlay({ visible, children }: BlurOverlayProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
  },
});
