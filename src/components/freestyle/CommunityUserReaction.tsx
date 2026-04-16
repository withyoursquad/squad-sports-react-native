/**
 * CommunityUserReaction — Reaction entry for community freestyle.
 * Shows user avatar, display name, optional children (subtext), and emoji badge.
 * Ported from squad-demo/src/components/freestyle/CommunityUserReaction.tsx.
 */
import React, { type ReactElement } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleTiny } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';

type CommunityUserReactionProps = {
  reaction: {
    emoji?: string;
    creator?: {
      id?: string;
      displayName?: string;
      imageUri?: string;
    };
  };
  children?: ReactElement;
  onUserPress?: (userId: string) => void;
};

export default function CommunityUserReaction({
  reaction,
  children,
  onUserPress,
}: CommunityUserReactionProps) {
  if (!reaction.creator) {
    return null;
  }

  const content = (
    <View style={styles.reaction}>
      <View style={styles.nameContainer}>
        <UserImage
          imageUrl={reaction.creator.imageUri}
          displayName={reaction.creator.displayName}
          size={40}
        />
        <View style={styles.nameAndSubtextContainer}>
          <TitleTiny style={styles.reactionText}>
            {reaction.creator.displayName}
          </TitleTiny>
          {children}
        </View>
      </View>
      {reaction.emoji && (
        <View style={styles.circle}>
          <Text style={styles.emoji}>{reaction.emoji}</Text>
        </View>
      )}
    </View>
  );

  if (onUserPress && reaction.creator.id) {
    return (
      <Pressable onPress={() => onUserPress(reaction.creator!.id!)}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderColor: Colors.gray9,
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  emoji: {
    color: Colors.white,
    fontSize: 12,
  },
  nameAndSubtextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  reaction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reactionText: {
    color: Colors.white,
  },
});
