/**
 * Action sheet components.
 * Ported from squad-demo/src/components/ux/action-sheet/.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface ActionSheetItemProps {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: string;
}

export function ActionSheetItem({ label, onPress, destructive, icon }: ActionSheetItemProps) {
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityRole="menuitem"
    >
      {icon && <Text style={styles.itemIcon}>{icon}</Text>}
      <Text style={[styles.itemText, destructive && styles.itemTextDestructive]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface ActionSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  items: ActionSheetItemProps[];
}

export default function ActionSheet({ visible, onDismiss, title, items }: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        {items.map((item, i) => (
          <ActionSheetItem key={i} {...item} onPress={() => { item.onPress(); onDismiss(); }} />
        ))}
        <View style={styles.separator} />
        <Pressable style={styles.cancelItem} onPress={onDismiss}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: Colors.gray2, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  title: { color: Colors.gray6, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  itemIcon: { fontSize: 20, marginRight: 12, color: Colors.white },
  itemText: { color: Colors.white, fontSize: 16 },
  itemTextDestructive: { color: Colors.red },
  separator: { height: 8, backgroundColor: Colors.gray3 },
  cancelItem: { paddingVertical: 16, alignItems: 'center' },
  cancelText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
