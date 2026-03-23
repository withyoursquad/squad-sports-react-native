import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useApiClient, useSquadSDK } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import Button from '../../components/ux/buttons/Button';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import UserImage from '../../components/ux/user-image/UserImage';
import AvoidKeyboardScreen from '../../components/ux/layout/AvoidKeyboardScreen';
import { BodyRegular, TitleMedium } from '../../components/ux/text/Typography';
import { ErrorHint } from '../../components/ux/errors/ErrorHint';

export function OnboardingAccountSetupScreen() {
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const sdk = useSquadSDK();
  const { theme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = useCallback(async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert('Permission needed', 'Please grant photo library access to set your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      setError('Failed to select image');
    }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update user profile with display name
      const user = await apiClient.getLoggedInUser();
      if (user) {
        const updatedUser = user.clone();
        updatedUser.displayName = displayName.trim();
        updatedUser.status = 'active';
        await apiClient.updateLoggedInUser(updatedUser);

        // Upload profile image if selected
        if (imageUri) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const buffer = new Uint8Array(await (blob as any).arrayBuffer());
          await apiClient.uploadUserImage(user.id ?? '', buffer, 'image/jpeg');
        }
      }

      // Navigation will automatically route to main flow
      // since the user now has displayName and community
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [displayName, imageUri, apiClient]);

  const buttonDisabled = !displayName.trim() || isLoading;

  return (
    <AvoidKeyboardScreen>
      <ScreenHeader title="Set Up Profile" showBack={true} />

      <View style={styles.content}>
        <Pressable onPress={pickImage} style={styles.avatarContainer}>
          <UserImage
            imageUrl={imageUri}
            displayName={displayName || '?'}
            size={100}
          />
          <View style={[styles.editBadge, { backgroundColor: theme.buttonColor }]}>
            <Text style={styles.editBadgeText}>+</Text>
          </View>
        </Pressable>

        <BodyRegular style={styles.photoHint}>Tap to add a photo</BodyRegular>

        <View style={styles.inputContainer}>
          <TitleMedium style={styles.label}>What should we call you?</TitleMedium>
          <TextInput
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setError(null);
            }}
            placeholder="Your name"
            placeholderTextColor={Colors.gray6}
            style={styles.textInput}
            autoCapitalize="words"
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={handleComplete}
          />
          <ErrorHint hint={error} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          style={[
            styles.button,
            { backgroundColor: buttonDisabled ? Colors.gray2 : theme.buttonColor },
          ]}
          onPress={handleComplete}
          disabled={buttonDisabled}
        >
          <Text
            style={[
              styles.buttonText,
              { color: buttonDisabled ? Colors.gray6 : theme.buttonText },
            ]}
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </Button>
      </View>
    </AvoidKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.black,
  },
  editBadgeText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  photoHint: {
    color: Colors.gray6,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    color: Colors.white,
    marginBottom: 12,
  },
  textInput: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
    backgroundColor: Colors.black,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
