/**
 * UserListen — Individual listen entry with avatar + name.
 * Shows the first listener badge with a star emoji when applicable.
 * Ported from squad-demo/src/components/freestyle/UserListen.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { TitleTiny } from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';

type UserListenProps = {
  reaction: {
    creator?: {
      id?: string;
      displayName?: string;
      imageUri?: string;
    };
  };
  isFirstListener?: boolean;
  onUserPress?: (userId: string) => void;
};

export function FreestyleUserListen({
  reaction,
  isFirstListener,
  onUserPress,
}: UserListenProps) {
  const { theme } = useTheme();

  if (!reaction.creator) {
    return null;
  }

  const textColor = theme.isDarkMode ? Colors.white : Colors.gray1;

  const content = (
    <View style={styles.reaction}>
      <View style={styles.nameContainer}>
        <UserImage
          imageUrl={reaction.creator.imageUri}
          displayName={reaction.creator.displayName}
          size={40}
        />
        <TitleTiny style={[styles.reactionText, { color: textColor }]}>
          {reaction.creator.displayName}
          {isFirstListener ? ' is the first listener' : ''}
        </TitleTiny>
      </View>
      {isFirstListener && (
        <View style={styles.circle}>
          <Text style={styles.emoji}>{'🤩'}</Text>
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
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    height: 56,
  },
  reaction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reactionText: {
    color: Colors.white,
    flex: 1,
    marginLeft: 16,
  },
});
