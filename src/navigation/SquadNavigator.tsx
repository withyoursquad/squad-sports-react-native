import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRecoilValue } from 'recoil';

import { User } from '@squad-sports/core';
import { useSquadSDK } from '../SquadProvider';
import { Colors } from '../theme/ThemeContext';
import { ScreenErrorBoundary } from '../components/ErrorBoundary';
import { featureFlags } from '../state/features';

// Auth Screens
import { LandingScreen } from '../screens/auth/LandingScreen';
import { EnterEmailScreen } from '../screens/auth/EnterEmailScreen';
import { EnterCodeScreen } from '../screens/auth/EnterCodeScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';

// Onboarding Screens
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingTeamSelectScreen } from '../screens/onboarding/OnboardingTeamSelectScreen';
import { OnboardingAccountSetupScreen } from '../screens/onboarding/OnboardingAccountSetupScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MessagingScreen } from '../screens/messaging/MessagingScreen';
import { FreestyleCreationScreen } from '../screens/freestyle/FreestyleCreationScreen';
import { PollResponseScreen } from '../screens/polls/PollResponseScreen';
import { InviteScreen } from '../screens/invite/InviteScreen';

// Settings sub-screens
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { BlockedUsersScreen } from '../screens/settings/BlockedUsersScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';

// Events & Wallet
import { EventScreen } from '../screens/events/EventScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';

// Freestyle sub-screens
import { FreestyleScreen } from '../screens/freestyle/FreestyleScreen';
import { FreestyleListensScreen } from '../screens/freestyle/FreestyleListensScreen';
import { FreestyleReactionsScreen } from '../screens/freestyle/FreestyleReactionsScreen';
import { CommunityFreestyleListensScreen, CommunityFreestyleReactionsScreen } from '../screens/freestyle/CommunityFreestyleScreen';

// Poll sub-screens
import { PollSummationScreen } from '../screens/polls/PollSummationScreen';

// Auth sub-screens
import { LoginScreen } from '../screens/auth/LoginScreen';

// Invite sub-screens
import { InvitationQrCodeScreen } from '../screens/invite/InvitationQrCodeScreen';

// Settings sub-screens
import { NetworkStatusScreen } from '../screens/settings/NetworkStatusScreen';

// Squad Line
import { AddCallTitleScreen } from '../screens/squad-line/AddCallTitleScreen';
import { CallScreen } from '../squad-line/CallScreen';
import { IncomingCallOverlay } from '../squad-line/IncomingCallOverlay';

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  screenName: string,
): React.ComponentType<P> {
  return function WrappedScreen(props: P) {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <Component {...props} />
      </ScreenErrorBoundary>
    );
  };
}

