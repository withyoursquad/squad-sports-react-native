/**
 * Community components.
 * Ported from squad-demo/src/components/communities/*.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular, BodySmall, SubtitleSmall } from '../ux/text/Typography';

// --- CommunityRow ---
export function CommunityRow({
  id, name, color, isSelected, onPress,
}: { id: string; name: string; color?: string; isSelected?: boolean; onPress?: () => void }) {
  const dotColor = color ?? Colors.purple1;
  return (
    <Pressable style={[styles.row, isSelected && [styles.rowSelected, { borderColor: dotColor }]]} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <BodyRegular style={styles.rowName}>{name}</BodyRegular>
      {isSelected && <Text style={[styles.check, { color: dotColor }]}>v</Text>}
    </Pressable>
  );
}

// --- CommunityTag ---
export function CommunityTag({ name, color = Colors.purple1 }: { name: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.tagText}>{name.substring(0, 3).toUpperCase()}</Text>
    </View>
  );
}

// --- CommunityBottomSheet ---
export function CommunityBottomSheet({
  communities, selectedId, onSelect,
}: { communities: Array<{ id: string; name: string; color?: string }>; selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <FlatList
      data={communities}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <CommunityRow
          id={item.id}
          name={item.name}
          color={item.color}
          isSelected={item.id === selectedId}
          onPress={() => onSelect(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

// --- OnboardingCommunitySelector ---
export function OnboardingCommunitySelector({
  communities, selectedId, onSelect,
}: { communities: Array<{ id: string; name: string; color?: string }>; selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <View style={styles.selectorContainer}>
      {communities.map(c => (
        <CommunityRow key={c.id} {...c} isSelected={c.id === selectedId} onPress={() => onSelect(c.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.gray2, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', marginBottom: 8 },
  rowSelected: { backgroundColor: 'rgba(110,130,231,0.1)' },
  dot: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  rowName: { color: Colors.white, flex: 1, fontWeight: '600' },
  check: { fontSize: 18, fontWeight: '700' },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: Colors.white, fontSize: 8, fontWeight: '800' },
  list: { padding: 16 },
  selectorContainer: { gap: 8 },
});
