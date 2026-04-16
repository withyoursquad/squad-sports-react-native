/**
 * Bottom sheet sub-components.
 * Ported from squad-demo/src/components/ux/bottom-sheet/components/ + factory + registry.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

// --- BottomSheetHandle ---
export function BottomSheetHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
}

// --- BottomSheetBackdrop ---
export function BottomSheetBackdrop({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.backdrop}>
      {onPress && <View style={StyleSheet.absoluteFill} onTouchEnd={onPress} />}
    </View>
  );
}

// --- ErrorInfoBottomSheet ---
export function ErrorInfoBottomSheet({
  error,
  onDismiss,
}: { error: { name: string; message: string; code?: string; nativeErrorMessage?: string }; onDismiss: () => void }) {
  const [showDetails, setShowDetails] = React.useState(false);
  const { Text, Pressable } = require('react-native');

  return (
    <View style={styles.errorSheet}>
      <Text style={styles.errorTitle}>{error.name}</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      {error.nativeErrorMessage && (
        <Pressable onPress={() => setShowDetails(!showDetails)}>
          <Text style={styles.errorDetailsToggle}>{showDetails ? 'Hide' : 'More'} details</Text>
        </Pressable>
      )}
      {showDetails && error.nativeErrorMessage && (
        <Text style={styles.errorDetails}>{error.nativeErrorMessage}</Text>
      )}
      <Pressable style={styles.errorDismiss} onPress={onDismiss}>
        <Text style={styles.errorDismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

// --- WithTab (tabbed bottom sheet content) ---
export function WithTab({
  tabs,
  activeTab,
  onTabChange,
  children,
}: { tabs: string[]; activeTab: string; onTabChange: (tab: string) => void; children: React.ReactNode }) {
  const { Text, Pressable } = require('react-native');

  return (
    <View>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <Pressable key={tab} style={[styles.tab, tab === activeTab && styles.tabActive]} onPress={() => onTabChange(tab)}>
            <Text style={[styles.tabText, tab === activeTab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  handleContainer: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  errorSheet: { padding: 24 },
  errorTitle: { color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 8 },
  errorMessage: { color: Colors.gray6, fontSize: 14, marginBottom: 16 },
  errorDetailsToggle: { color: Colors.purple1, fontSize: 14, marginBottom: 8 },
  errorDetails: { color: Colors.gray6, fontSize: 12, fontFamily: 'monospace', marginBottom: 16 },
  errorDismiss: { paddingVertical: 12, borderRadius: 20, backgroundColor: Colors.purple1, alignItems: 'center' },
  errorDismissText: { color: Colors.gray1, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.purple1 },
  tabText: { color: Colors.gray6, fontSize: 14 },
  tabTextActive: { color: Colors.white, fontWeight: '500' },
});
