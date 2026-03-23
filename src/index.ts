// SDK Entry
export { SquadSportsSDK } from './SquadSportsSDK';

// Provider & Hooks
export { SquadProvider, useSquadSDK, useApiClient } from './SquadProvider';

// Experience (drop-in component)
export { SquadExperience } from './SquadExperience';

// Navigation
export { SquadNavigator } from './navigation/SquadNavigator';
export type { RootStackParamList } from './navigation/SquadNavigator';

// Theme
export { ThemeProvider, useTheme, Colors, defaultTheme, buildCommunityTheme } from './theme/ThemeContext';
export type { Theme, ColorScheme } from './theme/ThemeContext';

// UX Components
export {
  Button,
  XButton,
  TextInput,
  PhoneNumberInput,
  CodeInput,
  Screen,
  ScreenHeader,
  LoadingOverlay,
  AvoidKeyboardScreen,
  Toast,
  TitleLarge,
  TitleRegular,
  TitleMedium,
  TitleSmall,
  TitleTiny,
  SubtitleSmall,
  BodyRegular,
  BodyMedium,
  BodySmall,
  ButtonLarge,
  ButtonSmall,
  ErrorHint,
  UserImage,
  BackButton,
} from './components';
export type { ButtonProps, ToastType } from './components';

// Feed Components
export { default as FreestyleCard } from './components/feed/FreestyleCard';
export { default as PollCard } from './components/feed/PollCard';
export { default as MessageCard } from './components/message/MessageCard';
export { AudioPlayerRow } from './components/audio/AudioPlayerRow';

// Auth Screens
export { LandingScreen } from './screens/auth/LandingScreen';
export { EnterEmailScreen } from './screens/auth/EnterEmailScreen';
export { EnterCodeScreen } from './screens/auth/EnterCodeScreen';
export { EmailVerificationScreen } from './screens/auth/EmailVerificationScreen';

// Onboarding Screens
export { OnboardingWelcomeScreen } from './screens/onboarding/OnboardingWelcomeScreen';
export { OnboardingTeamSelectScreen } from './screens/onboarding/OnboardingTeamSelectScreen';
export { OnboardingAccountSetupScreen } from './screens/onboarding/OnboardingAccountSetupScreen';

// Main Screens
export { HomeScreen } from './screens/home/HomeScreen';
export { ProfileScreen } from './screens/profile/ProfileScreen';
export { SettingsScreen } from './screens/settings/SettingsScreen';
export { EditProfileScreen } from './screens/settings/EditProfileScreen';
export { BlockedUsersScreen } from './screens/settings/BlockedUsersScreen';
export { DeleteAccountScreen } from './screens/settings/DeleteAccountScreen';
export { MessagingScreen } from './screens/messaging/MessagingScreen';
export { FreestyleCreationScreen } from './screens/freestyle/FreestyleCreationScreen';
export { PollResponseScreen } from './screens/polls/PollResponseScreen';
export { InviteScreen } from './screens/invite/InviteScreen';

// Squad Line (Voice Calling)
export { AddCallTitleScreen } from './screens/squad-line/AddCallTitleScreen';
export { SquadLineClient } from './squad-line/SquadLineClient';
export type { CallState, CallInfo } from './squad-line/SquadLineClient';
export { useSquadLine } from './squad-line/useSquadLine';
export { CallScreen } from './squad-line/CallScreen';
export { IncomingCallOverlay } from './squad-line/IncomingCallOverlay';

// Real-time & Offline
export { EventProcessor } from './realtime/EventProcessor';
export type { ConnectionQuality } from './realtime/EventProcessor';
export { useRealtimeSync, useRealtimeEvent, useMessageUpdates, useSquadUpdates } from './realtime/useRealtimeSync';
export { OfflineQueue } from './realtime/OfflineQueue';
export type { OfflineAction, OfflineActionType } from './realtime/OfflineQueue';
export { NetworkMonitor, useNetworkStatus } from './realtime/NetworkMonitor';
export { PushNotificationHandler } from './realtime/PushNotificationHandler';
export type { PushNotificationPayload, NotificationType, NotificationRouteAction } from './realtime/PushNotificationHandler';

// Data Hooks
export { useCurrentUser, useSquadConnections, useFeed } from './hooks/useSquadData';

// Re-export core types
export type {
  SquadSDKConfig,
  SquadPartnerConfig,
  SquadConfig,
  StorageAdapter,
  CommunityConfig,
  FeatureFlags,
  Environment,
  SSOConfig,
  SSOProvider,
  NexusPartnerConfig,
} from '@squad-sports/core';
