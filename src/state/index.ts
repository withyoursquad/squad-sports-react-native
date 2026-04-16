/**
 * State management — all Recoil atoms.
 * Complete port from squad-demo/src/atoms/.
 */

// CRDT
export { compileCrdt, compileCrdtSingle } from './sync/crdt';
export type { CrdtArray, CrdtArrayItem, CrdtArrayOperation } from './sync/crdt';

// Dependable
export { DependableAtom, DependableSelector, DependableAtomFamily } from './sync/dependable';

// Refresh
export { reLastRefreshed, reRefresh, reRefreshing } from './sync/refresh';

// Offline
export { isOnlineAtom, pendingActionsAtom, offlineCacheAtom, shouldUseOfflineDataSelector } from './sync/offline-support';
export type { QueuedOfflineAction, OfflineActionType } from './sync/offline-support';

// Session / Auth
export {
  reActivePhoneNumber, reActiveEmail, reActiveCode,
  reActiveAccessToken, reActiveUserId, reUserRefresh,
  reAuthHydrated, rePendingNavigation, reAttemptedVerifications,
  pruneExpiredAttemptedVerifications, ATTEMPTED_VERIFICATION_WINDOW_MS,
} from './session';
export type { AttemptedVerification } from './session';

// Permissions
export {
  microphonePermissions, contactsPermissions, cameraPermissions,
  imagesPermissions, notificationsPermissions,
} from './permissions';
export type { PermissionStatus } from './permissions';

// Modal queue
export { default as modalQueue, ModalQueueItem, ModalType, topModalAtom } from './modal-queue';
export { DialogKey, ToastKey, BottomSheetKey } from './modal-keys';
export type { ModalKey, DialogProps, ToastProps, BottomSheetProps } from './modal-keys';
export type { ModalQueueOptions } from './modal-queue';

// Communities
export {
  reAllCommunities, reAllCommunitiesByGroups, reCommunityById,
  reCommunitiesRefresh, reUserCommunity, reCommunityReactions,
  reOnboardingSelectedCommunity,
} from './communities';

// Navigation
export { currentStack, navigationState, reOnboardingStep, rePostOnboardingLoadingActive } from './navigation';
export type { ScreenName, OnboardingStep } from './navigation';

// Audio
export {
  playerForRecorder, statusForAudioDevice, positionForAudioPlayer,
  isAudioRecording, activeAudioPlayerId,
} from './audio';
export type { AudioStatus } from './audio';

// UI
export {
  loadingOverlayVisible, loadingOverlayText,
  aKeyboardOpen, networkBannerVisible, networkStateAtom,
} from './ui';

// Features / Config
export {
  featureFlags, configApp, developerAccessEnabled,
  reLatestAppStoreVersion, sessionCount, rePrereleaseEnabled,
} from './features';
export type { ApiEnvironment } from './features';

// Contacts
export { deviceContacts, contactsLoaded, contactsOnSquad } from './contacts';
export type { DeviceContact } from './contacts';

// Wallet
export { reWallet, reCoupons, reBrands, reWalletRefresh } from './wallet';

// SOTD
export { reSquaddieOfTheDay, reSOTDAnimationShown, reSOTDIntroShown } from './squaddie-of-the-day';

// User
export {
  reUserCache, reLoggedInUserLoaded, userUpdates,
  reUser, reUserTag, reSophiaUser,
} from './user';

// Client
export { rePreferredApiEnvironment, reAnyClient } from './client';

// Sync — Squad
export { reInitialConnections, reConnectionUpdates, reConnectionWithUser } from './sync/squad-v2';

// Sync — Feed
export {
  reInitialFeed, feedUpdates, feedExpiryTickAtom,
  freestyleReactionUpdates, reFreestylePrompts, reFreestyleCreating,
} from './sync/feed-v2';

// Sync — Messages
export {
  reInitialConversationState, reConnectionMessages, reMessageReaction,
  reMessageSendStatus, reMessagePrompts,
} from './sync/messages';
export type { FailedMessageInfo } from './sync/messages';

// Sync — Polls
export {
  reInitialPollFeed, rePollUpdates, rePollResponseUpdates,
  rePollResponseReactionsUpdates, rePollNudgesUpdates,
} from './sync/polls';

// Events
export { reActiveEvents, reEventsRefresh } from './events';

// Invitations
export { reInvitationCode, reInvitationCodeLoaded } from './invitations';

// Device info
export { reDeviceInfo } from './device-info';
