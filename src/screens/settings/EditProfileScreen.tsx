import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import UserImage from '../../components/ux/user-image/UserImage';
import { BodyRegular, BodyMedium } from '../../components/ux/text/Typography';
import type { User } from '@squad-sports/core';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      const userData = await apiClient.getLoggedInUser();
      if (userData) {
        setUser(userData);
        setDisplayName(userData.displayName ?? '');
        setEmail(userData.email ?? '');
      }
    };
    load();
  }, [apiClient]);

  const handleSave = useCallback(async () => {
    if (!user || !hasChanges) return;

    setIsSaving(true);
    try {
      const updated = user.clone();
      updated.displayName = displayName.trim();
      await apiClient.updateLoggedInUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [user, displayName, hasChanges, apiClient, navigation]);

  const handlePickPhoto = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user) {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const buffer = new Uint8Array(await (blob as any).arrayBuffer());
        await apiClient.uploadUserImage(user.id ?? '', buffer, 'image/jpeg');
        // Reload user data
        const refreshed = await apiClient.getLoggedInUser();
        if (refreshed) setUser(refreshed);
      }
    } catch {
      Alert.alert('Error', 'Failed to update photo.');
    }
  }, [user, apiClient]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader
        title="Edit Profile"
        right={
          hasChanges ? (
            <Pressable onPress={handleSave} disabled={isSaving}>
              <Text style={[styles.saveText, { color: theme.buttonColor }]}>
                {isSaving ? '...' : 'Save'}
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={handlePickPhoto} style={styles.photoSection}>
          <UserImage
            imageUrl={user?.imageUrl}
            displayName={displayName}
            size={96}
          />
          <BodyMedium style={[styles.changePhotoText, { color: theme.buttonColor }]}>
            Change Photo
          </BodyMedium>
        </Pressable>

        <View style={styles.field}>
          <BodyMedium style={styles.label}>Name</BodyMedium>
          <TextInput
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setHasChanges(true);
            }}
            style={styles.input}
            placeholderTextColor={Colors.gray6}
            maxLength={30}
          />
        </View>

        <View style={styles.field}>
          <BodyMedium style={styles.label}>Email</BodyMedium>
          <BodyRegular style={styles.readOnlyValue}>{email}</BodyRegular>
        </View>

        <View style={styles.field}>
          <BodyMedium style={styles.label}>Community</BodyMedium>
          <BodyRegular style={styles.readOnlyValue}>
            {user?.community ?? 'Not set'}
          </BodyRegular>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  saveText: { fontSize: 16, fontWeight: '600' },
  photoSection: { alignItems: 'center', paddingVertical: 24 },
  changePhotoText: { marginTop: 8 },
  field: { marginBottom: 24 },
  label: { color: Colors.gray6, marginBottom: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  input: {
    color: Colors.white, fontSize: 16, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: Colors.gray2, borderRadius: 8,
  },
  readOnlyValue: { color: Colors.gray6, fontSize: 16, paddingVertical: 14 },
});
