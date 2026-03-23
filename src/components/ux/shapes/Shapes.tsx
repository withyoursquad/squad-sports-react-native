/**
 * Shape components.
 * Ported from squad-demo/src/components/ux/shapes/.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

export function Circle({ size = 48, color = Colors.purple1, children }: { size?: number; color?: string; children?: React.ReactNode }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      {children}
    </View>
  );
}

export function HorizontalLine({ color = Colors.gray3, thickness = StyleSheet.hairlineWidth, marginVertical = 0 }: { color?: string; thickness?: number; marginVertical?: number }) {
  return <View style={{ height: thickness, backgroundColor: color, marginVertical }} />;
}

const styles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
});
