/**
 * Modal key definitions for dialogs, toasts, and bottom sheets.
 * Ported from squad-demo/src/atoms/modal-keys.ts.
 */

export enum DialogKey {
  blockConfirmation = 'block-confirmation',
  deleteConfirmation = 'delete-confirmation',
  flagConfirmation = 'flag-confirmation',
  micPermissions = 'mic-permissions',
  cameraPermissions = 'camera-permissions',
  imagesPermissions = 'images-permissions',
  notificationPermissions = 'notification-permissions',
  unblockConfirmation = 'unblock-confirmation',
  SOTDIntroduction = 'sotd-introduction',
  SOTDBlocked = 'sotd-blocked',
  progressCongratulation = 'progress-congratulation',
  collectEmail = 'collect-email',
  noConnection = 'no-connection',
  removeFromSquad = 'remove-from-squad',
}

export enum ToastKey {
  success = 'success',
  error = 'error',
  info = 'info',
  busy = 'busy',
  networkBanner = 'network-banner',
}

export enum BottomSheetKey {
  squadLineInvitation = 'squad-line-invitation',
  help = 'help',
  quickTip = 'quick-tip',
  sophiaIntroduction = 'sophia-introduction',
  SOTD = 'SOTD',
  upgradeHardLock = 'upgrade-hard-lock',
  upgradeSoftLock = 'upgrade-soft-lock',
  addFreestyleReaction = 'add-freestyle-reaction',
  selectCommunity = 'select-community',
  removeOrBlock = 'remove-or-block',
  addPollReaction = 'add-poll-reaction',
  filterPollSummation = 'filter-poll-summation',
  pollReactions = 'poll-reactions',
  inviteFeatureIntroduction = 'invite-feature-introduction',
  sotdSelectingFriend = 'SOTD-selecting-friend',
  errorInfo = 'error-info',
  inviteContact = 'invite-contact',
  inviteErrorSquadMaxed = 'invite-error-squad-maxed',
  inviteErrorOtherSquadMaxed = 'invite-error-other-squad-maxed',
  requestItemMenu = 'request-item-menu',
  sotdIntroduction = 'sotd-introduction-selecting',
  selectTeam = 'select-team',
  viewAllAttendees = 'events-view-all-attendees',
  redeemWalletCode = 'redeem-wallet-code',
  couponShareSheet = 'coupon-share-sheet',
  couponInternalShareSheet = 'coupon-internal-share-sheet',
}

export type DialogProps = Record<string, any>;
export type ToastProps = Record<string, any>;
export type BottomSheetProps = Record<string, any> & { onDismiss?: () => void };
export type ModalKey = DialogKey | ToastKey | BottomSheetKey;
