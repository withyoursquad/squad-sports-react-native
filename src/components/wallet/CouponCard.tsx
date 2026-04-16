/**
 * CouponCard.tsx
 * Display a coupon with brand logo, discount, expiry, reveal/copy/share actions.
 * Ported from squad-demo/src/components/wallet/CouponCard.tsx
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import {
  BodyMedium,
  BodyRegular,
  BodySmall,
  TitleSmall,
} from '../ux/text/Typography';

export type CouponData = {
  id: string;
  code?: string;
  description?: string;
  expiresAt?: string;
  isShareable?: boolean;
  brand?: {
    name?: string;
    imageUrl?: string;
  };
  unlockDescription?: string;
  triggerRules?: string;
};

export type CouponProgress = {
  isComplete?: boolean;
  progressState?: string;
};

export type CouponCardProps = {
  coupon: CouponData;
  /** Overall unlock progress 0-1 for locked coupons. */
  overallProgress?: number;
  /** Whether this coupon is locked behind trigger rules. */
  isLocked?: boolean;
  /** Called when "Reveal My Code" is pressed. */
  onReveal?: () => void;
  /** Called when code is copied. */
  onCopy?: () => void;
  /** Called when share is pressed. */
  onShare?: () => void;
};

export default function CouponCard({
  coupon,
  overallProgress = 0,
  isLocked = false,
  onReveal,
  onCopy,
  onShare,
}: CouponCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const expiresLabel = useMemo(() => {
    return formatCouponExpiration(coupon.expiresAt);
  }, [coupon.expiresAt]);

  const handleReveal = () => {
    onReveal?.();
    if (!isLocked) {
      setRevealed(true);
    }
  };

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardBackground = revealed ? '#F2F2F2' : Colors.gray2;
  const textColor = revealed ? '#222' : Colors.white;
  const expireIconColor = revealed ? '#222' : Colors.white;
  const borderColor = isLocked ? 'rgba(17,236,15,0.3)' : Colors.green;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: cardBackground, borderColor }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          {coupon.brand?.imageUrl && (
            <Image
              source={{ uri: coupon.brand.imageUrl }}
              style={[
                styles.logo,
                { tintColor: revealed ? Colors.gray2 : Colors.white },
              ]}
              contentFit="contain"
            />
          )}
        </View>

        {/* Offer */}
        <View style={styles.offerContainer}>
          <TitleSmall style={[styles.offerText, { color: textColor }]}>
            {coupon.description || ''}
          </TitleSmall>
        </View>

        <BodySmall style={[styles.label, { color: textColor }]}>
          Your unique code:
        </BodySmall>

        {/* CODE */}
        <View style={styles.codeWrapper}>
          <TitleSmall style={[styles.codeText, { color: textColor }]}>
            {coupon.code}
          </TitleSmall>
          {!revealed && (
            <View style={[styles.blurOverlay, { backgroundColor: cardBackground }]}>
              <View style={styles.blurDots}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View key={i} style={styles.blurDot} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Progress Bar (locked coupons) */}
        {isLocked && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(overallProgress * 100)}%` },
              ]}
            />
          </View>
        )}

        {/* Reveal / Locked Button */}
        {!revealed && (
          <View style={styles.buttonContainer}>
            <Button
              style={[
                styles.revealButton,
                isLocked && styles.revealButtonLocked,
              ]}
              onPress={handleReveal}
            >
              <View style={[styles.gradient, isLocked ? styles.gradientLocked : styles.gradientUnlocked]}>
                <BodyRegular style={styles.buttonText}>
                  {isLocked
                    ? `${Math.round(overallProgress * 100)}% Unlocked`
                    : 'Reveal My Code'}
                </BodyRegular>
              </View>
            </Button>
          </View>
        )}

        {/* Copy + Share */}
        {revealed && (
          <View style={styles.ctaRow}>
            <Button
              style={[styles.copyButton, copied && styles.copyButtonCopied]}
              onPress={handleCopy}
            >
              <BodyRegular
                style={[styles.copyText, copied && styles.copyTextCopied]}
              >
                {copied ? 'Copied' : 'Copy Code'}
              </BodyRegular>
            </Button>

            {coupon.isShareable && onShare && (
              <Button style={styles.shareButton} onPress={onShare}>
                <View style={styles.shareIcon}>
                  <View style={styles.shareArrow} />
                  <View style={styles.shareBase} />
                </View>
              </Button>
            )}
          </View>
        )}

        {/* Expiration */}
        {expiresLabel && (
          <View style={styles.expireContainer}>
            <View style={[styles.clockIcon, { borderColor: expireIconColor }]} />
            <BodySmall style={[styles.expireText, { color: textColor }]}>
              {expiresLabel}
            </BodySmall>
          </View>
        )}
      </View>

      <BodyMedium style={styles.footerHint}>
        {isLocked
          ? 'Complete the challenges to unlock this drop.'
          : !revealed
            ? 'Your exclusive drop is waiting. Tap to unlock it.'
            : 'Copy it. Share it. Make this one count.'}
      </BodyMedium>
    </View>
  );
}

/* Expiration Formatter */
function formatCouponExpiration(expiresAt?: string): string | null {
  if (!expiresAt) return null;

  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return null;

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();

  return `Expires on ${month} ${day}${getOrdinalSuffix(day)}`;
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

const styles = StyleSheet.create({
  blurDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  blurDots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    marginVertical: 8,
    alignSelf: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.white,
  },
  clockIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  codeText: {
    textAlign: 'center',
    letterSpacing: 2,
    paddingVertical: 8,
  },
  codeWrapper: {
    marginVertical: 8,
    alignSelf: 'center',
    width: '70%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  container: {
    width: 247,
    minHeight: 400,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
  },
  copyButtonCopied: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#222',
  },
  copyText: {
    textAlign: 'center',
    color: Colors.white,
    paddingVertical: 10,
  },
  copyTextCopied: {
    color: '#222',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  expireContainer: {
    marginTop: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expireText: {
    textAlign: 'center',
    marginLeft: 8,
  },
  footerHint: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.gray6,
    alignSelf: 'center',
    width: '90%',
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  gradientLocked: {
    backgroundColor: 'rgba(0,79,28,0.5)',
  },
  gradientUnlocked: {
    backgroundColor: '#14803D',
  },
  label: {
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  logoContainer: {
    alignSelf: 'center',
  },
  offerContainer: {
    marginVertical: 24,
    height: 81,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: {
    textAlign: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  revealButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2CFF6B',
  },
  revealButtonLocked: {
    borderColor: 'rgba(44,255,107,0.3)',
  },
  shareArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
  },
  shareBase: {
    width: 2,
    height: 8,
    backgroundColor: Colors.white,
  },
  shareButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    alignItems: 'center',
  },
  wrapper: {
    alignItems: 'center',
    width: 247,
    marginRight: 32,
  },
});
