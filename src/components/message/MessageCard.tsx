import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { AudioPlayerRow } from '../audio/AudioPlayerRow';
import { BodyRegular, BodySmall } from '../ux/text/Typography';

interface MessageCardProps {
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

function MessageCard({
  id,
  text,
  audioUrl,
  audioDuration,
  isOwn,
  senderName,
  senderImageUrl,
  timestamp,
  reactions,
  primaryColor = Colors.purple1,
  onLongPress,
  onReact,
}: MessageCardProps) {
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && (
        <UserImage
          imageUrl={senderImageUrl}
          displayName={senderName}
          size={32}
        />
      )}

      <Pressable
        style={[
          styles.bubble,
          isOwn
            ? [styles.bubbleOwn, { backgroundColor: primaryColor }]
            : styles.bubbleOther,
        ]}
        onLongPress={onLongPress}
      >
        {text && (
          <BodyRegular
            style={[
              styles.text,
              { color: isOwn ? Colors.gray1 : Colors.white },
            ]}
          >
            {text}
          </BodyRegular>
        )}

        {audioUrl && (
          <View style={styles.audioContainer}>
            <AudioPlayerRow audioUrl={audioUrl} duration={audioDuration} />
          </View>
        )}

        {timestamp && (
          <BodySmall style={[styles.time, { color: isOwn ? 'rgba(0,0,0,0.4)' : Colors.gray6 }]}>
            {formatTime(timestamp)}
          </BodySmall>
        )}
      </Pressable>

      {reactions && reactions.length > 0 && (
        <View style={styles.reactions}>
          {reactions.map((r, i) => (
            <Pressable
              key={i}
              style={styles.reaction}
              onPress={() => onReact?.(r.emoji)}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              {r.count > 1 && (
                <BodySmall style={styles.reactionCount}>{r.count}</BodySmall>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default memo(MessageCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
    marginBottom: 4,
  },
  containerOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: '100%',
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.gray2,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  audioContainer: {
    minWidth: 200,
  },
  time: {
    marginTop: 4,
    textAlign: 'right',
    fontSize: 11,
  },
  reactions: {
    flexDirection: 'row',
    gap: 4,
    marginTop: -4,
    marginBottom: 4,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray3,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    color: Colors.gray6,
    marginLeft: 2,
  },
});
