/**
 * ReactionListSheet — Bottom sheet listing all emoji reactions for a poll response.
 * Uses the SDK's SquadBottomSheet and PollUserReaction component.
 * Ported from squad-demo bottom-sheets/ReactionList.tsx.
 */
import React, { useCallback, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SquadBottomSheet, SquadBottomSheetRef } from '../../ux/bottom-sheet/SquadBottomSheet';
import PollUserReaction from '../PollUserReaction';

export interface ReactionItem {
  id: string;
  userName: string;
  userImageUrl?: string;
  emoji: string;
}

interface ReactionListSheetProps {
  visible: boolean;
  reactions: ReactionItem[];
  onDismiss: () => void;
}

export default function ReactionListSheet({
  visible,
  reactions,
  onDismiss,
}: ReactionListSheetProps) {
  const sheetRef = useRef<SquadBottomSheetRef>(null);

  const keyExtractor = useCallback(
    (item: ReactionItem) => item.id,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ReactionItem }) => (
      <PollUserReaction
        userName={item.userName}
        userImageUrl={item.userImageUrl}
        emoji={item.emoji}
        showEmoji
      />
    ),
    [],
  );

  if (!visible) return null;

  return (
    <SquadBottomSheet
      ref={sheetRef}
      title="Reactions"
      snapPoints={['50%', '80%']}
      onClose={onDismiss}
    >
      <FlatList
        data={reactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SquadBottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20,
  },
});