export type RootStackParamList = {
  // Auth
  Landing: undefined;
  EnterEmail: { email?: string } | undefined;
  EnterCode: { phone?: string; email?: string };
  EmailVerification: undefined;
  SignUp: undefined;

  // Onboarding
  OnboardingWelcome: undefined;
  OnboardingTeamSelect: undefined;
  OnboardingAccountSetup: undefined;

  // Main
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  EditProfile: undefined;
  BlockedUsers: undefined;
  DeleteAccount: undefined;
  Messaging: { connectionId: string };
  FreestyleCreate: undefined;
  PollResponse: { pollId: string };
  Invite: undefined;

  // Squad Line
  AddCallTitle: { connectionId: string };
  ActiveCall: { connectionId: string; title: string };
  IncomingCall: { callerId: string; callerName: string };

  // Events & Wallet
  Events: undefined;
  Wallet: undefined;

  // Freestyle sub-screens
  Freestyle: { freestyleId: string };
  FreestyleListens: { freestyleId: string };
  FreestyleReactions: { freestyleId: string };
  CommunityFreestyleListens: { freestyleId: string };
  CommunityFreestyleReactions: { freestyleId: string; emoji?: string };

  // Poll sub-screens
  PollSummation: { pollId: string };

  // Auth sub-screens
  Login: undefined;

  // Invite sub-screens
  InvitationQrCode: undefined;

  // Settings sub-screens
  NetworkStatus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationState = 'loading' | 'auth' | 'onboarding' | 'main';

export function SquadNavigator() {
  const sdk = useSquadSDK();
  const [navState, setNavState] = useState<NavigationState>('loading');
  const features = useRecoilValue(featureFlags);

  useEffect(() => {
    const determineRoute = async () => {
      try {
        const token = await sdk.tokenStorage.getAccessToken();
        if (!token) {
          setNavState('auth');
          return;
        }

        const user = await sdk.apiClient.getLoggedInUser();
        if (!user) {
          setNavState('auth');
          return;
        }

        const partnerAuth = sdk.config.partnerAuth;
        const hasDisplayName = !!(user.displayName?.trim());
        const hasCommunity = !!(user.community?.trim());

        // Partner flow: auto-fill missing profile data and skip onboarding
        if (partnerAuth?.communityId) {
          if (!hasCommunity) {
            await sdk.apiClient.updateUserCommunity({ id: partnerAuth.communityId }).catch(() => {});
          }
          if (!hasDisplayName && partnerAuth.userData?.displayName) {
            await sdk.apiClient.updateLoggedInUser(
              new User({ displayName: partnerAuth.userData.displayName }),
            ).catch(() => {});
          }
          setNavState('main');
          return;
        }

        if (!hasDisplayName || !hasCommunity) {
          setNavState('onboarding');
          return;
        }

        setNavState('main');
      } catch {
        setNavState('auth');
      }
    };

    determineRoute();

    // Listen for auth changes
    const onAuthInvalid = () => setNavState('auth');
    sdk.apiClient.emitter.on('auth:invalid', onAuthInvalid);
    return () => {
      sdk.apiClient.emitter.off('auth:invalid', onAuthInvalid);
    };
  }, [sdk]);

  if (navState === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.gray9, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.gray9 },
        }}
      >
        {navState === 'auth' && (
          <>
            <Stack.Screen name="Landing" component={withErrorBoundary(LandingScreen, 'Landing')} />
            <Stack.Screen name="EnterEmail" component={withErrorBoundary(EnterEmailScreen, 'EnterEmail')} />
            <Stack.Screen name="EnterCode" component={withErrorBoundary(EnterCodeScreen, 'EnterCode')} />
            <Stack.Screen name="EmailVerification" component={withErrorBoundary(EmailVerificationScreen, 'EmailVerification')} />
            <Stack.Screen name="Login" component={withErrorBoundary(LoginScreen, 'Login')} />
          </>
        )}

        {navState === 'onboarding' && (
          <>
            <Stack.Screen name="OnboardingWelcome" component={withErrorBoundary(OnboardingWelcomeScreen, 'OnboardingWelcome')} />
            <Stack.Screen name="OnboardingTeamSelect" component={withErrorBoundary(OnboardingTeamSelectScreen, 'OnboardingTeamSelect')} />
            <Stack.Screen name="OnboardingAccountSetup" component={withErrorBoundary(OnboardingAccountSetupScreen, 'OnboardingAccountSetup')} />
          </>
        )}

        {navState === 'main' && (
          <>
            <Stack.Screen name="Home" component={withErrorBoundary(HomeScreen, 'Home')} />
            <Stack.Screen name="Profile" component={withErrorBoundary(ProfileScreen, 'Profile')} />
            <Stack.Screen name="Settings" component={withErrorBoundary(SettingsScreen, 'Settings')} />
            <Stack.Screen name="EditProfile" component={withErrorBoundary(EditProfileScreen, 'EditProfile')} />
            <Stack.Screen name="BlockedUsers" component={withErrorBoundary(BlockedUsersScreen, 'BlockedUsers')} />
            <Stack.Screen name="DeleteAccount" component={withErrorBoundary(DeleteAccountScreen, 'DeleteAccount')} />
            <Stack.Screen name="Events" component={withErrorBoundary(EventScreen, 'Events')} />
            {features.wallet && <Stack.Screen name="Wallet" component={withErrorBoundary(WalletScreen, 'Wallet')} />}
            <Stack.Screen name="Messaging" component={withErrorBoundary(MessagingScreen, 'Messaging')} />
            <Stack.Screen name="FreestyleCreate" component={withErrorBoundary(FreestyleCreationScreen, 'FreestyleCreate')} />
            <Stack.Screen name="PollResponse" component={withErrorBoundary(PollResponseScreen, 'PollResponse')} />
            <Stack.Screen name="Invite" component={withErrorBoundary(InviteScreen, 'Invite')} />
            {features.squadLine && <Stack.Screen name="AddCallTitle" component={withErrorBoundary(AddCallTitleScreen, 'AddCallTitle')} />}
            <Stack.Screen name="Freestyle" component={withErrorBoundary(FreestyleScreen, 'Freestyle')} />
            <Stack.Screen name="FreestyleListens" component={withErrorBoundary(FreestyleListensScreen, 'FreestyleListens')} />
            <Stack.Screen name="FreestyleReactions" component={withErrorBoundary(FreestyleReactionsScreen, 'FreestyleReactions')} />
            <Stack.Screen name="CommunityFreestyleListens" component={withErrorBoundary(CommunityFreestyleListensScreen, 'CommunityFreestyleListens')} />
            <Stack.Screen name="CommunityFreestyleReactions" component={withErrorBoundary(CommunityFreestyleReactionsScreen, 'CommunityFreestyleReactions')} />
            <Stack.Screen name="PollSummation" component={withErrorBoundary(PollSummationScreen, 'PollSummation')} />
            <Stack.Screen name="InvitationQrCode" component={withErrorBoundary(InvitationQrCodeScreen, 'InvitationQrCode')} />
            <Stack.Screen name="NetworkStatus" component={withErrorBoundary(NetworkStatusScreen, 'NetworkStatus')} />
            {features.squadLine && (
              <Stack.Screen
                name="ActiveCall"
                component={withErrorBoundary(CallScreen, 'ActiveCall')}
                options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
              />
            )}
          </>
        )}
      </Stack.Navigator>

      {/* Global overlay for incoming calls — only when Squad Line is enabled */}
      {features.squadLine && <IncomingCallOverlay />}
    </>
  );
}
