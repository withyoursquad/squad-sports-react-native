/**
 * WalletHeader.tsx
 * Wallet screen header with description text.
 * Ported from squad-demo/src/components/wallet/WalletHeader.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleTiny } from '../ux/text/Typography';

export type WalletHeaderProps = {
  /** Custom header text. */
  headerText?: string;
};

export default function WalletHeader({
  headerText,
}: WalletHeaderProps) {
  return (
    <View style={styles.container}>
      <TitleTiny style={styles.freestyleHeader}>
        {headerText || 'Use any code in your 741 Wallet below before they expire.'}
      </TitleTiny>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '90%',
  },
  freestyleHeader: {
    color: Colors.white,
  },
});
