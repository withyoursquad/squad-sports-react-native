import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';

export type PermissionType = 'microphone' | 'camera' | 'contacts' | 'notifications' | 'photos';

interface PermissionDialogProps {
  type: PermissionType;
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isDenied?: boolean;
}

const PERMISSION_CONFIG: Record<PermissionType, { icon: string; title: string; description: string }> = {
  microphone: {
    icon: 'M',
    title: 'Microphone Access',
    description: 'Squad needs microphone access to record freestyles and voice messages.',
  },
  camera: {
    icon: 'C',
    title: 'Camera Access',
    description: 'Squad needs camera access to take profile photos.',
  },
  contacts: {
    icon: 'P',
    title: 'Contacts Access',
    description: 'Squad can find your friends who are already on the app.',
  },
  notifications: {
    icon: 'N',
    title: 'Notifications',
    description: 'Get notified when you receive messages, calls, and squad updates.',
  },
  photos: {
    icon: 'I',
    title: 'Photo Library',
    description: 'Squad needs access to your photos to set your profile picture.',
  },
};

export function PermissionDialog({
  type,
  visible,
  onAllow,
  onDeny,
  isDenied = false,
}: PermissionDialogProps) {
  if (!visible) return null;

  const config = PERMISSION_CONFIG[type];

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>

        <TitleSmall style={styles.title}>{config.title}</TitleSmall>
        <BodyRegular style={styles.description}>{config.description}</BodyRegular>

        <View style={styles.buttons}>
          {isDenied ? (
            <>
              <Button style={styles.settingsButton} onPress={() => Linking.openSettings()}>
                <Text style={styles.settingsText}>Open Settings</Text>
              </Button>
              <Button style={styles.laterButton} onPress={onDeny}>
                <Text style={styles.laterText}>Not Now</Text>
              </Button>
            </>
          ) : (
            <>
              <Button style={styles.allowButton} onPress={onAllow}>
                <Text style={styles.allowText}>Allow</Text>
              </Button>
              <Button style={styles.laterButton} onPress={onDeny}>
                <Text style={styles.laterText}>Not Now</Text>
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 32,
  },
  dialog: {
    backgroundColor: Colors.gray2,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.purple1, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  icon: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  title: { color: Colors.white, marginBottom: 8, textAlign: 'center' },
  description: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  buttons: { width: '100%', gap: 8 },
  allowButton: {
    height: 48, borderRadius: 24, backgroundColor: Colors.purple1,
    justifyContent: 'center', alignItems: 'center',
  },
  allowText: { color: Colors.gray1, fontSize: 15, fontWeight: '600' },
  settingsButton: {
    height: 48, borderRadius: 24, backgroundColor: Colors.purple1,
    justifyContent: 'center', alignItems: 'center',
  },
  settingsText: { color: Colors.gray1, fontSize: 15, fontWeight: '600' },
  laterButton: {
    height: 48, justifyContent: 'center', alignItems: 'center',
  },
  laterText: { color: Colors.gray6, fontSize: 15 },
});
