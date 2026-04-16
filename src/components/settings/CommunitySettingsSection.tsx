/**
 * CommunitySettingsSection - Community-specific settings row.
 * Ported from squad-demo/src/screens/settings/CommunitySettingsSection.tsx.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { TitleSmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type CommunitySettingsSectionProps = {
  onPressCommunitySettings: () => void;
};

export default function CommunitySettingsSection({
  onPressCommunitySettings,
}: CommunitySettingsSectionProps) {
  const { theme, baseThemeColors } = useTheme();

  return (
    <Button
      style={styles.rowOptionContainer}
      onPress={onPressCommunitySettings}
    >
      <TitleSmall
        style={[
          styles.titleText,
          {
            color: theme.isDarkMode
              ? baseThemeColors.primaryWhiteColor
              : baseThemeColors.primaryTextColor,
          },
        ]}
      >
        Join Fav Team
      </TitleSmall>
      <Text
        style={{
          color: theme.isDarkMode
            ? baseThemeColors.primaryWhiteColor
            : baseThemeColors.primaryTextColor,
          fontSize: 16,
        }}
      >
        {'>'}
      </Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  rowOptionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  titleText: {
    color: Colors.white,
  },
});
