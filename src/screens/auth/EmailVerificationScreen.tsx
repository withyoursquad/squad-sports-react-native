import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useSquadSDK } from '../../SquadProvider';
import { Colors } from '../../theme/ThemeContext';
import Button from '../../components/ux/buttons/Button';
import { TitleRegular, BodyRegular, BodyMedium } from '../../components/ux/text/Typography';

export function EmailVerificationScreen() {
  const navigation = useNavigation();
  const sdk = useSquadSDK();
  const [status, setStatus] = useState<'waiting' | 'checking' | 'error'>('waiting');
  const [error, setError] = useState<string | null>(null);

  // Poll for email verification (magic link flow)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5s intervals

    const checkVerification = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setStatus('error');
        setError('Verification timed out. Please try again.');
        return;
      }

      try {
        const isValid = await sdk.sessionManager.validateSession();
        if (isValid) {
          clearInterval(interval);
          // Session validated — navigator will handle routing
        }
      } catch {
        // Keep polling
      }
    };

    interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [sdk]);

  const resendEmail = useCallback(async () => {
    setStatus('waiting');
    setError(null);
    // Re-trigger the session creation
    // The SDK will handle sending another verification email
  }, []);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>@</Text>
        </View>

        <TitleRegular style={styles.title}>Check Your Email</TitleRegular>

        <BodyRegular style={styles.subtitle}>
          We sent a verification link to your email address. Tap the link to continue.
        </BodyRegular>

        {status === 'waiting' && (
          <View style={styles.waitingContainer}>
            <ActivityIndicator color={Colors.purple1} size="small" />
            <BodyMedium style={styles.waitingText}>
              Waiting for verification...
            </BodyMedium>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button style={styles.resendButton} onPress={resendEmail}>
          <BodyRegular style={styles.resendText}>
            Didn't receive the email?{' '}
            <Text style={styles.resendAction}>Resend</Text>
          </BodyRegular>
        </Button>

        <Button
          style={styles.codeButton}
          onPress={() => navigation.goBack()}
        >
          <BodyRegular style={styles.codeButtonText}>
            Use verification code instead
          </BodyRegular>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 10,
    marginTop: 60,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.purple1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.gray6,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 32,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingText: {
    color: Colors.gray6,
  },
  errorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(233, 120, 92, 0.14)',
    borderRadius: 8,
  },
  errorText: {
    color: Colors.orange1,
    fontSize: 14,
  },
  footer: {
    paddingBottom: 32,
    gap: 16,
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: Colors.gray6,
  },
  resendAction: {
    color: Colors.white,
    fontWeight: '500',
  },
  codeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
  },
  codeButtonText: {
    color: Colors.white,
  },
});
