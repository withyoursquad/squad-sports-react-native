import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

const QUICK_REACTIONS = ['fire', 'heart', '100', 'clap', 'laugh', 'cry'];

const EMOJI_MAP: Record<string, string> = {
  fire: '\u{1F525}',
  heart: '\u{2764}\u{FE0F}',
  '100': '\u{1F4AF}',
  clap: '\u{1F44F}',
  laugh: '\u{1F602}',
  cry: '\u{1F622}',
  thumbsup: '\u{1F44D}',
  thumbsdown: '\u{1F44E}',
  mind_blown: '\u{1F92F}',
  eyes: '\u{1F440}',
  pray: '\u{1F64F}',
  muscle: '\u{1F4AA}',
};

interface EmojiReactionPickerProps {
  onSelect: (emoji: string) => void;
  onDismiss: () => void;
  selectedEmoji?: string;
  compact?: boolean;
}

function EmojiReactionPicker({
  onSelect,
  onDismiss,
  selectedEmoji,
  compact = false,
}: EmojiReactionPickerProps) {
  const handleSelect = useCallback(
    (key: string) => {
      onSelect(key);
      onDismiss();
    },
    [onSelect, onDismiss],
  );

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {QUICK_REACTIONS.map(key => (
          <Pressable
            key={key}
            style={[styles.compactEmoji, selectedEmoji === key && styles.compactEmojiSelected]}
            onPress={() => handleSelect(key)}
          >
            <Text style={styles.emojiText}>{EMOJI_MAP[key] ?? key}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.picker}>
        <View style={styles.handle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
          {Object.entries(EMOJI_MAP).map(([key, emoji]) => (
            <Pressable
              key={key}
              style={[styles.emojiButton, selectedEmoji === key && styles.emojiButtonSelected]}
              onPress={() => handleSelect(key)}
            >
              <Text style={styles.emojiTextLarge}>{emoji}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(EmojiReactionPicker);

const styles = StyleSheet.create({
  // Compact inline row
  compactContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.gray2,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  compactEmoji: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  compactEmojiSelected: {
    backgroundColor: 'rgba(110, 130, 231, 0.2)',
  },
  emojiText: { fontSize: 20 },

  // Full overlay picker
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  picker: {
    backgroundColor: Colors.gray2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  emojiRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  emojiButton: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.gray3,
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(110, 130, 231, 0.3)',
    borderWidth: 2,
    borderColor: Colors.purple1,
  },
  emojiTextLarge: { fontSize: 24 },
});
