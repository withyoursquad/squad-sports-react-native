/**
 * UserImage variant components.
 * Ported from squad-demo/src/components/ux/user-image/*.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserImage from './UserImage';
import { Colors } from '../../../theme/ThemeContext';

// --- ImageCircle ---
export function ImageCircle({ uri, size = 48 }: { uri?: string; size?: number }) {
  return <UserImage imageUrl={uri} displayName="" size={size} />;
}

// --- UserImageWithEmoji ---
export function UserImageWithEmoji({
  imageUrl, displayName, size = 48, emoji,
}: { imageUrl?: string; displayName?: string; size?: number; emoji?: string }) {
  return (
    <View>
      <UserImage imageUrl={imageUrl} displayName={displayName} size={size} />
      {emoji && (
        <View style={[styles.emojiBadge, { bottom: -2, right: -2 }]}>
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>
      )}
    </View>
  );
}

// --- CommunityImageWithEmoji ---
export function CommunityImageWithEmoji({
  imageUrl, name, emoji, size = 48,
}: { imageUrl?: string; name?: string; emoji?: string; size?: number }) {
  return <UserImageWithEmoji imageUrl={imageUrl} displayName={name} size={size} emoji={emoji} />;
}

// --- FounderImageWithEmoji ---
export function FounderImageWithEmoji({
  imageUrl, displayName, size = 48,
}: { imageUrl?: string; displayName?: string; size?: number }) {
  return <UserImageWithEmoji imageUrl={imageUrl} displayName={displayName} size={size} emoji="star" />;
}

// --- UserImageWithTag ---
export function UserImageWithTag({
  imageUrl, displayName, tag, tagColor, size = 48,
}: { imageUrl?: string; displayName?: string; tag: string; tagColor?: string; size?: number }) {
  return (
    <View>
      <UserImage imageUrl={imageUrl} displayName={displayName} size={size} />
      <View style={[styles.tagBadge, { backgroundColor: tagColor ?? Colors.purple1 }]}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    </View>
  );
}

// --- WithProfileLink ---
export function WithProfileLink({
  userId, children,
}: { userId: string; children: React.ReactNode }) {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => (navigation as any).navigate('Profile', { userId })} accessibilityRole="link">
      {children}
    </Pressable>
  );
}

// --- WithMessagingLink ---
export function WithMessagingLink({
  connectionId, children,
}: { connectionId: string; children: React.ReactNode }) {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => (navigation as any).navigate('Messaging', { connectionId })} accessibilityRole="link">
      {children}
    </Pressable>
  );
}

// --- WithMessagingOrProfileLink ---
export function WithMessagingOrProfileLink({
  userId, connectionId, children,
}: { userId: string; connectionId?: string; children: React.ReactNode }) {
  const navigation = useNavigation();
  const handlePress = () => {
    if (connectionId) {
      (navigation as any).navigate('Messaging', { connectionId });
    } else {
      (navigation as any).navigate('Profile', { userId });
    }
  };
  return <Pressable onPress={handlePress} accessibilityRole="link">{children}</Pressable>;
}

const styles = StyleSheet.create({
  emojiBadge: { position: 'absolute', backgroundColor: Colors.gray2, borderRadius: 10, padding: 2 },
  emojiText: { fontSize: 12 },
  tagBadge: { position: 'absolute', bottom: -4, right: -4, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: Colors.gray9 },
  tagText: { color: Colors.white, fontSize: 8, fontWeight: '700' },
});
