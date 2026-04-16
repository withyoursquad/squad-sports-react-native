/**
 * Invitation atoms.
 * Ported from squad-demo/src/atoms/invitations.ts + live/invitation-code.ts.
 */
import { atom } from 'recoil';
import type { InvitationCode } from '@squad-sports/core';

export const reInvitationCode = atom<InvitationCode | null>({
  key: 'squad-sdk:invitations:code',
  default: null,
});

export const reInvitationCodeLoaded = atom<boolean>({
  key: 'squad-sdk:invitations:loaded',
  default: false,
});
