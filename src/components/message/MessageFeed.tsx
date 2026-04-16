/**
 * Message Feed — FlashList/FlatList of messages in a conversation.
 * Ported from squad-demo/src/components/message/Feed.tsx.
 */
import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import MessageCardMine from './MessageCardMine';
import MessageCardTheirs from './MessageCardTheirs';
import { BodyRegular } from '../ux/text/Typography';

interface MessageItem {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  creatorId?: string;
  creatorName?: string;
  creatorImageUrl?: string;
  timestamp?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  reactionEmoji?: string;
}

interface MessageFeedProps {
  messages: MessageItem[];
  loggedInUserId: string;
  communityColor?: string;
  onLongPressMessage?: (message: MessageItem, location: { x: number; y: number; width: number; height: number }) => void;
  onReact?: (messageId: string, emoji: string) => void;
  ListHeaderComponent?: React.ReactElement;
}

export default function MessageFeed({
  messages,
  loggedInUserId,
  communityColor = Colors.purple1,
  onLongPressMessage,
  onReact,
  ListHeaderComponent,
}: MessageFeedProps) {
  const flatListRef = useRef<FlatList>(null);

  const renderItem = useCallback(
    ({ item }: { item: MessageItem }) => {
      const isOwn = item.creatorId === loggedInUserId;

      if (isOwn) {
        return (
          <MessageCardMine
            id={item.id}
            text={item.text}
            audioUrl={item.audioUrl}
            audioDuration={item.audioDuration}
            timestamp={item.timestamp}
            reactions={item.reactions}
            communityColor={communityColor}
            reactionEmoji={item.reactionEmoji}
            onReact={(emoji) => onReact?.(item.id, emoji)}
          />
        );
      }

      return (
        <MessageCardTheirs
          id={item.id}
          text={item.text}
          audioUrl={item.audioUrl}
          audioDuration={item.audioDuration}
          senderName={item.creatorName}
          senderImageUrl={item.creatorImageUrl}
          timestamp={item.timestamp}
          reactions={item.reactions}
          communityColor={communityColor}
          reactionEmoji={item.reactionEmoji}
          onLongPress={() => {
            // Measure position for reaction overlay
            onLongPressMessage?.(item, { x: 0, y: 0, width: 0, height: 0 });
          }}
          onReact={(emoji) => onReact?.(item.id, emoji)}
        />
      );
    },
    [loggedInUserId, communityColor, onLongPressMessage, onReact],
  );

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BodyRegular style={styles.emptyText}>
          No messages yet. Send a voice message to start the conversation.
        </BodyRegular>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      inverted
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyText: {
    color: Colors.gray6,
    textAlign: 'center',
  },
});
