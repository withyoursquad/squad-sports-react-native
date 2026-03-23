import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import UserImage from '../../components/ux/user-image/UserImage';
import { BodyRegular, BodyMedium } from '../../components/ux/text/Typography';
import type { User } from '@squad-sports/core';

interface BlockedUserItem {
  id: string;
  displayName: string;
  imageUrl?: string;
}

export function BlockedUsersScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        // Get connections and filter for blocked status
        const squad = await apiClient.getUserConnections(true);
        if (squad?.connections) {
          const blocked = squad.connections
            .filter((c: any) => c.status === 6) // CONNECTION_STATUS_BLOCKED
            .map((c: any) => {
              const other = c.recipient ?? c.creator;
              return {
                id: other?.id ?? c.id,
                displayName: other?.displayName ?? 'Unknown',
                imageUrl: other?.imageUrl,
              };
            });
          setBlockedUsers(blocked);
        }
      } catch (err) {
        console.error('[BlockedUsers] Error loading:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlocked();
  }, [apiClient]);

  const handleUnblock = useCallback(
    async (userId: string, displayName: string) => {
      Alert.alert(
        'Unblock User',
        `Are you sure you want to unblock ${displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unblock',
            onPress: async () => {
              try {
                const { User } = await import('@squad-sports/core');
                const user = new User({ id: userId });
                await apiClient.unblockUser(user);
                setBlockedUsers(prev => prev.filter(u => u.id !== userId));
              } catch {
                Alert.alert('Error', 'Failed to unblock user.');
              }
            },
          },
        ],
      );
    },
    [apiClient],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Blocked Users" />

      {blockedUsers.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <BodyRegular style={styles.emptyText}>
            No blocked users
          </BodyRegular>
          <BodyMedium style={styles.emptySubtext}>
            Users you block will appear here
          </BodyMedium>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <UserImage
                imageUrl={item.imageUrl}
                displayName={item.displayName}
                size={44}
              />
              <BodyRegular style={styles.name}>{item.displayName}</BodyRegular>
              <Button
                style={styles.unblockButton}
                onPress={() => handleUnblock(item.id, item.displayName)}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </Button>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3,
  },
  name: { color: Colors.white, flex: 1, marginLeft: 12 },
  unblockButton: {
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.gray5,
  },
  unblockText: { color: Colors.white, fontSize: 13 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.white, marginBottom: 4 },
  emptySubtext: { color: Colors.gray6 },
});
