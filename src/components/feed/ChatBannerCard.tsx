import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodySmall } from '../ux/text/Typography';

interface ChatBannerCardProps {
  placementId: string;
  brandName: string;
  brandImageUrl?: string;
  headline: string;
  ctaText?: string;
  ctaUrl?: string;
  onImpression?: (placementId: string, durationMs: number) => void;
  onCtaPress?: (placementId: string) => void;
}

function ChatBannerCard({
  placementId,
  brandName,
  brandImageUrl,
  headline,
  ctaText,
  ctaUrl,
  onImpression,
  onCtaPress,
}: ChatBannerCardProps) {
  const viewStartRef = useRef<number>(Date.now());

  useEffect(() => {
    viewStartRef.current = Date.now();
    const timer = setTimeout(() => {
      const duration = Date.now() - viewStartRef.current;
      onImpression?.(placementId, duration);
    }, 5000); // 5 second threshold for chat banners

    return () => clearTimeout(timer);
  }, [placementId, onImpression]);

  const handlePress = () => {
    onCtaPress?.(placementId);
    if (ctaUrl) {
      Linking.openURL(ctaUrl).catch(() => {});
    }
  };

  return (
    <Pressable style={styles.banner} onPress={handlePress}>
      <UserImage imageUrl={brandImageUrl} displayName={brandName} size={28} />
      <View style={styles.content}>
        <BodySmall style={styles.headline} numberOfLines={1}>{headline}</BodySmall>
      </View>
      {ctaText && (
        <View style={styles.ctaBadge}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default memo(ChatBannerCard);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  content: {
    flex: 1,
  },
  headline: {
    color: Colors.white,
    fontWeight: '500',
  },
  ctaBadge: {
    backgroundColor: Colors.gray3,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
