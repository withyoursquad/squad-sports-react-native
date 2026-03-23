/**
 * Wallet and coupon atoms.
 * Ported from squad-demo/src/atoms/wallet.ts.
 */
import { atom } from 'recoil';
import type { Wallet, Coupons, Brands } from '@squad-sports/core';

export const reWallet = atom<Wallet | null>({
  key: 'squad-sdk:wallet:data',
  default: null,
});

export const reCoupons = atom<Coupons | null>({
  key: 'squad-sdk:wallet:coupons',
  default: null,
});

export const reBrands = atom<Brands | null>({
  key: 'squad-sdk:wallet:brands',
  default: null,
});

export const reWalletRefresh = atom<number>({
  key: 'squad-sdk:wallet:refresh',
  default: 0,
});
