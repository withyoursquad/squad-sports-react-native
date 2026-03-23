/**
 * Drag and drop components for squad circle reordering.
 * Ported from squad-demo/src/components/dragAndDrop/*.
 */
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';

interface DraggableItem {
  id: string;
  displayName?: string;
  imageUrl?: string;
}

// --- DragViewContainer ---
export function DragViewContainer({
  items, onReorder, renderItem,
}: { items: DraggableItem[]; onReorder: (items: DraggableItem[]) => void; renderItem: (item: DraggableItem, index: number) => React.ReactNode }) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.dragItem}>
          {renderItem(item, index)}
        </View>
      ))}
    </View>
  );
}

// --- ProfilePlus (add button in drag grid) ---
export function ProfilePlus({ onPress, color = Colors.purple1 }: { onPress: () => void; color?: string }) {
  return (
    <View style={[styles.profilePlus, { borderColor: color }]}>
      <Text style={[styles.profilePlusIcon, { color }]}>+</Text>
    </View>
  );
}

// --- DragViewWarning ---
export function DragViewWarning({ message }: { message: string }) {
  return (
    <View style={styles.warning}>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: 16 },
  dragItem: { position: 'relative' },
  profilePlus: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  profilePlusIcon: { fontSize: 24, fontWeight: '300' },
  warning: { padding: 12, backgroundColor: 'rgba(233,120,92,0.14)', borderRadius: 8, marginHorizontal: 16 },
  warningText: { color: Colors.orange1, fontSize: 13, textAlign: 'center' },
});
