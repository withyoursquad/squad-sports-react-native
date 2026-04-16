/**
 * CouponShareOverlay.tsx
 * Full-screen overlay for sharing a coupon with a squad member.
 * Ported from squad-demo/src/components/wallet/CouponShareOverlay.tsx
 *
 * SDK version: simplified -- delegates actual send logic to callbacks.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import UserImage from '../ux/user-image/UserImage';
import {
  BodyRegular,
  ButtonLarge,
  TitleMedium,
} from '../ux/text/Typography';
import { CouponShareCardCoupon } from './CouponShareCard';

export type OptimisticMessageStatus = 'pending' | 'uploading' | 'sent' | 'failed';

export type CouponShareOverlayProps = {
  /** The coupon being shared. */
  coupon: CouponShareCardCoupon;
  /** The recipient user. */
  recipient?: {
    displayName?: string;
    imageUrl?: string;
  };
  /** Called when the user submits the share (e.g., with a voice message filepath). */
  onSubmit?: (filepath: string) => void;
  /** Called when the overlay is closed/dismissed. */
  onClose?: () => void;
};

export default function CouponShareOverlay({
  coupon,
  recipient,
  onSubmit,
  onClose,
}: CouponShareOverlayProps) {
  const [status, setStatus] = useState<OptimisticMessageStatus>('pending');

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!coupon) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button onPress={handleClose} style={styles.closeButton}>
          <BodyRegular style={styles.closeText}>X</BodyRegular>
        </Button>
      </View>

      <View style={styles.content}>
        {recipient && (
          <View style={styles.recipientRow}>
            <UserImage
              size={56}
              imageUrl={recipient.imageUrl}
              displayName={recipient.displayName}
            />
            <TitleMedium style={styles.recipientName}>
              {recipient.displayName}
            </TitleMedium>
          </View>
        )}

        <View style={styles.couponPreview}>
          <BodyRegular style={styles.couponDescription}>
            {coupon.description}
          </BodyRegular>
          {coupon.code && (
            <BodyRegular style={styles.couponCode}>{coupon.code}</BodyRegular>
          )}
        </View>

        {status === 'failed' && (
          <BodyRegular style={styles.errorText}>
            Something went wrong. Please try again.
          </BodyRegular>
        )}

        <Button
          style={styles.sendButton}
          onPress={() => {
            setStatus('uploading');
            onSubmit?.('');
          }}
        >
          <ButtonLarge style={styles.sendButtonText}>
            Send to {recipient?.displayName || 'friend'}
          </ButtonLarge>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: Colors.white,
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  couponCode: {
    color: Colors.white,
    letterSpacing: 2,
    marginTop: 8,
    textAlign: 'center',
  },
  couponDescription: {
    color: Colors.gray6,
    textAlign: 'center',
  },
  couponPreview: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginVertical: 32,
  },
  errorText: {
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  recipientName: {
    color: Colors.white,
    marginTop: 12,
  },
  recipientRow: {
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: Colors.purple1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  sendButtonText: {
    color: Colors.gray1,
  },
});
