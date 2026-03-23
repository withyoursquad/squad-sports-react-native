/**
 * Feed loading skeleton.
 * Ported from squad-demo/src/components/feed/FeedLoadingSkeleton.tsx.
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

function SkeletonBar({ width, height = 12, marginBottom = 8 }: { width: string | number; height?: number; marginBottom?: number }) {
  return <View style={[styles.bar, { width: width as any, height, marginBottom }]} />;
}

export default function FeedLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar} />
            <View>
              <SkeletonBar width={100} height={14} />
              <SkeletonBar width={60} height={10} />
            </View>
          </View>
          <SkeletonBar width="100%" height={48} marginBottom={12} />
          <View style={styles.footer}>
            <SkeletonBar width={60} height={10} />
            <SkeletonBar width={60} height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 12 },
  card: { backgroundColor: Colors.gray2, borderRadius: 16, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray3 },
  bar: { backgroundColor: Colors.gray3, borderRadius: 4 },
  footer: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.gray3 },
});
