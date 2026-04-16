/**
 * WalletContainer.tsx
 * Container for wallet/coupon section in the home feed.
 * Ported from squad-demo/src/components/wallet/WalletContainer.tsx
 */
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import WalletHeader from './WalletHeader';
import CouponCard, { CouponData, CouponProgress } from './CouponCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type WalletCouponItem = {
  coupon: CouponData;
  progress?: CouponProgress;
  isLocked?: boolean;
  overallProgress?: number;
};

export type WalletContainerProps = {
  /** List of coupons to display. */
  coupons: WalletCouponItem[];
  /** Custom header text. */
  headerText?: string;
  /** Called when "Reveal My Code" is pressed on a coupon. */
  onRevealCoupon?: (coupon: CouponData) => void;
  /** Called when coupon code is copied. */
  onCopyCoupon?: (coupon: CouponData) => void;
  /** Called when share is pressed on a coupon. */
  onShareCoupon?: (coupon: CouponData) => void;
};

export default function WalletContainer({
  coupons,
  headerText,
  onRevealCoupon,
  onCopyCoupon,
  onShareCoupon,
}: WalletContainerProps) {
  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <WalletHeader headerText={headerText} />
      <ScrollView
        horizontal
        style={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={SCREEN_WIDTH * 0.7 - 16}
        pagingEnabled
      >
        {coupons.map((item) => (
          <CouponCard
            key={`COUPON-${item.coupon.id}`}
            coupon={item.coupon}
            isLocked={item.isLocked}
            overallProgress={item.overallProgress}
            onReveal={() => onRevealCoupon?.(item.coupon)}
            onCopy={() => onCopyCoupon?.(item.coupon)}
            onShare={() => onShareCoupon?.(item.coupon)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 16,
    width: '100%',
    flex: 1,
  },
  scrollContainer: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
});
