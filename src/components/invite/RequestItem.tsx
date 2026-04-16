/**
 * RequestItem - Pending request row with accept/decline buttons.
 * Ported from squad-demo/src/screens/invite/RequestItem.tsx.
 */
import React, { useCallback } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyMedium, SubtitleSmall, BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import RequestItemMenu from './RequestItemMenu';

export type RequestUser = {
  id: string;
  displayName: string;
  imageUrl?: string | null;
  community?: string;
  status?: string;
};

export type RequestItemProps = {
  contactName?: string | null;
  user: RequestUser;
  isRequestSent: boolean;
  retractInvite: (user: RequestUser, isRequestSent: boolean) => void;
  acceptInvite: (user: RequestUser) => void;
  blockInvite: (user: RequestUser) => void;
  communityName?: string | null;
  style?: ViewStyle;
};

export default function RequestItem({
  contactName,
  user,
  isRequestSent,
  retractInvite,
  acceptInvite,
  blockInvite,
  communityName,
  style,
}: RequestItemProps) {
  const { theme, baseThemeColors } = useTheme();
  const dark = theme.isDarkMode;

  const handleAcceptInvite = useCallback(
    () => acceptInvite(user),
    [acceptInvite, user],
  );

  const handleCancelInvite = useCallback(
    () => retractInvite(user, isRequestSent),
    [isRequestSent, retractInvite, user],
  );

  const handleBlockUser = useCallback(
    () => blockInvite(user),
    [blockInvite, user],
  );

  const isPrereg = user.status === 'prereg';
  let context: string | undefined;
  if (contactName) {
    context = 'from my contacts';
  } else if (communityName) {
    context = `from ${communityName}`;
  } else if (!isPrereg) {
    context = 'from Squad';
  }

  const buttonBg = dark
    ? baseThemeColors.primaryWhiteColor
    : baseThemeColors.primaryTextColor;

  const buttonTextColor = dark
    ? baseThemeColors.primaryTextColor
    : baseThemeColors.primaryWhiteColor;

  return (
    <View style={[styles.container, style]}>
      {user.imageUrl ? (
        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
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
        {context && (
          <BodySmall
            style={{
              color: dark
                ? baseThemeColors.primaryWhiteColor
                : baseThemeColors.primaryTextColor,
            }}
          >
            {context}
          </BodySmall>
        )}
      </View>
      <View style={styles.footer}>
        <Button
          onPress={handleAcceptInvite}
          disabled={isRequestSent}
          style={[
            styles.button,
            { backgroundColor: isRequestSent ? Colors.gray1 : buttonBg },
          ]}
        >
          <BodyMedium
            style={{
              color: isRequestSent ? Colors.gray6 : buttonTextColor,
            }}
          >
            {isRequestSent ? 'Request sent' : 'Accept'}
          </BodyMedium>
        </Button>
        <RequestItemMenu
          isRequestSent={isRequestSent}
          onBlock={handleBlockUser}
          onIgnore={handleCancelInvite}
          style={styles.menuButton}
        />
      </View>
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
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menuButton: {
    marginLeft: 8,
  },
  text: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
});
