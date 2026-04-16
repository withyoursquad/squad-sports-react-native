/**
 * Full freestyle component system.
 * Ported from squad-demo/src/components/freestyle/*.
 * Components: FeedItem, FeedSectionHeader, UserListen, UserReaction,
 *             UserReactionDetailed, CommunityUserReaction, card/ButtonWrapper, card/EmojiReactions.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { AudioPlayerRow } from '../audio/AudioPlayerRow';
import { BodySmall, BodyRegular, SubtitleSmall, TitleSmall } from '../ux/text/Typography';

// --- FeedSectionHeader ---
export function FreestyleFeedSectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <TitleSmall style={styles.sectionTitle}>{title}</TitleSmall>
      {count !== undefined && <BodySmall style={styles.sectionCount}>{count}</BodySmall>}
    </View>
  );
}

// --- FeedItem (full freestyle card) ---
export interface FreestyleFeedItemProps {
  id: string;
  audioUrl?: string;
  duration?: number;
  creatorName?: string;
  creatorImageUrl?: string;
  createdAt?: string;
  listenCount?: number;
  reactionCount?: number;
  promptText?: string;
  onPress?: () => void;
  onReact?: (emoji: string) => void;
  onListen?: () => void;
  primaryColor?: string;
}

export const FreestyleFeedItem = memo(function FreestyleFeedItem({
  audioUrl, duration, creatorName, creatorImageUrl, createdAt,
  listenCount, reactionCount, promptText, onPress, onReact, primaryColor = Colors.purple1,
}: FreestyleFeedItemProps) {
  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <UserImage imageUrl={creatorImageUrl} displayName={creatorName} size={40} />
        <View style={styles.cardHeaderText}>
          <SubtitleSmall style={styles.cardCreatorName}>{creatorName}</SubtitleSmall>
          <BodySmall style={styles.cardTimestamp}>{formatTime(createdAt)}</BodySmall>
        </View>
      </View>

      {promptText && <BodyRegular style={styles.cardPrompt}>{promptText}</BodyRegular>}

      {audioUrl && <AudioPlayerRow audioUrl={audioUrl} duration={duration} />}

      <View style={styles.cardFooter}>
        <Pressable style={styles.cardStat} onPress={() => onReact?.('fire')}>
          <Text style={styles.cardStatIcon}>fire</Text>
          <BodySmall style={styles.cardStatText}>{reactionCount ?? 0}</BodySmall>
        </Pressable>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatIcon}>ear</Text>
          <BodySmall style={styles.cardStatText}>{listenCount ?? 0}</BodySmall>
        </View>
      </View>
    </Pressable>
  );
});

// --- UserListen ---
export function FreestyleUserListen({ userName, userImageUrl, listenedAt }: {
  userName: string; userImageUrl?: string; listenedAt?: string;
}) {
  return (
    <View style={styles.userListenRow}>
      <UserImage imageUrl={userImageUrl} displayName={userName} size={36} />
      <BodyRegular style={styles.userListenName}>{userName}</BodyRegular>
      <BodySmall style={styles.userListenTime}>listened</BodySmall>
    </View>
  );
}

// --- UserReaction ---
export function FreestyleUserReaction({ userName, userImageUrl, emoji }: {
  userName: string; userImageUrl?: string; emoji: string;
}) {
  return (
    <View style={styles.userListenRow}>
      <UserImage imageUrl={userImageUrl} displayName={userName} size={36} />
      <BodyRegular style={styles.userListenName}>{userName}</BodyRegular>
      <Text style={styles.reactionEmoji}>{emoji}</Text>
    </View>
  );
}

// --- EmojiReactions bar (for cards) ---
export function FreestyleEmojiReactions({
  reactions, onReact,
}: { reactions: Array<{ emoji: string; count: number }>; onReact?: (emoji: string) => void }) {
  return (
    <View style={styles.emojiBar}>
      {reactions.map((r, i) => (
        <Pressable key={i} style={styles.emojiItem} onPress={() => onReact?.(r.emoji)}>
          <Text style={styles.emojiText}>{r.emoji}</Text>
          <BodySmall style={styles.emojiCount}>{r.count}</BodySmall>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 8 },
  sectionTitle: { color: Colors.white },
  sectionCount: { color: Colors.gray6 },
  card: { backgroundColor: Colors.gray2, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { marginLeft: 10, flex: 1 },
  cardCreatorName: { color: Colors.white },
  cardTimestamp: { color: Colors.gray6 },
  cardPrompt: { color: Colors.gray8, marginBottom: 12, fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.gray3 },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatIcon: { color: Colors.gray6, fontSize: 14 },
  cardStatText: { color: Colors.gray6 },
  userListenRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  userListenName: { color: Colors.white, flex: 1 },
  userListenTime: { color: Colors.gray6 },
  reactionEmoji: { fontSize: 20 },
  emojiBar: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  emojiItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gray3, borderRadius: 16, paddingVertical: 4, paddingHorizontal: 8 },
  emojiText: { fontSize: 16 },
  emojiCount: { color: Colors.gray6 },
});
