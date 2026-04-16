/**
 * Message card for the other user's messages.
 * Ported from squad-demo/src/components/message/CardTheirs.tsx.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import MessageCard from './MessageCard';
import MessageReactionIcon from './MessageReactionIcon';

interface MessageCardTheirsProps {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  senderName?: string;
  senderImageUrl?: string;
  timestamp?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  communityColor?: string;
  reactionEmoji?: string;
  onLongPress?: () => void;
  onReact?: (emoji: string) => void;
}

function MessageCardTheirs({
  id,
  text,
  audioUrl,
  audioDuration,
  senderName,
  senderImageUrl,
  timestamp,
  reactions,
  communityColor = Colors.purple1,
  reactionEmoji,
  onLongPress,
  onReact,
}: MessageCardTheirsProps) {
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
        isOwn={false}
        senderName={senderName}
        senderImageUrl={senderImageUrl}
        timestamp={timestamp}
        reactions={reactions}
        primaryColor={communityColor}
        onLongPress={onLongPress}
        onReact={onReact}
      />
    </View>
  );
}

export default memo(MessageCardTheirs);

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
