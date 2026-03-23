/**
 * FeedSquad component — squad circle display for the home feed.
 * Ported from squad-demo/src/components/squad/FeedSquad.tsx.
 */
import React, { memo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodySmall } from '../ux/text/Typography';

interface SquadMember {
  id: string;
  displayName?: string;
  imageUrl?: string;
}

interface FeedSquadProps {
  members: SquadMember[];
  onMemberPress: (userId: string) => void;
  primaryColor?: string;
}

function FeedSquad({ members, onMemberPress, primaryColor = Colors.purple1 }: FeedSquadProps) {
  return (
    <FlatList
      data={members}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.member} onPress={() => onMemberPress(item.id)} accessibilityLabel={`${item.displayName}'s profile`}>
          <UserImage
            imageUrl={item.imageUrl}
            displayName={item.displayName}
            size={56}
            borderColor={primaryColor}
          />
          <BodySmall style={styles.memberName} numberOfLines={1}>
            {item.displayName?.split(' ')[0] ?? ''}
          </BodySmall>
        </Pressable>
      )}
    />
  );
}

export default memo(FeedSquad);

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, gap: 16 },
  member: { alignItems: 'center', width: 64 },
  memberName: { color: Colors.white, marginTop: 6, textAlign: 'center' },
});
