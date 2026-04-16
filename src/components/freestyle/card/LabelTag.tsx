/**
 * LabelTag — Gradient badge for freestyle categories: Mental, Sports, Intelligence, General.
 * Ported from squad-demo/src/components/freestyle/card/LabelTag.tsx.
 *
 * Uses a plain View with background color since expo-linear-gradient is not
 * a required SDK dependency. Falls back to the first gradient color.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import { BodySmall } from '../../ux/text/Typography';

type LabelTagProps = {
  freestyle: {
    freestyleLabel?: string;
  };
};

type LabelType = 'Mental' | 'Sports' | 'Intelligence' | 'General';

const GRADIENT_COLORS: Record<LabelType, [string, string]> = {
  Mental: ['#01171A', '#19BD7E'],
  Sports: ['#F48326', '#E53D32'],
  Intelligence: ['#25A5D2', '#9785E6'],
  General: ['#414A4C', '#6C7283'],
};

const DEFAULT_GRADIENT: [string, string] = [Colors.gray2, Colors.gray6];

export default function LabelTag({ freestyle }: LabelTagProps) {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    if (!freestyle?.freestyleLabel) return;
    try {
      const parsed = JSON.parse(freestyle.freestyleLabel);
      if (parsed?.label) {
        setLabel(parsed.label);
      }
    } catch {
      // Invalid JSON — ignore
    }
  }, [freestyle?.freestyleLabel]);

  if (!label) {
    return null;
  }

  const gradientColors =
    GRADIENT_COLORS[label as LabelType] ?? DEFAULT_GRADIENT;

  // Try to use LinearGradient if available, otherwise fallback to solid color
  let GradientComponent: React.ComponentType<any> | null = null;
  try {
    // Dynamic import avoids hard dependency on expo-linear-gradient
    GradientComponent = require('expo-linear-gradient').LinearGradient;
  } catch {
    // Not available
  }

  return (
    <View style={styles.container}>
      {GradientComponent ? (
        <GradientComponent
          colors={gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      ) : (
        <View style={[styles.gradient, { backgroundColor: gradientColors[1] }]} />
      )}
      <BodySmall style={styles.label}>{label}</BodySmall>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  label: {
    color: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
});
