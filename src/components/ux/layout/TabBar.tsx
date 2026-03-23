import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface TabBarProps {
  tabs: Array<{ key: string; label: string }>;
  activeTab: string;
  onTabPress: (key: string) => void;
  activeColor?: string;
}

export default function TabBar({ tabs, activeTab, onTabPress, activeColor = Colors.purple1 }: TabBarProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && { borderBottomColor: activeColor }]}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabText, isActive && { color: Colors.white }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { color: Colors.gray6, fontSize: 14, fontWeight: '500' },
});
