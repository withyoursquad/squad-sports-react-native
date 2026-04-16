/**
 * FreestyleFeedItem — Wrapper that renders a freestyle card with its reactions row.
 * Two-column layout: emoji reactions on left, listen reactions on right.
 * Ported from squad-demo/src/components/freestyle/FeedItem.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Freestyle } from '@squad-sports/core';
import FreestyleCardButtonWrapper from './FreestyleCardButtonWrapper';
import EmojiReactions from './card/EmojiReactions';
import ListenReactions from './card/ListenReactions';

export type FreestyleFeedItemProps = {
  freestyle: Freestyle;
  onFreestylePress: (freestyle: Freestyle) => void;
  onCardReactionsPress: (freestyle: Freestyle) => void;
  onCardListensPress: (freestyle: Freestyle) => void;
};

export default function FreestyleFeedItem({
  freestyle,
  onFreestylePress,
  onCardReactionsPress,
  onCardListensPress,
}: FreestyleFeedItemProps) {
  const handleFreestylePress = useCallback(() => {
    onFreestylePress(freestyle);
  }, [freestyle, onFreestylePress]);

  return (
    <View>
      <View style={styles.freestyleReactionSeparation}>
        <FreestyleCardButtonWrapper freestyle={freestyle} onPress={handleFreestylePress} />
      </View>
      <View style={styles.reactions}>
        <View>
          <EmojiReactions freestyle={freestyle} onPress={onCardReactionsPress} />
        </View>
        <View>
          <ListenReactions freestyle={freestyle} onPress={onCardListensPress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  freestyleReactionSeparation: {
    marginVertical: 12,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
