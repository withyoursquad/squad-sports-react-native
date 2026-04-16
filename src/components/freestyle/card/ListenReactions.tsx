/**
 * ListenReactions — Row of up to 3 user avatars who listened + "+N" count.
 * Ported from squad-demo/src/components/freestyle/card/ListenReactions.tsx.
 */
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Colors } from '../../../theme/ThemeContext';
import { BodyMedium, BodySmall } from '../../ux/text/Typography';
import UserImage from '../../ux/user-image/UserImage';
import type { Freestyle, FreestyleReaction } from '@squad-sports/core';
import { freestyleReactionUpdates } from '../../../state/sync/feed-v2';

type ListenReactionsProps = {
  freestyle: Freestyle;
  onPress: (freestyle: Freestyle) => void;
};

const MAX_VISIBLE = 3;

export default function ListenReactions({ freestyle, onPress }: ListenReactionsProps) {
  const freestyleId = String((freestyle as any)?.id ?? '');
  const reactionUpdates = useRecoilValue(freestyleReactionUpdates(freestyleId));

  const handlePress = useCallback(() => {
    onPress(freestyle);
  }, [freestyle, onPress]);

  /** Dedupe by user.id to guarantee no user renders twice */
  const listens = useMemo(() => {
    const reactions = Array.from(reactionUpdates?.values?.() ?? []) as unknown as FreestyleReaction[];
    const listenReactions = reactions.filter((r: any) => r.listenedTo);

    const seen = new Set<string>();
    return listenReactions.filter((reaction: any) => {
      const userId = reaction.creator?.id;
      if (!userId) return false;
      const key = String(userId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [reactionUpdates]);

  if (!freestyleId || listens.length === 0) {
    return null;
  }

  const visibleListens = listens.slice(0, MAX_VISIBLE);
  const remainingCount = listens.length - MAX_VISIBLE;

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <BodyMedium style={styles.text}>Listened</BodyMedium>

      {visibleListens.map((reaction: any, index: number) => (
        <View
          style={[styles.listenIcon, index > 0 ? styles.listenIconOverlap : undefined]}
          key={`listen-${reaction.creator?.id ?? reaction.id}`}
        >
          <UserImage
            imageUrl={reaction.creator?.imageUri}
            displayName={reaction.creator?.displayName}
            size={24}
          />
        </View>
      ))}

      {remainingCount > 0 && (
        <View style={[styles.listenIcon, styles.listenIconOverlap, styles.moreCircle]}>
          <BodySmall style={styles.moreText}>+{remainingCount}</BodySmall>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listenIcon: {
    marginRight: 5,
  },
  listenIconOverlap: {
    marginLeft: -13,
    zIndex: 10,
  },
  moreCircle: {
    backgroundColor: Colors.blackBackground,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: Colors.white,
  },
  text: {
    color: Colors.gray6,
    marginRight: 5,
  },
});
