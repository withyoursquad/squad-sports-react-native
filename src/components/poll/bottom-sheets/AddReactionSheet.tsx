/**
 * AddReactionSheet — Bottom sheet with emoji picker for reacting to poll responses.
 * Uses the SDK's EmojiReactionPicker and SquadBottomSheet.
 * Ported from squad-demo bottom-sheets/AddReaction.tsx.
 */
import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import { SquadBottomSheet, SquadBottomSheetRef } from '../../ux/bottom-sheet/SquadBottomSheet';
import EmojiReactionPicker from '../../ux/emoji-picker/EmojiReactionPicker';

interface AddReactionSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Called when an emoji is selected */
  onSelectEmoji: (emoji: string) => void;
  /** Called when the sheet is dismissed */
  onDismiss: () => void;
}

export default function AddReactionSheet({
  visible,
  onSelectEmoji,
  onDismiss,
}: AddReactionSheetProps) {
  const sheetRef = useRef<SquadBottomSheetRef>(null);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelectEmoji(emoji);
      sheetRef.current?.close();
    },
    [onSelectEmoji],
  );

  // When the sheet isn't visible, render nothing
  if (!visible) return null;

  return (
    <SquadBottomSheet
      ref={sheetRef}
      title="Add Reaction"
      snapPoints={['40%', '70%']}
      onClose={onDismiss}
    >
      <View style={styles.container}>
        <EmojiReactionPicker
          onSelect={handleSelect}
          onDismiss={onDismiss}
        />
      </View>
    </SquadBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
