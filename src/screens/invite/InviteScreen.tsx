import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodyMedium, TitleSmall, BodySmall } from '../../components/ux/text/Typography';

// Dynamic import for QR code (optional peer dep)
let QRCode: React.ComponentType<{ value: string; size: number; backgroundColor: string; color: string }> | null = null;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch {
  // react-native-qrcode-svg not installed — will show fallback
}

export function InviteScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const inviteUrl = inviteCode
    ? `https://app.withyoursquad.com/invite/${inviteCode}`
    : '';

  useEffect(() => {
    const getCode = async () => {
      try {
        const result = await apiClient.getInvitationCode();
        setInviteCode(result?.code ?? null);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    getCode();
  }, [apiClient]);

  const shareCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join my squad on Squad Sports! Use code: ${inviteCode}\n\n${inviteUrl}`,
      });
    } catch {
      // User cancelled share
    }
  }, [inviteCode, inviteUrl]);

  const copyCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // expo-clipboard not installed
    }
  }, [inviteCode]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Invite" />

      <View style={styles.content}>
        <View style={styles.codeSection}>
          <TitleMedium style={styles.heading}>Grow Your Squad</TitleMedium>
          <BodyRegular style={styles.subtitle}>
            Share your invite code with friends to add them to your squad
          </BodyRegular>

          {loading && <ActivityIndicator color={Colors.white} />}

          {inviteCode && (
            <Pressable style={styles.codeContainer} onPress={copyCode}>
              <TitleSmall style={styles.codeText}>{inviteCode}</TitleSmall>
              <BodyMedium style={[styles.copyHint, copied && { color: Colors.green }]}>
                {copied ? 'Copied!' : 'Tap to copy'}
              </BodyMedium>
            </Pressable>
          )}
        </View>

        <View style={styles.qrSection}>
          {inviteCode && QRCode ? (
            <View style={styles.qrContainer}>
              <QRCode
                value={inviteUrl}
                size={180}
                backgroundColor={Colors.white}
                color={Colors.gray1}
              />
            </View>
          ) : inviteCode ? (
            // Fallback when QR library not installed — show URL
            <View style={styles.qrFallback}>
              <BodySmall style={styles.qrFallbackLabel}>Invite Link</BodySmall>
              <BodyMedium style={styles.qrFallbackUrl} numberOfLines={2}>
                {inviteUrl}
              </BodyMedium>
            </View>
          ) : null}
          <BodyMedium style={styles.qrHint}>
            Others can scan this code to join your squad
          </BodyMedium>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          style={[styles.shareButton, { backgroundColor: theme.buttonColor }]}
          onPress={shareCode}
          disabled={!inviteCode}
        >
          <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>
            Share Invite Link
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  codeSection: { alignItems: 'center', marginBottom: 32 },
  heading: { color: Colors.white, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  codeContainer: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  codeText: { color: Colors.white, letterSpacing: 4, fontSize: 24 },
  copyHint: { color: Colors.gray6, marginTop: 4 },
  qrSection: { alignItems: 'center' },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
  },
  qrFallback: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrFallbackLabel: { color: Colors.gray6, marginBottom: 4 },
  qrFallbackUrl: { color: Colors.purple1, textAlign: 'center' },
  qrHint: { color: Colors.gray6, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingBottom: 32 },
  shareButton: {
    height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
  },
  shareButtonText: { fontSize: 16, fontWeight: '600' },
});
