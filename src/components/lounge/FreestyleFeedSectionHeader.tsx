/**
 * Section header for freestyle feed ("What's New" / "Older").
 * Ported from squad-demo/src/components/freestyle/FeedSectionHeader.tsx.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Colors } from '../../theme/ThemeContext';
import { TitleSmall } from '../ux/text/Typography';
import { HorizontalLine } from '../ux/shapes/Shapes';

export default function FreestyleFeedSectionHeader({ children }: { children: string }) {
  const { theme, baseThemeColors } = useTheme();

  const lineColor = theme.isDarkMode
    ? baseThemeColors.disabledGrey
    : baseThemeColors.primaryGreyColor;

  const textColor = lineColor;

  return (
    <View style={styles.container}>
      <HorizontalLine color={lineColor} />
      <TitleSmall style={[styles.title, { color: textColor }]}>{children}</TitleSmall>
      <HorizontalLine color={lineColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    color: Colors.gray6,
    marginHorizontal: 30,
  },
});
