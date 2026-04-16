/**
 * EmptyFeedText - Empty state text for when a profile has no freestyles.
 * Ported from squad-demo/src/screens/profile/slivers/EmptyFeedText.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular, TitleRegular } from '../ux/text/Typography';

export type EmptyFeedTextProps = {
  displayName: string;
  isMyProfile: boolean;
  isNotInMySquad: boolean;
  isEmcee?: boolean;
};

export default function EmptyFeedText({
  displayName,
  isMyProfile,
  isNotInMySquad,
  isEmcee = false,
}: EmptyFeedTextProps) {
  const { theme, baseThemeColors } = useTheme();

  let text = `${displayName} hasn't been here in a while.\nMaybe check in with them.`;
  let emoji = '\uD83E\uDD14';

  if (isMyProfile) {
    text = "Let your friends know what's good.\nIt'll literally take a min.";
  } else if (isNotInMySquad) {
    text = `You're not in ${displayName}'s Circle yet. Their world is shared inside.`;
  } else if (isEmcee) {
    text = `See what ${displayName} is up to`;
    emoji = '\uD83D\uDE0E';
  }

  return (
    <View style={styles.noFreestyles}>
      {!isMyProfile && (
        <View style={styles.emojiContainer}>
          <View style={styles.gradient} />
          <TitleRegular style={styles.emoji}>{emoji}</TitleRegular>
        </View>
      )}
      <BodyRegular
        style={[
          styles.noFreestylesText,
          {
            color: theme.isDarkMode
              ? baseThemeColors.primaryWhiteColor
              : baseThemeColors.primaryTextColor,
          },
        ]}
      >
        {text}
      </BodyRegular>
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    color: Colors.white,
  },
  emojiContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  gradient: {
    borderRadius: 28,
    height: 56,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 56,
  },
  noFreestyles: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noFreestylesText: {
    color: Colors.white,
    textAlign: 'center',
  },
});
