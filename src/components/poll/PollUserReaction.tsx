/**
 * PollUserReaction — Displays a user's emoji reaction to a poll response.
 * Shows avatar, display name, and optional emoji overlay.
 * Ported from squad-demo UserReaction.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';

interface PollUserReactionProps {
  userName: string;
  userImageUrl?: string;
  userId?: string;
  emoji?: string;
  showEmoji?: boolean;
  onPress?: () => void;
}

export default function PollUserReaction({
  userName,
  userImageUrl,
  emoji,
  showEmoji = true,
  onPress,
}: PollUserReactionProps) {
  return (
    <View style={styles.reaction}>
      <View style={styles.avatarWrapper}>
        <UserImage size={56} imageUrl={userImageUrl} displayName={userName} />
        {showEmoji && emoji && (
          <View style={styles.emojiOverlay}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
        )}
      </View>
      <BodyRegular style={styles.reactionText}>{userName}</BodyRegular>
    </View>
  );
}

const styles = StyleSheet.create({
  reaction: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  emojiOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.gray2,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  emojiText: {
    fontSize: 14,
  },
  reactionText: {
    color: Colors.white,
    marginLeft: 15,
  },
});
