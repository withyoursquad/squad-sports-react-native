/**
 * CouponShareCard.tsx
 * Coupon sharing card variant with user header and coupon details.
 * Ported from squad-demo/src/components/wallet/CouponShareCard.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import {
  BodySmall,
  SubtitleSmall,
  TitleSmall,
} from '../ux/text/Typography';

export type CouponShareCardCoupon = {
  id: string;
  code?: string;
  description?: string;
  brand?: {
    name?: string;
    imageUrl?: string;
  };
};

export type CouponShareCardProps = {
  coupon: CouponShareCardCoupon;
  /** Sender user info. */
  senderUser?: {
    displayName?: string;
    imageUrl?: string;
  };
  /** Community name displayed on the wallet badge. */
  communityName?: string;
  /** Whether this card appears in a message feed. */
  onMessageFeed?: boolean;
  /** Whether this message is from the logged-in user. */
  isMine?: boolean;
  /** Whether there is a previous message in the thread. */
  hasPrevious?: boolean;
};

export default function CouponShareCard({
  coupon,
  senderUser,
  communityName,
  onMessageFeed,
  isMine,
  hasPrevious,
}: CouponShareCardProps) {
  if (!coupon) return null;

  return (
    <View>
      {/* Thread reply line indicator for message feed */}
      {onMessageFeed && !isMine && (
        <View style={[styles.threadLineTheirs]} />
      )}

      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <UserImage
              size={40}
              imageUrl={senderUser?.imageUrl}
              displayName={senderUser?.displayName}
            />
          </View>

          <View>
            <SubtitleSmall style={styles.unlockText}>
              Unlocked on {communityName || 'Squad'}. Tap in
            </SubtitleSmall>

            <View style={styles.walletBadge}>
              <BodySmall style={styles.walletBadgeText}>
                {communityName || 'Squad'} Wallet
              </BodySmall>
            </View>
          </View>
        </View>

        {/* Coupon Card */}
        <View style={styles.card}>
          {coupon.brand?.imageUrl && (
            <Image
              source={{ uri: coupon.brand.imageUrl }}
              style={styles.logo}
              contentFit="contain"
              tintColor={Colors.gray1}
            />
          )}

          <TitleSmall style={styles.description}>
            {coupon.description}
          </TitleSmall>

          <BodySmall style={styles.uniqueLabel}>Unique code:</BodySmall>

          <TitleSmall style={styles.uniqueCode}>
            {coupon.code || '****'}
          </TitleSmall>
        </View>
      </View>

      {onMessageFeed && isMine && (
        <View style={styles.threadLine} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    color: Colors.black,
    width: '80%',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  threadLine: {
    backgroundColor: Colors.gray3,
    width: 2,
    height: 16,
    left: '4%',
    position: 'absolute',
    top: '100%',
  },
  threadLineTheirs: {
    backgroundColor: Colors.gray3,
    width: 2,
    height: 16,
    right: '4%',
    position: 'absolute',
    top: '100%',
  },
  uniqueCode: {
    color: Colors.black,
  },
  uniqueLabel: {
    color: Colors.black,
    marginBottom: 8,
  },
  unlockText: {
    color: Colors.white,
  },
  walletBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  walletBadgeText: {
    color: Colors.white,
  },
  wrapper: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    backgroundColor: 'transparent',
    marginTop: 24,
  },
});
