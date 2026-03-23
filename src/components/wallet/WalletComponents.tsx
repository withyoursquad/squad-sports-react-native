/**
 * Wallet/Coupon components.
 * Ported from squad-demo/src/components/wallet/*.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { BodySmall, BodyRegular, TitleSmall, SubtitleSmall } from '../ux/text/Typography';

// --- CouponCard ---
export const CouponCard = memo(function CouponCard({
  code, title, description, discount, brandName, isRedeemed, onRedeem, onShare, primaryColor = Colors.purple1,
}: {
  code: string; title: string; description?: string; discount?: string;
  brandName?: string; isRedeemed: boolean; onRedeem?: () => void; onShare?: () => void; primaryColor?: string;
}) {
  return (
    <View style={[styles.couponCard, isRedeemed && styles.couponRedeemed]}>
      <View style={styles.couponLeft}>
        {brandName && <BodySmall style={styles.brandName}>{brandName}</BodySmall>}
        <TitleSmall style={styles.couponTitle}>{title}</TitleSmall>
        {description && <BodySmall style={styles.couponDesc} numberOfLines={2}>{description}</BodySmall>}
        {discount && <SubtitleSmall style={[styles.couponDiscount, { color: primaryColor }]}>{discount}</SubtitleSmall>}
      </View>
      <View style={styles.couponRight}>
        {isRedeemed ? (
          <View style={styles.redeemedBadge}><BodySmall style={styles.redeemedText}>Redeemed</BodySmall></View>
        ) : (
          <View style={styles.couponActions}>
            <Button style={[styles.redeemBtn, { backgroundColor: primaryColor }]} onPress={onRedeem}>
              <Text style={styles.redeemText}>Redeem</Text>
            </Button>
            {onShare && (
              <Button style={styles.shareBtn} onPress={onShare}>
                <Text style={styles.shareText}>Share</Text>
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

// --- CouponShareCard ---
export function CouponShareCard({ code, title, discount, onShare }: { code: string; title: string; discount?: string; onShare: () => void }) {
  return (
    <Pressable style={styles.shareCard} onPress={onShare}>
      <TitleSmall style={styles.shareCardTitle}>{title}</TitleSmall>
      {discount && <BodyRegular style={styles.shareCardDiscount}>{discount}</BodyRegular>}
      <BodySmall style={styles.shareCardCode}>{code}</BodySmall>
      <BodySmall style={styles.shareCardHint}>Tap to share</BodySmall>
    </Pressable>
  );
}

// --- WalletHeader ---
export function WalletHeader({ balance, primaryColor = Colors.purple1 }: { balance: number; primaryColor?: string }) {
  return (
    <View style={[styles.walletHeader, { borderColor: primaryColor }]}>
      <BodySmall style={styles.balanceLabel}>Your Balance</BodySmall>
      <Text style={[styles.balanceAmount, { color: primaryColor }]}>{balance}</Text>
      <BodySmall style={styles.balanceUnit}>points</BodySmall>
    </View>
  );
}

// --- RedeemBottomSheet ---
export function RedeemBottomSheet({ coupon, onRedeem, onDismiss }: {
  coupon: { code: string; title: string; description?: string }; onRedeem: () => void; onDismiss: () => void;
}) {
  return (
    <View style={styles.redeemSheet}>
      <TitleSmall style={styles.redeemTitle}>{coupon.title}</TitleSmall>
      {coupon.description && <BodyRegular style={styles.redeemDesc}>{coupon.description}</BodyRegular>}
      <BodySmall style={styles.redeemCode}>Code: {coupon.code}</BodySmall>
      <Button style={styles.redeemConfirmBtn} onPress={onRedeem}>
        <Text style={styles.redeemConfirmText}>Confirm Redemption</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  couponCard: { flexDirection: 'row', backgroundColor: Colors.gray2, borderRadius: 12, padding: 16, gap: 12 },
  couponRedeemed: { opacity: 0.6 },
  couponLeft: { flex: 1 },
  couponRight: { justifyContent: 'center' },
  brandName: { color: Colors.gray6, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  couponTitle: { color: Colors.white, marginBottom: 4 },
  couponDesc: { color: Colors.gray6, marginBottom: 4 },
  couponDiscount: { fontWeight: '600' },
  couponActions: { gap: 4 },
  redeemBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  redeemText: { color: Colors.gray1, fontSize: 13, fontWeight: '600' },
  shareBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray5, alignItems: 'center' },
  shareText: { color: Colors.white, fontSize: 12 },
  redeemedBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.gray3 },
  redeemedText: { color: Colors.gray6, fontSize: 12 },
  shareCard: { backgroundColor: Colors.gray2, borderRadius: 12, padding: 16, alignItems: 'center' },
  shareCardTitle: { color: Colors.white, marginBottom: 4 },
  shareCardDiscount: { color: Colors.purple1, marginBottom: 8 },
  shareCardCode: { color: Colors.gray6, letterSpacing: 2 },
  shareCardHint: { color: Colors.gray6, marginTop: 4 },
  walletHeader: { padding: 24, borderRadius: 16, borderWidth: 1.5, backgroundColor: Colors.gray2, alignItems: 'center' },
  balanceLabel: { color: Colors.gray6, marginBottom: 4 },
  balanceAmount: { fontSize: 48, fontWeight: '700', lineHeight: 56 },
  balanceUnit: { color: Colors.gray6 },
  redeemSheet: { padding: 24 },
  redeemTitle: { color: Colors.white, marginBottom: 8 },
  redeemDesc: { color: Colors.gray6, marginBottom: 12 },
  redeemCode: { color: Colors.gray6, marginBottom: 20 },
  redeemConfirmBtn: { paddingVertical: 14, borderRadius: 24, backgroundColor: Colors.purple1, alignItems: 'center' },
  redeemConfirmText: { color: Colors.gray1, fontWeight: '600' },
});
