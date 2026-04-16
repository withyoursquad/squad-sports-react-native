/**
 * SquaddyActivePollCard — Poll card for viewing a squaddy's response.
 * Shows their response card with emoji reactions. If the current user
 * hasn't responded yet, the response is blurred.
 * Ported from squad-demo layouts/SquaddyActivePollCard.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import PollResponseCard, { PollResponseCardData, PollResponseUser } from '../PollResponseCard';

export interface EmojiReaction {
  id: string;
  emoji: string;
}

interface SquaddyActivePollCardProps {
  poll: PollResponseCardData;
  /** The squaddy whose response is being displayed */
  user: PollResponseUser;
  /** The option ID chosen by the squaddy */
  pollOptionId: number;
  /** Whether the current (logged-in) user has responded to this poll */
  currentUserHasResponded: boolean;
  /** Emoji reactions on this response */
  reactions?: EmojiReaction[];
  /** Called when the card is pressed (to add a reaction) */
  onAddReaction?: () => void;
  /** Called when the reactions row is pressed (to view all reactions) */
  onViewReactions?: () => void;
}

export function SquaddyActivePollCard({
  poll,
  user,
  pollOptionId,
  currentUserHasResponded,
  reactions = [],
  onAddReaction,
  onViewReactions,
}: SquaddyActivePollCardProps) {
  const handleCardPress = useCallback(() => {
    if (currentUserHasResponded) {
      onAddReaction?.();
    }
  }, [currentUserHasResponded, onAddReaction]);

  const handleReactionsPress = useCallback(() => {
    onViewReactions?.();
  }, [onViewReactions]);

  if (!currentUserHasResponded) {
    return (
      <PollResponseCard
        poll={poll}
        pollOptionId={pollOptionId}
        user={user}
        blur
      />
    );
  }

  return (
    <View>
      <Button onPress={handleCardPress}>
        <PollResponseCard
          poll={poll}
          pollOptionId={pollOptionId}
          user={user}
        />
      </Button>

      {reactions.length > 0 && (
        <Button onPress={handleReactionsPress}>
          <View style={styles.emojiRow}>
            {reactions.map((reaction, index) => (
              <View
                key={reaction.id}
                style={index === 0 ? undefined : styles.emojiOverlap}
              >
                <Text style={styles.emoji}>{reaction.emoji}</Text>
              </View>
            ))}
          </View>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emoji: {
    fontSize: 18,
    color: Colors.white,
  },
  emojiOverlap: {
    marginLeft: -10,
  },
});
