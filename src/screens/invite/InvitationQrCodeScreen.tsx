/**
 * QR code scanner for redeeming invite codes.
 * Ported from squad-demo/src/screens/InvitationQrCode.tsx.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodySmall } from '../../components/ux/text/Typography';

export function InvitationQrCodeScreen() {
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { Camera } = await import('expo-camera');
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch {
        setHasPermission(false);
      }
    };
    requestPermission();
  }, []);

  const handleBarCodeScanned = useCallback(async (data: string) => {
    if (scanning) return;
    setScanning(true);

    try {
      // Extract invite code from URL or raw code
      let code = data;
      if (data.includes('/invite/')) {
        code = data.split('/invite/').pop() ?? data;
      }

      const result = await apiClient.redeemInviteCode(code);
      if (result) {
        Alert.alert('Success', 'Invite code redeemed!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Invalid Code', 'This invite code is not valid.');
        setScanning(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to redeem invite code.');
      setScanning(false);
    }
  }, [scanning, apiClient, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Scan QR Code" />

      <View style={styles.content}>
        {hasPermission === false ? (
          <View style={styles.noPermission}>
            <BodyRegular style={styles.noPermText}>
              Camera permission is required to scan QR codes
            </BodyRegular>
            <Button
              style={[styles.settingsBtn, { backgroundColor: theme.buttonColor }]}
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openSettings();
              }}
            >
              <Text style={[styles.settingsBtnText, { color: theme.buttonText }]}>
                Open Settings
              </Text>
            </Button>
          </View>
        ) : (
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.cornerTL, { borderColor: theme.buttonColor }]} />
              <View style={[styles.cornerTR, { borderColor: theme.buttonColor }]} />
              <View style={[styles.cornerBL, { borderColor: theme.buttonColor }]} />
              <View style={[styles.cornerBR, { borderColor: theme.buttonColor }]} />
            </View>
            <BodySmall style={styles.scanHint}>
              Point your camera at a Squad QR code
            </BodySmall>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noPermission: { alignItems: 'center', padding: 32 },
  noPermText: { color: Colors.gray6, textAlign: 'center', marginBottom: 16 },
  settingsBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  settingsBtnText: { fontWeight: '600' },
  scanArea: { alignItems: 'center' },
  scanFrame: { width: 250, height: 250, position: 'relative', marginBottom: 24 },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3 },
  scanHint: { color: Colors.gray6 },
});
