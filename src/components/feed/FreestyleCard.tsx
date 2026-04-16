import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { AudioPlayerRow } from '../audio/AudioPlayerRow';
import { BodyRegular, BodySmall, SubtitleSmall } from '../ux/text/Typography';

interface FreestyleCardProps {
  id: string;
  audioUrl?: string;
  duration?: number;
  creatorName?: string;
  creatorImageUrl?: string;
  createdAt?: string;
  listenCount?: number;
  reactionCount?: number;
  prompt?: string;
  onPress?: () => void;
  onReact?: (emoji: string) => void;
}

function FreestyleCard({
  id,
  audioUrl,
  duration,
  creatorName,
  creatorImageUrl,
  createdAt,
  listenCount,
  reactionCount,
  prompt,
  onPress,
  onReact,
}: FreestyleCardProps) {
  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <UserImage imageUrl={creatorImageUrl} displayName={creatorName} size={40} />
        <View style={styles.headerText}>
          <SubtitleSmall style={styles.creatorName}>{creatorName}</SubtitleSmall>
          <BodySmall style={styles.timestamp}>{formatTime(createdAt)}</BodySmall>
        </View>
      </View>

      {prompt && (
        <BodyRegular style={styles.prompt}>{prompt}</BodyRegular>
      )}

      {audioUrl && (
        <AudioPlayerRow audioUrl={audioUrl} duration={duration} />
      )}

      <View style={styles.footer}>
        <Pressable style={styles.stat} onPress={() => onReact?.('fire')}>
          <Text style={styles.statIcon}>{'fire'}</Text>
          <BodySmall style={styles.statText}>{reactionCount ?? 0}</BodySmall>
        </Pressable>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>{'ear'}</Text>
          <BodySmall style={styles.statText}>{listenCount ?? 0}</BodySmall>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(FreestyleCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  creatorName: { color: Colors.white },
  timestamp: { color: Colors.gray6 },
  prompt: {
    color: Colors.gray8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray3,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { color: Colors.gray6, fontSize: 14 },
  statText: { color: Colors.gray6 },
});
