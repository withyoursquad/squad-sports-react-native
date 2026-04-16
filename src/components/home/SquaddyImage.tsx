/**
 * Interactive squad member avatar with unread indicator and chat bubble.
 * Ported from squad-demo/src/screens/home/SquaddyImage.tsx
 *
 * Renders a circular avatar for a squad member.  When the connection has
 * unread messages, an orange chat-bubble overlay is shown.
 */
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import ChatBubble from './ChatBubble';
import type { SquadMemberCircleSize } from './circleDisplayConstants';

export interface SquaddyImageProps {
  /** Display name of the squad member */
  displayName?: string;
  /** Avatar image URL */
  imageUrl?: string;
  /** Circle diameter — defaults to 80 */
  size?: SquadMemberCircleSize;
  /** Whether this connection has unread messages */
  hasUnreadMessage?: boolean;
  /** Whether this member is in the "other squaddies" (overflow) section */
  isOtherSquaddies?: boolean;
  /** Called when the avatar is pressed */
  onPress?: () => void;
}

export default function SquaddyImage({
  displayName,
  imageUrl,
  size = 80,
  hasUnreadMessage = false,
  isOtherSquaddies = false,
  onPress,
}: SquaddyImageProps) {
  const content = (
    <View>
      <View
        style={[
          styles.squaddyBackgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          hasUnreadMessage && isOtherSquaddies
            ? styles.squaddyBackgroundCircleMessage
            : null,
        ]}
      >
        <UserImage
          imageUrl={imageUrl}
          displayName={displayName}
          size={size}
          borderColor={Colors.black}
        />
      </View>
      {hasUnreadMessage && (
        <View style={styles.chatBubbleOther}>
          <ChatBubble circleSize={size} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  chatBubbleOther: {
    bottom: '0%',
    left: '60%',
    position: 'absolute',
    right: '0%',
    top: '-5%',
  },
  squaddyBackgroundCircle: {
    backgroundColor: Colors.black,
    overflow: 'hidden',
  },
  squaddyBackgroundCircleMessage: {
    marginHorizontal: 5,
  },
});
