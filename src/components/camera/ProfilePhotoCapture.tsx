/**
 * Profile Photo Capture — take or select a profile photo.
 * Ported from squad-demo's OnboardingPhotoActionSheet pattern.
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';

let ImagePicker: any;
try {
  ImagePicker = require('expo-image-picker');
} catch {}

interface ProfilePhotoCaptureProps {
  onSelect: (uri: string) => void;
  onCancel: () => void;
}

export default function ProfilePhotoCapture({ onSelect, onCancel }: ProfilePhotoCaptureProps) {
  const [loading, setLoading] = useState(false);

  const takePhoto = useCallback(async () => {
    if (!ImagePicker) {
      Alert.alert('Camera not available');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Access', 'Please enable camera access in Settings.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onSelect(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[ProfilePhotoCapture] Camera error:', err);
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  const selectFromLibrary = useCallback(async () => {
    if (!ImagePicker) {
      Alert.alert('Image picker not available');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo Access', 'Please enable photo library access in Settings.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onSelect(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[ProfilePhotoCapture] Library error:', err);
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <TitleSmall style={styles.title}>Profile Photo</TitleSmall>

        <Pressable style={styles.option} onPress={takePhoto}>
          <BodyRegular style={styles.optionText}>Take Photo</BodyRegular>
        </Pressable>

        <Pressable style={styles.option} onPress={selectFromLibrary}>
          <BodyRegular style={styles.optionText}>Choose from Library</BodyRegular>
        </Pressable>

        <Pressable style={[styles.option, styles.cancelOption]} onPress={onCancel}>
          <BodyRegular style={styles.cancelText}>Cancel</BodyRegular>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.gray2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray5,
  },
  optionText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: 16,
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    color: Colors.red,
    textAlign: 'center',
    fontSize: 16,
  },
});
