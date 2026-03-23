import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/SquadNavigator';

import { useSquadSDK } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import UserImage from '../../components/ux/user-image/UserImage';
import { BodyRegular, TitleSmall, BodyMedium } from '../../components/ux/text/Typography';
import { useCurrentUser } from '../../hooks/useSquadData';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ label, value, onPress, danger }: SettingsRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
    >
      <BodyRegular style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </BodyRegular>
      {value && <BodyMedium style={styles.rowValue}>{value}</BodyMedium>}
      {onPress && <Text style={styles.rowChevron}>{'>'}</Text>}
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <TitleSmall style={styles.sectionTitle}>{title}</TitleSmall>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const sdk = useSquadSDK();
  const { theme } = useTheme();
  const { user } = useCurrentUser();
  const navigation = useNavigation<Nav>();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await sdk.sessionManager.logout();
            // Navigator will automatically route to auth screen
          },
        },
      ],
    );
  }, [sdk]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user && (
          <View style={styles.profileSection}>
            <UserImage
              imageUrl={user.imageUrl}
              displayName={user.displayName}
              size={64}
            />
            <View style={styles.profileInfo}>
              <TitleSmall style={styles.profileName}>
                {user.displayName}
              </TitleSmall>
              <BodyMedium style={styles.profileEmail}>
                {user.email ?? user.phone ?? ''}
              </BodyMedium>
            </View>
          </View>
        )}

        <SettingsSection title="Account">
          <SettingsRow label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <SettingsRow label="Community" value={user?.community ?? ''} onPress={() => {}} />
          <SettingsRow label="Blocked Users" onPress={() => navigation.navigate('BlockedUsers')} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow label="Push Notifications" onPress={() => Linking.openSettings()} />
          <SettingsRow label="Email Notifications" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Terms & Conditions" onPress={() => Linking.openURL('https://www.withyoursquad.com/terms')} />
          <SettingsRow label="Privacy Policy" onPress={() => Linking.openURL('https://www.withyoursquad.com/privacy')} />
          <SettingsRow label="SDK Version" value="0.1.0" />
        </SettingsSection>

        <SettingsSection title="">
          <SettingsRow label="Log Out" onPress={handleLogout} danger />
          <SettingsRow label="Delete Account" onPress={() => navigation.navigate('DeleteAccount')} danger />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray3,
    marginBottom: 24,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: Colors.white,
  },
  profileEmail: {
    color: Colors.gray6,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.gray6,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray3,
  },
  rowLabel: {
    color: Colors.white,
    flex: 1,
  },
  rowLabelDanger: {
    color: Colors.red,
  },
  rowValue: {
    color: Colors.gray6,
    marginRight: 8,
  },
  rowChevron: {
    color: Colors.gray6,
    fontSize: 14,
  },
});
