/**
 * Freestyle reactions — who reacted to a freestyle.
 * Ported from squad-demo/src/screens/FreestyleReactions.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { FreestyleUserReaction } from '../../components/freestyle/FreestyleComponents';
import { BodyRegular } from '../../components/ux/text/Typography';

export function FreestyleReactionsScreen() {
  const route = useRoute<any>();
  const { theme } = useTheme();
  const freestyleId = route.params?.freestyleId;
  const [reactions, setReactions] = useState<Array<{ userName: string; userImageUrl?: string; emoji: string }>>([]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Reactions" />
      <FlatList
        data={reactions}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <FreestyleUserReaction userName={item.userName} userImageUrl={item.userImageUrl} emoji={item.emoji} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BodyRegular style={styles.emptyText}>No reactions yet</BodyRegular>
          </View>
        }
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
