/**
 * Freestyle listens — who listened to a freestyle.
 * Ported from squad-demo/src/screens/FreestyleListens.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { FreestyleUserListen } from '../../components/freestyle/FreestyleComponents';
import { BodyRegular } from '../../components/ux/text/Typography';

export function FreestyleListensScreen() {
  const route = useRoute<any>();
  const { theme } = useTheme();
  const freestyleId = route.params?.freestyleId;
  const [listens, setListens] = useState<Array<{ userName: string; userImageUrl?: string; listenedAt?: string }>>([]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Listens" />
      <FlatList
        data={listens}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <FreestyleUserListen userName={item.userName} userImageUrl={item.userImageUrl} listenedAt={item.listenedAt} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BodyRegular style={styles.emptyText}>No listens yet</BodyRegular>
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
