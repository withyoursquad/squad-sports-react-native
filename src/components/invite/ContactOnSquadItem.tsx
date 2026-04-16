/**
 * ContactOnSquadItem - Squad user row with avatar, name, and Add button.
 * Ported from squad-demo/src/screens/invite/ContactsOnSquadItem.tsx.
 */
import React, { useCallback } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyMedium, SubtitleSmall, BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type SquadUser = {
  id: string;
  displayName: string;
  imageUrl?: string | null;
  community?: string;
};

export type ContactOnSquadItemProps = {
  contactName?: string | null;
  user: SquadUser;
  handleInvite: (user: SquadUser) => void;
  communityName?: string;
  style?: ViewStyle;
};

export default function ContactOnSquadItem({
  contactName,
  user,
  handleInvite,
  communityName,
  style,
}: ContactOnSquadItemProps) {
  const { theme, baseThemeColors } = useTheme();
  const handleInviteContact = useCallback(
    () => handleInvite(user),
    [user, handleInvite],
  );

  const dark = theme.isDarkMode;
  const buttonBg = dark ? baseThemeColors.primaryWhiteColor : baseThemeColors.primaryTextColor;
  const iconColor = dark ? baseThemeColors.primaryTextColor : baseThemeColors.primaryWhiteColor;

  const context = contactName
    ? 'from my contacts'
    : `from ${communityName ?? 'Squad'}`;

  return (
    <View style={[styles.container, style]}>
      {user.imageUrl ? (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}
      <View style={styles.text}>
        <SubtitleSmall
          style={{
            color: dark
              ? baseThemeColors.primaryWhiteColor
              : baseThemeColors.primaryTextColor,
          }}
        >
          {contactName || user.displayName}
        </SubtitleSmall>
        {contactName && user.displayName ? (
          <BodyMedium
            style={{
              color: dark
                ? baseThemeColors.primaryWhiteColor
                : baseThemeColors.primaryTextColor,
            }}
          >
            {user.displayName}
          </BodyMedium>
        ) : null}
        <BodySmall
          style={{
            color: dark
              ? baseThemeColors.primaryWhiteColor
              : baseThemeColors.primaryTextColor,
          }}
        >
          {context}
        </BodySmall>
      </View>
      <Button
        onPress={handleInviteContact}
        style={[styles.button, { backgroundColor: buttonBg }]}
      >
        <BodyMedium style={[styles.buttonContent, { color: iconColor }]}>
          Add
        </BodyMedium>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray2,
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  buttonContent: {
    marginLeft: 8,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
});
