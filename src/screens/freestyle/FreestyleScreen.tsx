/**
 * Individual freestyle view screen.
 * Ported from squad-demo/src/screens/Freestyle.tsx.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { FreestyleFeedItem, FreestyleUserReaction } from '../../components/freestyle/FreestyleComponents';
import { AudioPlayerRow } from '../../components/audio/AudioPlayerRow';

export function FreestyleScreen() {
  const route = useRoute<any>();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const freestyleId = route.params?.freestyleId;
  const [freestyle, setFreestyle] = useState<any>(null);
  const [reactions, setReactions] = useState<any[]>([]);

  useEffect(() => {
    // Load freestyle and reactions from feed cache or API
  }, [freestyleId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Freestyle" />
      {freestyle && (
        <FlatList
          ListHeaderComponent={
            <FreestyleFeedItem
              id={freestyle.id}
              audioUrl={freestyle.audioUrl}
              duration={freestyle.duration}
              creatorName={freestyle.creator?.displayName}
              creatorImageUrl={freestyle.creator?.imageUrl}
              createdAt={freestyle.createdAt}
              listenCount={freestyle.listenCount}
              reactionCount={freestyle.reactionCount}
              promptText={freestyle.prompt?.text}
            />
          }
          data={reactions}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <FreestyleUserReaction
              userName={item.creator?.displayName ?? ''}
              userImageUrl={item.creator?.imageUrl}
              emoji={item.emojiLabel ?? ''}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 24 },
});
