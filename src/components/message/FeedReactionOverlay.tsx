/**
 * Feed Reaction Overlay — emoji reaction picker for messages.
 * Ported from squad-demo/src/components/message/FeedReactionOverlay.tsx.
 *
 * Shows a blur overlay with emoji reaction buttons when user long-presses a message.
 */
import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { View as OverlayView } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REACTIONS = [
  { key: 'heart', emoji: '\u2764\uFE0F' },
  { key: 'fire', emoji: '\uD83D\uDD25' },
  { key: 'laugh', emoji: '\uD83D\uDE06' },
  { key: 'bolt', emoji: '\u26A1' },
  { key: 'broken', emoji: '\uD83D\uDC94' },
  { key: 'question', emoji: '\u2753' },
];

interface FeedReactionOverlayProps {
  visible: boolean;
  messageLocation?: { x: number; y: number; width: number; height: number } | null;
  onSelect: (emojiKey: string) => void;
  onClose: () => void;
}

export default function FeedReactionOverlay({
  visible,
  messageLocation,
  onSelect,
  onClose,
}: FeedReactionOverlayProps) {
  const handleSelect = useCallback(
    (key: string) => {
      onClose();
      setTimeout(() => onSelect(key), 0);
    },
    [onSelect, onClose],
  );

  if (!visible) return null;

  const selectorTop = messageLocation
    ? Math.max(60, messageLocation.y - 60)
    : 200;

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={[styles.selectorContainer, { top: selectorTop }]}>
        <View style={styles.selector}>
          {REACTIONS.map((r) => (
            <Pressable
              key={r.key}
              style={styles.reactionButton}
              onPress={() => handleSelect(r.key)}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    zIndex: 999,
  },
  selectorContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  selector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray2,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
