/**
 * "More Of Your Shifters" — horizontal overflow list of squad members beyond the main circle.
 * Ported from squad-demo/src/screens/home/slivers/SquadOverflow.tsx.
 */
import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { TitleSmall, BodySmall } from '../ux/text/Typography';
import type { Connection } from '@squad-sports/core';

function getOtherUser(connection: Connection, loggedInUserId?: string) {
  if ((connection as any).recipient?.id === loggedInUserId) {
    return (connection as any).creator;
  }
  return (connection as any).recipient ?? (connection as any).creator;
}

interface SquadOverflowProps {
  connections: Connection[];
  loggedInUserId?: string;
  primaryColor?: string;
}

export default function SquadOverflow({
  connections,
  loggedInUserId,
  primaryColor = Colors.purple1,
}: SquadOverflowProps) {
  const navigation = useNavigation();
  const { theme, baseThemeColors } = useTheme();
  const overflowMembers = connections.slice(5);

  if (overflowMembers.length === 0) return null;

  return (
    <View style={styles.container}>
      <TitleSmall
        style={[
          styles.header,
          {
            color: theme.isDarkMode ? Colors.white : baseThemeColors.primaryTextColor,
          },
        ]}
      >
        More Of Your Shifters
      </TitleSmall>

      <FlatList
        data={[null, ...overflowMembers]}
        keyExtractor={(item, index) => (item ? (item as any).id ?? `member-${index}` : 'add-button')}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => {
          if (!item) {
            // Add button
            return (
              <Pressable
                style={[styles.addButton, { borderColor: primaryColor }]}
                onPress={() => (navigation as any).navigate('Invite')}
              >
                <TitleSmall style={[styles.addIcon, { color: primaryColor }]}>+</TitleSmall>
              </Pressable>
            );
          }

          const other = getOtherUser(item, loggedInUserId);
          return (
            <Pressable
              style={styles.memberItem}
              onPress={() => (navigation as any).navigate('Profile', { userId: other?.id ?? '' })}
            >
              <UserImage
                imageUrl={other?.imageUrl}
                displayName={other?.displayName}
                size={56}
              />
              <BodySmall style={styles.memberName} numberOfLines={1}>
                {other?.displayName?.split(' ')[0] ?? ''}
              </BodySmall>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 16,
    color: Colors.white,
  },
  listContent: {
    paddingRight: 20,
    paddingVertical: 10,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  memberItem: {
    alignItems: 'center',
  },
  memberName: {
    color: Colors.white,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 56,
  },
});
