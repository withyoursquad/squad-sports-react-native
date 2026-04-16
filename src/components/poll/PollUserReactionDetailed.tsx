/**
 * PollUserReactionDetailed — Expanded reaction view showing user avatar with emoji,
 * descriptive text ("reacted to your poll response"), and timestamp.
 * Ported from squad-demo UserReactionDetailed.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular, BodySmall } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';

interface PollUserReactionDetailedProps {
  userName: string;
  userImageUrl?: string;
  emoji?: string;
  createdAt?: Date;
  onPress?: () => void;
}

function timeSinceText(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 0) return 'just now';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PollUserReactionDetailed({
  userName,
  userImageUrl,
  emoji,
  createdAt,
  onPress,
}: PollUserReactionDetailedProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <UserImage size={40} imageUrl={userImageUrl} displayName={userName} />
        {emoji && (
          <View style={styles.emojiOverlay}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
        )}
      </View>

      <BodyRegular style={styles.reactionText}>
        <Text style={styles.textBold}>{userName}</Text>
        <Text> reacted to your poll response</Text>
      </BodyRegular>

      {createdAt && (
        <BodySmall style={styles.time}>{timeSinceText(createdAt)}</BodySmall>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    fontSize: 12,
  },
  reactionText: {
    color: Colors.white,
    flex: 1,
    marginHorizontal: 20,
  },
  textBold: {
    fontWeight: 'bold',
  },
  time: {
    alignSelf: 'flex-start',
    color: Colors.white,
  },
});
