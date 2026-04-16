/**
 * Network status debug screen.
 * Ported from squad-demo/src/screens/NetworkStatus.tsx.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import { useNetworkStatus } from '../../realtime/NetworkMonitor';
import { EventProcessor } from '../../realtime/EventProcessor';
import { BodyRegular, BodyMedium, TitleSmall } from '../../components/ux/text/Typography';

export function NetworkStatusScreen() {
  const { theme } = useTheme();
  const isOnline = useNetworkStatus();
  const sseQuality = EventProcessor.shared.getConnectionQuality();

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Network Status" />

      <View style={styles.content}>
        <View style={styles.row}>
          <BodyRegular style={styles.label}>Internet</BodyRegular>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.green : Colors.red }]} />
          <BodyMedium style={styles.value}>{isOnline ? 'Connected' : 'Disconnected'}</BodyMedium>
        </View>

        <View style={styles.row}>
          <BodyRegular style={styles.label}>Real-time (SSE)</BodyRegular>
          <View style={[styles.statusDot, {
            backgroundColor: sseQuality === 'good' ? Colors.green : sseQuality === 'poor' ? Colors.orange1 : Colors.red,
          }]} />
          <BodyMedium style={styles.value}>{sseQuality}</BodyMedium>
        </View>

        <View style={styles.infoBox}>
          <TitleSmall style={styles.infoTitle}>About</TitleSmall>
          <BodyMedium style={styles.infoText}>
            The Squad SDK uses Server-Sent Events (SSE) for real-time updates.
            Messages, squad changes, and poll updates arrive automatically when connected.
          </BodyMedium>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  label: { color: Colors.white, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  value: { color: Colors.gray6 },
  infoBox: { marginTop: 32, backgroundColor: Colors.gray2, borderRadius: 12, padding: 16 },
  infoTitle: { color: Colors.white, marginBottom: 8 },
  infoText: { color: Colors.gray6, lineHeight: 20 },
});
