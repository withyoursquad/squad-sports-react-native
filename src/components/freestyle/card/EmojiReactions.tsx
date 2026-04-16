/**
 * EmojiReactions — Row of up to 6 unique emoji reactions with "+N" overflow.
 * Ported from squad-demo/src/components/freestyle/card/EmojiReactions.tsx.
 */
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Colors } from '../../../theme/ThemeContext';
import { BodyRegular } from '../../ux/text/Typography';
import type { Freestyle, FreestyleReaction } from '@squad-sports/core';
import { freestyleReactionUpdates } from '../../../state/sync/feed-v2';

type EmojiReactionsProps = {
  freestyle: Freestyle;
  onPress: (freestyle: Freestyle) => void;
};

export default function EmojiReactions({ freestyle, onPress }: EmojiReactionsProps) {
  const freestyleId = String((freestyle as any)?.id ?? '');
  const reactionUpdates = useRecoilValue(freestyleReactionUpdates(freestyleId));

  const uniqueEmojis = useMemo(() => {
    const reactions = Array.from(reactionUpdates?.values?.() ?? []) as unknown as FreestyleReaction[];
    const emojiReactions = reactions.filter(
      (r: any) => r.reactedTo && r.emoji,
    );

    const emojiMap: Array<{ reaction: string; count: number }> = [];
    for (const r of emojiReactions) {
      const emoji = (r as any).emoji;
      if (!emoji) continue;
      const existing = emojiMap.find(item => item.reaction === emoji);
      if (existing) {
        existing.count++;
      } else {
        emojiMap.push({ reaction: emoji, count: 1 });
      }
    }
    return emojiMap;
  }, [reactionUpdates]);

  const communityReaction = uniqueEmojis.slice(0, 6);
  const overflowCount = uniqueEmojis.length - communityReaction.length;

  const handlePress = useCallback(() => {
    onPress(freestyle);
  }, [freestyle, onPress]);

  if (!freestyleId) {
    return null;
  }

  return (
    <Pressable onPress={handlePress} style={styles.list}>
      {communityReaction.map((reaction, index) => (
        <EmojiReactionItem
          key={`emoji-reaction-${index}`}
          reaction={reaction}
          index={index}
        />
      ))}
      {overflowCount > 0 && (
        <View style={styles.userCountOverLap}>
          <Text style={styles.overflowText}>+{overflowCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

type EmojiReactionItemProps = {
  reaction: { reaction: string; count: number };
  index: number;
};

class EmojiReactionItem extends React.Component<EmojiReactionItemProps> {
  shouldComponentUpdate(nextProps: Readonly<EmojiReactionItemProps>) {
    return (
      nextProps.reaction.reaction !== this.props.reaction.reaction ||
      nextProps.reaction.count !== this.props.reaction.count
    );
  }

  render() {
    if (!this.props.reaction) {
      return null;
    }

    return (
      <View style={this.props.index === 0 ? undefined : styles.emojiOverlap}>
        <BodyRegular style={styles.emojiText}>
          {this.props.reaction.reaction || ''}
        </BodyRegular>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emojiOverlap: {
    marginLeft: -10,
  },
  emojiText: {
    color: Colors.white,
  },
  list: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  overflowText: {
    color: Colors.white,
  },
  userCountOverLap: {
    backgroundColor: Colors.gray1,
    borderColor: Colors.black,
    borderRadius: 24,
    borderWidth: 2,
    marginLeft: -10,
    padding: 4,
  },
});
