import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useSquadSDK } from '../../SquadProvider';
import { Colors } from '../../theme/ThemeContext';
import { ErrorHint } from '../../components/ux/errors/ErrorHint';
import Button from '../../components/ux/buttons/Button';
import AvoidKeyboardScreen from '../../components/ux/layout/AvoidKeyboardScreen';
import { CodeInput } from '../../components/ux/inputs/CodeInput';
import { TitleRegular, BodyRegular } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EnterCode'>;
type Route = RouteProp<RootStackParamList, 'EnterCode'>;

export function EnterCodeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const sdk = useSquadSDK();
  const { height } = useWindowDimensions();
  const isShort = height < 700;

  const phone = route.params?.phone;
  const email = route.params?.email;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const COOLDOWN_SECONDS = 60;

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev: number) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const buttonDisabled = code.length !== 6 || isLoading;

  const verifyCode = useCallback(async (verificationCode?: string) => {
    const codeToVerify = verificationCode ?? code;
    if (codeToVerify.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.sessionManager.fulfillSession({
        phone,
        email,
        code: codeToVerify,
      });

      if (result.status === 'active') {
        // Session is active — navigator will automatically route to main/onboarding
        // based on user state. No manual navigation needed.
      } else {
        setError(result.error ?? 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error && err.message.includes('timed out')
        ? 'Request timed out. Please check your connection and try again.'
        : 'Invalid verification code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [code, phone, email, sdk]);

  const resendCode = useCallback(async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);
    setCode('');

    try {
      const result = await sdk.sessionManager.createSession({ phone, email });
      if (result.status !== 'pending') {
        setError('Failed to resend code. Please try again.');
      }
      startCooldown();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, email, sdk, resendCooldown, startCooldown]);

  return (
    <AvoidKeyboardScreen>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar} />
      </View>

      <View style={[styles.headerContainer, isShort && styles.headerContainerShort]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </Pressable>
      </View>

      <View style={[styles.container, isShort && styles.containerShort]}>
        <View style={styles.contentContainer}>
          <TitleRegular style={styles.title}>Enter Verification Code</TitleRegular>

          <View style={styles.codeContainer}>
            <CodeInput
              value={code}
              onChangeText={setCode}
              onComplete={verifyCode}
              length={6}
            />

            <Button style={styles.resendContainer} onPress={resendCode} disabled={resendCooldown > 0}>
              <BodyRegular style={styles.resendBody}>
                Didn't receive a code?
              </BodyRegular>
              <BodyRegular style={[styles.resendAction, resendCooldown > 0 && styles.resendDisabled]}>
                {resendCooldown > 0 ? ` Resend (${resendCooldown}s)` : ' Resend'}
              </BodyRegular>
            </Button>

            <ErrorHint hint={error} />
          </View>
        </View>

        <Button
          style={[styles.button, buttonDisabled && styles.buttonDisabled]}
          onPress={() => verifyCode()}
          disabled={buttonDisabled}
        >
          <Text style={[styles.buttonText, buttonDisabled && styles.buttonDisabledText]}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </Button>
      </View>
    </AvoidKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBar: {
    backgroundColor: Colors.white,
    height: 4,
    width: '16%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 46,
    marginTop: 24,
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
  contentContainer: {
    flex: 1,
  },
  title: {
    color: Colors.white,
    marginBottom: 24,
  },
  codeContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  resendBody: {
    color: Colors.gray6,
  },
  resendAction: {
    color: Colors.white,
    fontWeight: '500',
  },
  resendDisabled: {
    color: Colors.gray6,
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
});
