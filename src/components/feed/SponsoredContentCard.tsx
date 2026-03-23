import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodyRegular, BodySmall, SubtitleSmall } from '../ux/text/Typography';

interface SponsoredContentCardProps {
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
}

function SponsoredContentCard({
  placementId,
  brandName,
  brandImageUrl,
  headline,
  bodyText,
  ctaText,
  ctaUrl,
  onImpression,
  onCtaPress,
}: SponsoredContentCardProps) {
  const viewStartRef = useRef<number>(Date.now());

  useEffect(() => {
    viewStartRef.current = Date.now();
    const timer = setTimeout(() => {
      const duration = Date.now() - viewStartRef.current;
      onImpression?.(placementId, duration);
    }, 1000); // 1 second threshold for sponsored content

    return () => clearTimeout(timer);
  }, [placementId, onImpression]);

  const handleCtaPress = () => {
    onCtaPress?.(placementId);
    if (ctaUrl) {
      Linking.openURL(ctaUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <UserImage imageUrl={brandImageUrl} displayName={brandName} size={36} />
        <View style={styles.headerText}>
          <SubtitleSmall style={styles.brandName}>{brandName}</SubtitleSmall>
          <BodySmall style={styles.sponsoredLabel}>Sponsored</BodySmall>
        </View>
      </View>

      <BodyRegular style={styles.headline}>{headline}</BodyRegular>

      {bodyText && (
        <BodySmall style={styles.bodyText}>{bodyText}</BodySmall>
      )}

      {ctaText && (
        <Pressable style={styles.ctaButton} onPress={handleCtaPress}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default memo(SponsoredContentCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  brandName: { color: Colors.white },
  sponsoredLabel: { color: Colors.gray6, fontSize: 11 },
  headline: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    color: Colors.gray8,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: Colors.gray3,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
