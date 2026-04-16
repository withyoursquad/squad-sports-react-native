import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useSquadSDK } from '../../SquadProvider';
import { Colors } from '../../theme/ThemeContext';
import { ErrorHint } from '../../components/ux/errors/ErrorHint';
import Button from '../../components/ux/buttons/Button';
import AvoidKeyboardScreen from '../../components/ux/layout/AvoidKeyboardScreen';
import { TitleRegular, BodyMedium, SubtitleSmall } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EnterEmail'>;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EnterEmailScreen() {
  const navigation = useNavigation<Nav>();
  const sdk = useSquadSDK();
  const { height } = useWindowDimensions();
  const isShort = height < 700;

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const buttonDisabled = !email || !firstName || isLoading;

  const onChangeEmail = useCallback((value: string) => {
    setError(null);
    setEmail(value);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.sessionManager.createSession({
        email,
        firstName,
      });

      if (result.status === 'pending') {
        navigation.navigate('EnterCode', { email });
      } else {
        setError(result.error ?? 'Failed to send verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, firstName, sdk, navigation]);

  return (
    <AvoidKeyboardScreen>
      <View style={[styles.headerContainer, isShort && styles.headerContainerShort]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
      </View>

      <View style={[styles.container, isShort && styles.containerShort]}>
        <TitleRegular style={styles.title}>Create Your Account</TitleRegular>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={Colors.gray6}
              style={styles.textInput}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => inputRef.current?.focus()}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={email}
              onChangeText={onChangeEmail}
              onSubmitEditing={onSubmit}
              placeholder="Email address"
              placeholderTextColor={Colors.gray6}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
            />
          </View>
          <ErrorHint hint={error} />
        </View>

        <View style={styles.footerContainer}>
          <Button
            style={[styles.button, buttonDisabled && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={buttonDisabled}
          >
            <Text style={[styles.buttonText, buttonDisabled && styles.buttonDisabledText]}>
              {isLoading ? 'Sending...' : 'Send Code'}
            </Text>
          </Button>

          <BodyMedium style={styles.privacyText}>
            By tapping "Send Code" you agree to the{' '}
            <Text
              style={styles.privacyLink}
              onPress={() => Linking.openURL('https://www.withyoursquad.com/terms')}
            >
              Terms & Conditions
            </Text>
            {' '}and{' '}
            <Text
              style={styles.privacyLink}
              onPress={() => Linking.openURL('https://www.withyoursquad.com/privacy')}
            >
              Privacy Policy
            </Text>
          </BodyMedium>
        </View>
      </View>
    </AvoidKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 60,
    marginTop: 36,
  },
  headerContainerShort: {
    marginBottom: 40,
    marginTop: 24,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  containerShort: {
    paddingBottom: 8,
  },
  title: {
    color: Colors.white,
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
    backgroundColor: Colors.black,
  },
  footerContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.gray2,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.gray1,
    fontWeight: '600',
  },
  buttonDisabledText: {
    color: Colors.gray6,
  },
  privacyText: {
    color: Colors.gray6,
    marginTop: 16,
    textAlign: 'center',
  },
  privacyLink: {
    color: Colors.purple1,
    fontWeight: '500',
  },
});
