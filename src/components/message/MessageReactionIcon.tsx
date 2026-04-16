/**
 * Message reaction icon — renders emoji for message reactions.
 * Ported from squad-demo/src/components/message/Reaction.tsx.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const REACTION_EMOJIS: Record<string, string> = {
  bolt: '\u26A1',
  fire: '\uD83D\uDD25',
  laugh: '\uD83D\uDE06',
  broken: '\uD83D\uDC94',
  heart: '\u2764\uFE0F',
  question: '\u2753',
};

interface MessageReactionIconProps {
  emoji: string;
}

export default function MessageReactionIcon({ emoji }: MessageReactionIconProps) {
  const display = REACTION_EMOJIS[emoji] ?? emoji;

  if (!display) return null;

  return <Text style={styles.emoji}>{display}</Text>;
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 16,
  },
});
