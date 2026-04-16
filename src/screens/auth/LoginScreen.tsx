/**
 * Phone-based login screen.
 * Ported from squad-demo/src/screens/LoginScreen.tsx.
 */
import React, { useCallback, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Linking, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useSquadSDK } from '../../SquadProvider';
import { Colors } from '../../theme/ThemeContext';
import Button from '../../components/ux/buttons/Button';
import { ErrorHint } from '../../components/ux/errors/ErrorHint';
import AvoidKeyboardScreen from '../../components/ux/layout/AvoidKeyboardScreen';
import { TitleRegular, BodyMedium, SubtitleSmall } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const sdk = useSquadSDK();
  const { height } = useWindowDimensions();
  const isShort = height < 700;

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValid = phone.replace(/\D/g, '').length >= 10;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.sessionManager.createSession({ phone });
      if (result.status === 'pending') {
        navigation.navigate('EnterCode', { phone });
      } else {
        setError('Failed to send verification code.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, isValid, isLoading, sdk, navigation]);

  return (
    <AvoidKeyboardScreen>
      <View style={[styles.headerContainer, isShort && styles.headerShort]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        <TitleRegular style={styles.title}>Enter Your Phone Number</TitleRegular>

        <View style={styles.inputRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+1</Text>
          </View>
          <TextInput
            ref={inputRef}
            value={phone}
            onChangeText={(t) => { setPhone(t); setError(null); }}
            onSubmitEditing={handleSubmit}
            placeholder="Phone number"
            placeholderTextColor={Colors.gray6}
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={15}
            accessibilityLabel="Phone number"
          />
        </View>

        <ErrorHint hint={error} />

        <View style={styles.footer}>
          <Button
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
          >
            <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
              {isLoading ? 'Sending...' : 'Send Code'}
            </Text>
          </Button>

          <BodyMedium style={styles.legal}>
            By tapping "Send Code" you agree to the{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://www.withyoursquad.com/terms')}>
              Terms & Conditions
            </Text>{' '}and{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://www.withyoursquad.com/privacy')}>
              Privacy Policy
            </Text>
          </BodyMedium>
        </View>
      </View>
    </AvoidKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  headerContainer: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 60, marginTop: 36 },
  headerShort: { marginBottom: 40, marginTop: 24 },
  backButton: { padding: 10 },
  backText: { fontSize: 24, color: Colors.white, fontWeight: '600' },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 16 },
  title: { color: Colors.white, marginBottom: 24 },
  inputRow: { flexDirection: 'row', borderWidth: 1, borderColor: Colors.gray5, borderRadius: 8, backgroundColor: Colors.black, overflow: 'hidden', marginBottom: 8 },
  countryCode: { paddingHorizontal: 16, paddingVertical: 16, borderRightWidth: 1, borderRightColor: Colors.gray5 },
  countryCodeText: { color: Colors.white, fontSize: 16, fontWeight: '500' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, color: Colors.white, fontSize: 16, fontWeight: '500' },
  footer: { marginTop: 'auto' },
  button: { height: 56, borderRadius: 8, backgroundColor: Colors.purple1, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: Colors.gray2 },
  buttonText: { color: Colors.gray1, fontSize: 16, fontWeight: '600' },
  buttonTextDisabled: { color: Colors.gray6 },
  legal: { color: Colors.gray6, marginTop: 16, textAlign: 'center' },
  legalLink: { color: Colors.purple1, fontWeight: '500' },
});
