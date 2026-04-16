/**
 * UserReactionDetailed — Expanded reaction view with user info fetched live.
 * Shows user avatar, display name, and emoji reaction badge.
 * Ported from squad-demo/src/components/freestyle/UserReactionDetailed.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular, TitleTiny } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';
import { reUser } from '../../state/user';

type UserReactionDetailedProps = {
  reaction: {
    emoji?: string;
    creator?: {
      id?: string;
      displayName?: string;
      imageUri?: string;
    };
  };
  onUserPress?: (userId: string) => void;
};

export default function UserReactionDetailed({
  reaction,
  onUserPress,
}: UserReactionDetailedProps) {
  const creatorId = reaction?.creator?.id ?? '';
  const liveUser = useRecoilValue(reUser(creatorId));
  const { theme } = useTheme();

  // Use live user data when available, fallback to reaction.creator
  const effectiveUser = liveUser ?? reaction.creator;

  if ((!reaction.creator && !reaction.emoji) || !effectiveUser) {
    return null;
  }

  const textColor = theme.isDarkMode ? Colors.white : Colors.gray1;

  const content = (
    <View style={styles.container}>
      <UserImage
        imageUrl={(effectiveUser as any)?.imageUri}
        displayName={(effectiveUser as any)?.displayName}
        size={40}
      />
      <BodyRegular style={[styles.reactionText, { color: textColor }]}>
        <TitleTiny style={{ color: textColor }}>
          {(effectiveUser as any)?.displayName || ''}
        </TitleTiny>
      </BodyRegular>
      {reaction?.emoji && (
        <View style={styles.circle}>
          <Text style={styles.emoji}>{reaction.emoji}</Text>
        </View>
      )}
    </View>
  );

  if (onUserPress && creatorId) {
    return (
      <Pressable onPress={() => onUserPress(creatorId)}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderColor: Colors.gray9,
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  emoji: {
    color: Colors.white,
    fontSize: 12,
  },
  reactionText: {
    color: Colors.white,
    flex: 1,
    marginHorizontal: 20,
  },
});
