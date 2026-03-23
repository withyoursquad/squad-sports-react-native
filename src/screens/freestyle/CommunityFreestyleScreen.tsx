/**
 * Community freestyle listens/reactions screens.
 * Ported from squad-demo/src/screens/CommunityFreestyleListens.tsx + CommunityFreestyleReaction.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { FreestyleUserListen, FreestyleUserReaction } from '../../components/freestyle/FreestyleComponents';
import { BodyRegular } from '../../components/ux/text/Typography';

export function CommunityFreestyleListensScreen() {
  const route = useRoute<any>();
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const freestyleId = route.params?.freestyleId;
  const [listens, setListens] = useState<Array<{ userName: string; userImageUrl?: string; listenedAt?: string }>>([]);

  useEffect(() => {
    // Load community-wide listens for this freestyle
  }, [freestyleId, apiClient]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Community Listens" />
      <FlatList
        data={listens}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <FreestyleUserListen {...item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><BodyRegular style={styles.emptyText}>No community listens yet</BodyRegular></View>}
      />
    </View>
  );
}

export function CommunityFreestyleReactionsScreen() {
  const route = useRoute<any>();
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const freestyleId = route.params?.freestyleId;
  const emoji = route.params?.emoji;
  const [reactions, setReactions] = useState<Array<{ userName: string; userImageUrl?: string; emoji: string }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiClient.getFreestyleReactionsForCommunity(freestyleId, emoji ?? '');
        if (result?.reactions) {
          setReactions(result.reactions.map((r: any) => ({
            userName: r.creator?.displayName ?? '',
            userImageUrl: r.creator?.imageUrl,
            emoji: r.emojiLabel ?? emoji ?? '',
          })));
        }
      } catch {}
    };
    if (freestyleId) load();
  }, [freestyleId, emoji, apiClient]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Community Reactions" />
      <FlatList
        data={reactions}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <FreestyleUserReaction {...item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><BodyRegular style={styles.emptyText}>No community reactions yet</BodyRegular></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 48 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 },
  emptyText: { color: Colors.gray6 },
});
