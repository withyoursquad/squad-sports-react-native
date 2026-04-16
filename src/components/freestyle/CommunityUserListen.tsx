/**
 * CommunityUserListen — Listen entry for community freestyle.
 * Shows user avatar, name, community context, and first-listener badge.
 * Ported from squad-demo/src/components/freestyle/CommunityUserListen.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Colors } from '../../theme/ThemeContext';
import { TitleTiny, BodyMedium } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';
import { reCommunityById } from '../../state/communities';
import { reConnectionWithUser } from '../../state/sync/squad-v2';
import { reUserCache } from '../../state/user';

type CommunityUserListenProps = {
  reaction: {
    creator?: {
      id?: string;
      displayName?: string;
      imageUri?: string;
      community?: string;
    };
  };
  isFirstListener?: boolean;
  onUserPress?: (userId: string) => void;
};

export function CommunityFreestyleUserListen({
  reaction,
  isFirstListener,
  onUserPress,
}: CommunityUserListenProps) {
  const loggedInUser = useRecoilValue(reUserCache) as any;
  const communityId = reaction?.creator?.community ?? '';
  const community = useRecoilValue(reCommunityById(communityId));
  const connectionMap = useRecoilValue(reConnectionWithUser);

  const creatorId = reaction?.creator?.id ?? '';
  const connection = connectionMap.get(creatorId);

  const isNotInMySquad = !connection || (connection as any)?.status !== 'ACCEPTED';
  const isNotLoggedUser = loggedInUser?.id !== creatorId;

  if (!reaction.creator) {
    return null;
  }

  const subtextContent = isNotInMySquad
    ? `in ${(community as any)?.name || ''}`
    : 'from your circle';

  const content = (
    <View style={styles.reaction}>
      <View style={styles.nameContainer}>
        <UserImage
          imageUrl={reaction.creator.imageUri}
          displayName={reaction.creator.displayName}
          size={56}
        />
        <View style={styles.nameAndSubtextContainer}>
          <TitleTiny style={styles.reactionText}>
            {reaction.creator.displayName}
            {isFirstListener ? ' is the first listener' : ''}
          </TitleTiny>
          {isNotLoggedUser && (
            <BodyMedium style={styles.subtextStyle}>{subtextContent}</BodyMedium>
          )}
        </View>
      </View>
      {isFirstListener && (
        <View style={styles.circle}>
          <Text style={styles.emoji}>{'🤩'}</Text>
        </View>
      )}
    </View>
  );

  if (onUserPress && creatorId) {
    return (
      <Pressable onPress={() => onUserPress(creatorId)}>
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
  subtextStyle: {
    color: Colors.gray6,
  },
});
