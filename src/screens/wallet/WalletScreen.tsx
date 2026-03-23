import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleSmall, TitleMedium, TitleLarge, BodyRegular, BodyMedium, BodySmall } from '../../components/ux/text/Typography';

interface CouponItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  brandName?: string;
  brandImageUrl?: string;
  discount?: string;
  expiresAt?: string;
  status: string;
  isRedeemed: boolean;
}

export function WalletScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [balance, setBalance] = useState<number>(0);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wallet, couponsData] = await Promise.all([
          apiClient.getWallet().catch(() => null),
          apiClient.getCoupons().catch(() => null),
        ]);

        if ((wallet as any)?.balance !== undefined) {
          setBalance((wallet as any).balance);
        }

        if (couponsData?.coupons) {
          setCoupons(couponsData.coupons.map((c: any) => ({
            id: c.id,
            code: c.code ?? '',
            title: c.title ?? c.name ?? '',
            description: c.description,
            brandName: c.brand?.name,
            brandImageUrl: c.brand?.imageUrl,
            discount: c.discount ?? c.value,
            expiresAt: c.expiresAt,
            status: c.status ?? 'active',
            isRedeemed: c.status === 'redeemed',
          })));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [apiClient]);

  const handleRedeem = useCallback(async (code: string) => {
    try {
      await apiClient.redeemCoupon(code, {});
      setCoupons(prev => prev.map(c =>
        c.code === code ? { ...c, isRedeemed: true, status: 'redeemed' } : c
      ));
    } catch {}
  }, [apiClient]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Wallet" />

      {/* Balance card */}
      <View style={[styles.balanceCard, { borderColor: theme.buttonColor }]}>
        <BodySmall style={styles.balanceLabel}>Your Balance</BodySmall>
        <TitleLarge style={[styles.balanceAmount, { color: theme.buttonColor }]}>
          {balance}
        </TitleLarge>
        <BodySmall style={styles.balanceUnit}>points</BodySmall>
      </View>

      {/* Coupons */}
      <TitleSmall style={styles.sectionTitle}>Your Coupons</TitleSmall>

      <FlatList
        data={coupons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.couponList}
        renderItem={({ item }) => (
          <View style={[styles.couponCard, item.isRedeemed && styles.couponRedeemed]}>
            <View style={styles.couponLeft}>
              {item.brandName && (
                <BodySmall style={styles.brandName}>{item.brandName}</BodySmall>
              )}
              <TitleSmall style={styles.couponTitle}>{item.title}</TitleSmall>
              {item.description && (
                <BodySmall style={styles.couponDesc} numberOfLines={2}>{item.description}</BodySmall>
              )}
              {item.discount && (
                <BodyMedium style={[styles.couponDiscount, { color: theme.buttonColor }]}>
                  {item.discount}
                </BodyMedium>
              )}
            </View>
            <View style={styles.couponRight}>
              {item.isRedeemed ? (
                <View style={styles.redeemedBadge}>
                  <BodySmall style={styles.redeemedText}>Redeemed</BodySmall>
                </View>
              ) : (
                <Button
                  style={[styles.redeemButton, { backgroundColor: theme.buttonColor }]}
                  onPress={() => handleRedeem(item.code)}
                >
                  <Text style={[styles.redeemText, { color: theme.buttonText }]}>Redeem</Text>
                </Button>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <BodyRegular style={styles.emptyText}>No coupons available</BodyRegular>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: {
    marginHorizontal: 24, marginTop: 8, marginBottom: 24,
    padding: 24, borderRadius: 16, borderWidth: 1.5,
    backgroundColor: Colors.gray2, alignItems: 'center',
  },
  balanceLabel: { color: Colors.gray6, marginBottom: 4 },
  balanceAmount: { fontSize: 48, lineHeight: 56, fontWeight: '700' },
  balanceUnit: { color: Colors.gray6 },
  sectionTitle: { color: Colors.white, paddingHorizontal: 24, marginBottom: 12 },
  couponList: { paddingHorizontal: 24, gap: 12, paddingBottom: 48 },
  couponCard: {
    flexDirection: 'row', backgroundColor: Colors.gray2,
    borderRadius: 12, padding: 16, gap: 12,
  },
  couponRedeemed: { opacity: 0.6 },
  couponLeft: { flex: 1 },
  couponRight: { justifyContent: 'center' },
  brandName: { color: Colors.gray6, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  couponTitle: { color: Colors.white, marginBottom: 4 },
  couponDesc: { color: Colors.gray6, marginBottom: 4 },
  couponDiscount: { fontWeight: '600' },
  redeemButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  redeemText: { fontSize: 13, fontWeight: '600' },
  redeemedBadge: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 12, backgroundColor: Colors.gray3,
  },
  redeemedText: { color: Colors.gray6, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 32 },
  emptyText: { color: Colors.gray6 },
});
