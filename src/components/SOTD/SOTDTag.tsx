/**
 * SOTDTag.tsx
 * "Squaddie of the Day" badge/tag with star icon.
 * Ported from squad-demo/src/components/SOTD/SOTDTag.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export type SOTDTagProps = {
  /** Container size reference; if > 40, shows a larger icon. */
  size?: number;
};

export default function SOTDTag({ size }: SOTDTagProps) {
  const iconSize = size && size > 40 ? 28 : 20;

  return (
    <View
      style={[
        styles.SOTDIcon,
        { width: iconSize, height: iconSize, borderRadius: iconSize / 2 },
      ]}
    >
      <View style={[styles.star, { width: iconSize * 0.4, height: iconSize * 0.4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  SOTDIcon: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    backgroundColor: Colors.gray1,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
});
