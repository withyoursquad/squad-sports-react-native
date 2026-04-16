/**
 * Message card for the logged-in user's own messages.
 * Ported from squad-demo/src/components/message/CardMine.tsx.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import MessageCard from './MessageCard';
import MessageReactionIcon from './MessageReactionIcon';

interface MessageCardMineProps {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  communityColor?: string;
  reactionEmoji?: string;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
}

function MessageCardMine({
  id,
  text,
  audioUrl,
  audioDuration,
  timestamp,
  reactions,
  communityColor = Colors.purple1,
  reactionEmoji,
  onLongPress,
  onReact,
}: MessageCardMineProps) {
  const isPlaceholder = !audioUrl && !text;

  return (
    <View style={styles.wrapper}>
      {reactionEmoji && (
        <View style={styles.reactionIcon}>
          <MessageReactionIcon emoji={reactionEmoji} />
        </View>
      )}
      <MessageCard
        id={id}
        text={text}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
        isOwn={true}
        timestamp={timestamp}
        reactions={reactions}
        primaryColor={communityColor}
        onLongPress={onLongPress}
        onReact={onReact}
      />
    </View>
  );
}

export default memo(MessageCardMine);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  reactionIcon: {
    left: -4,
    position: 'absolute',
    top: -3,
    transform: [{ rotate: '-30deg' }],
    zIndex: 200,
  },
});
