/**
 * Phone Number Entry Screen — alternative auth path alongside email.
 * Ported from squad-demo/src/screens/EnterPhoneNumber.tsx.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useSquadSDK } from '../../SquadProvider';
import { Colors } from '../../theme/ThemeContext';
import { ErrorHint } from '../../components/ux/errors/ErrorHint';
import { PhoneNumberInput } from '../../components/ux/inputs/PhoneNumberInput';
import Button from '../../components/ux/buttons/Button';
import AvoidKeyboardScreen from '../../components/ux/layout/AvoidKeyboardScreen';
import { TitleRegular, BodyMedium, SubtitleSmall } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EnterPhone'>;

export function EnterPhoneScreen() {
  const navigation = useNavigation<Nav>();
  const sdk = useSquadSDK();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = phone.length >= 10;

  const onChangePhone = useCallback((value: string) => {
    setError(null);
    setPhone(value);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+1${phone}`;
      const success = await sdk.sessionManager.createSession({ phone: fullPhone });
      if (success) {
        navigation.navigate('EnterCode', { phone: fullPhone });
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, isValid, sdk, navigation]);

  return (
    <AvoidKeyboardScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <TitleRegular style={styles.title}>Enter Your Phone Number</TitleRegular>

          <PhoneNumberInput
            value={phone}
            onChangeText={onChangePhone}
            onSubmitEditing={onSubmit}
          />

          {error && (
            <ErrorHint hint={error} onDismiss={() => setError(null)} />
          )}
        </View>

        <View style={styles.footer}>
          <Button
            style={[
              styles.submitButton,
              { backgroundColor: isValid && !isLoading ? Colors.purple1 : Colors.gray2 },
            ]}
            onPress={onSubmit}
            disabled={!isValid || isLoading}
          >
            <Text
              style={[
                styles.submitText,
                { color: isValid && !isLoading ? Colors.gray1 : Colors.gray6 },
              ]}
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </Text>
          </Button>

          <BodyMedium style={styles.legalText}>
            By tapping "Send Code" you agree to the{' '}
            <SubtitleSmall
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://www.withyoursquad.com/terms')}
            >
              Terms & Conditions
            </SubtitleSmall>
            {' '}and{' '}
            <SubtitleSmall
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://www.withyoursquad.com/privacy')}
            >
              Privacy Policy
            </SubtitleSmall>
          </BodyMedium>
        </View>
      </View>
    </AvoidKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.gray9,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    color: Colors.white,
    marginBottom: 16,
  },
  footer: {
    paddingTop: 24,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  legalText: {
    color: Colors.gray6,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: Colors.purple1,
  },
});
