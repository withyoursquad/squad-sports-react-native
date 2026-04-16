/**
 * Camera Permissions Wrap — renders children only when camera is granted.
 * Ported from squad-demo/src/components/camera/PermissionWrap.tsx.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleMedium, BodyRegular } from '../ux/text/Typography';

let Camera: any;
try {
  Camera = require('expo-camera');
} catch {}

interface CameraPermissionsWrapProps {
  children: React.ReactNode;
}

export default function CameraPermissionsWrap({ children }: CameraPermissionsWrapProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!Camera) {
      setHasPermission(true); // Skip if camera module not available
      return;
    }
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch {
      setHasPermission(true); // Allow through on error
    }
  };

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  if (hasPermission === null) return null;

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <TitleMedium style={styles.title}>Enable Camera Access</TitleMedium>
        <BodyRegular style={styles.description}>
          Camera access lets us update your profile photo and scan invitation QR codes.
        </BodyRegular>
        <Button style={styles.button} onPress={openSettings}>
          <BodyRegular style={styles.buttonText}>Give Access</BodyRegular>
        </Button>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: Colors.gray6,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.purple1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
