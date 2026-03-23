import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Modal, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodyRegular, BodySmall, SubtitleSmall, TitleMedium } from '../ux/text/Typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AUTO_DISMISS_MS = 5000;

interface InterstitialOverlayProps {
  placementId: string;
  brandName: string;
  brandImageUrl?: string;
  headline: string;
  bodyText?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  onImpression?: (placementId: string, durationMs: number) => void;
  onCtaPress?: (placementId: string) => void;
  onDismiss?: (placementId: string) => void;
  visible: boolean;
}

function InterstitialOverlay({
  placementId,
  brandName,
  brandImageUrl,
  headline,
  bodyText,
  ctaText,
  ctaUrl,
  onImpression,
  onCtaPress,
  onDismiss,
  visible,
}: InterstitialOverlayProps) {
  const viewStartRef = useRef<number>(0);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!visible) return;

    viewStartRef.current = Date.now();
    setCountdown(5);

    // Impression after 1 second
    const impressionTimer = setTimeout(() => {
      onImpression?.(placementId, 1000);
    }, 1000);

    // Countdown ticker
    const tickInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tickInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      onDismiss?.(placementId);
    }, AUTO_DISMISS_MS);

    return () => {
      clearTimeout(impressionTimer);
      clearInterval(tickInterval);
      clearTimeout(dismissTimer);
    };
  }, [visible, placementId, onImpression, onDismiss]);

  const handleCtaPress = () => {
    onCtaPress?.(placementId);
    if (ctaUrl) {
      Linking.openURL(ctaUrl).catch(() => {});
    }
    onDismiss?.(placementId);
  };

  const handleDismiss = () => {
    onDismiss?.(placementId);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Dismiss button */}
          <Pressable style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissText}>
              {countdown > 0 ? String(countdown) : 'X'}
            </Text>
          </Pressable>

          {/* Brand header */}
          <View style={styles.brandRow}>
            <UserImage imageUrl={brandImageUrl} displayName={brandName} size={32} />
            <BodySmall style={styles.brandName}>{brandName}</BodySmall>
          </View>

          {/* Content */}
          <TitleMedium style={styles.headline}>{headline}</TitleMedium>

          {bodyText && (
            <BodyRegular style={styles.bodyText}>{bodyText}</BodyRegular>
          )}

          {/* CTA */}
          {ctaText && (
            <Pressable style={styles.ctaButton} onPress={handleCtaPress}>
              <Text style={styles.ctaText}>{ctaText}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default memo(InterstitialOverlay);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: Colors.gray2,
    borderRadius: 20,
    padding: 28,
    width: SCREEN_WIDTH - 64,
    maxHeight: SCREEN_HEIGHT * 0.7,
    alignItems: 'center',
  },
  dismissButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dismissText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  brandName: {
    color: Colors.gray6,
  },
  headline: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  bodyText: {
    color: Colors.gray8,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#6E82E7',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
