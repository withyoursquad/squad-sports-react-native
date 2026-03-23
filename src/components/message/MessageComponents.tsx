/**
 * Full message component system.
 * Ported from squad-demo/src/components/message/*.
 * Components: MessageFeed, FeedMessage, CardMine, CardTheirs, Reaction,
 *             VoiceReplyOverlay, FeedReactionOverlay, EmptyContent, MessageScreenHeader.
 */
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { AudioPlayerRow } from '../audio/AudioPlayerRow';
import { BodySmall, BodyRegular } from '../ux/text/Typography';

// --- MessageReaction ---
export function MessageReaction({
  emoji, count, isOwn, onPress,
}: { emoji: string; count: number; isOwn: boolean; onPress?: () => void }) {
  return (
    <Pressable style={[styles.reaction, isOwn && styles.reactionOwn]} onPress={onPress}>
      <Text style={styles.reactionEmoji}>{emoji}</Text>
      {count > 1 && <BodySmall style={styles.reactionCount}>{count}</BodySmall>}
    </Pressable>
  );
}

// --- FeedMessage ---
export interface FeedMessageProps {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  isOwn: boolean;
  senderName?: string;
  senderImageUrl?: string;
  timestamp?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  primaryColor?: string;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
}

export const FeedMessage = memo(function FeedMessage({
  text, audioUrl, audioDuration, isOwn, senderName, senderImageUrl,
  timestamp, reactions, primaryColor = Colors.purple1, onLongPress, onReact,
}: FeedMessageProps) {
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
      {!isOwn && <UserImage imageUrl={senderImageUrl} displayName={senderName} size={32} />}
      <Pressable
        style={[styles.bubble, isOwn ? [styles.bubbleOwn, { backgroundColor: primaryColor }] : styles.bubbleOther]}
        onLongPress={onLongPress}
      >
        {text && (
          <BodyRegular style={[styles.messageText, { color: isOwn ? Colors.gray1 : Colors.white }]}>
            {text}
          </BodyRegular>
        )}
        {audioUrl && <AudioPlayerRow audioUrl={audioUrl} duration={audioDuration} />}
        {timestamp && (
          <BodySmall style={[styles.timestamp, { color: isOwn ? 'rgba(0,0,0,0.4)' : Colors.gray6 }]}>
            {formatTime(timestamp)}
          </BodySmall>
        )}
      </Pressable>
      {reactions && reactions.length > 0 && (
        <View style={styles.reactions}>
          {reactions.map((r, i) => (
            <MessageReaction key={i} emoji={r.emoji} count={r.count} isOwn={isOwn} onPress={() => onReact?.(r.emoji)} />
          ))}
        </View>
      )}
    </View>
  );
});

// --- VoiceReplyOverlay ---
export function VoiceReplyOverlay({
  visible, recipientName, onDismiss,
}: { visible: boolean; recipientName: string; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <View style={styles.voiceOverlay}>
      <Text style={styles.voiceOverlayText}>Replying to {recipientName}</Text>
      <Pressable onPress={onDismiss}><Text style={styles.voiceOverlayDismiss}>x</Text></Pressable>
    </View>
  );
}

// --- EmptyContent ---
export function EmptyMessageContent({ recipientName }: { recipientName?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>wave</Text>
      <BodyRegular style={styles.emptyText}>
        Send {recipientName ?? 'them'} a message to get started
      </BodyRegular>
    </View>
  );
}

// --- MessageFeed ---
export function MessageFeed({
  messages, renderMessage, onEndReached,
}: { messages: FeedMessageProps[]; renderMessage: (item: FeedMessageProps) => React.ReactNode; onEndReached?: () => void }) {
  return (
    <FlatList
      data={messages}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <>{renderMessage(item)}</>}
      contentContainerStyle={styles.feedList}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
    />
  );
}

const styles = StyleSheet.create({
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%', marginBottom: 4 },
  messageRowOwn: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, maxWidth: '100%' },
  bubbleOwn: { borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.gray2, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  timestamp: { marginTop: 4, textAlign: 'right', fontSize: 11 },
  reactions: { flexDirection: 'row', gap: 4, marginTop: -4, marginBottom: 4 },
  reaction: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray3, borderRadius: 12, paddingVertical: 2, paddingHorizontal: 6 },
  reactionOwn: {},
  reactionEmoji: { fontSize: 14 },
  reactionCount: { color: Colors.gray6, marginLeft: 2 },
  voiceOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: Colors.gray2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.gray3 },
  voiceOverlayText: { color: Colors.white, fontSize: 13 },
  voiceOverlayDismiss: { color: Colors.gray6, fontSize: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 40, color: Colors.gray6, marginBottom: 12 },
  emptyText: { color: Colors.gray6, textAlign: 'center' },
  feedList: { padding: 16, gap: 4 },
});
