/**
 * Email collection dialog.
 * Ported from squad-demo/src/components/dialogs/CollectEmail.tsx
 *
 * "Get Exclusive Updates" — email input with validation, community branding.
 */
import React, { useCallback, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import {
  TitleMedium,
  TitleTiny,
  BodyRegular,
  BodySmall,
  ButtonLarge,
} from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export interface CollectEmailProps {
  visible: boolean;
  communityName?: string;
  communityImageUrl?: string;
  onSubmit: (email: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function CollectEmail({
  visible,
  communityName = 'My Shifters',
  communityImageUrl,
  onSubmit,
  onCancel,
}: CollectEmailProps) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  const handleSubmit = useCallback(async () => {
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }
    setIsValidEmail(true);
    await onSubmit(email);
  }, [email, onSubmit]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'padding'}
        style={styles.keyboardView}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TitleTiny style={styles.overline}>
              Get Exclusive Updates From
            </TitleTiny>
            <TitleMedium style={styles.communityName}>
              {communityName}
            </TitleMedium>
            {communityImageUrl && (
              <View style={styles.imageContainer}>
                {/* Community image placeholder */}
              </View>
            )}
            <BodyRegular style={styles.description}>
              Add your email to get exclusive updates from {communityName} and
              more
            </BodyRegular>
            <RNTextInput
              value={email}
              onChangeText={setEmail}
              maxLength={30}
              style={isValidEmail ? styles.input : styles.errorInput}
              placeholder="Email Address"
              placeholderTextColor={Colors.gray6}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {!isValidEmail && (
              <BodySmall style={styles.errorCode}>
                Please enter a valid email address
              </BodySmall>
            )}
            <Button
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={!email.length}
              disabledStyle={styles.disabledButton}
            >
              <ButtonLarge
                style={
                  email.length
                    ? styles.enabledButtonText
                    : styles.disabledButtonText
                }
              >
                Sign up
              </ButtonLarge>
            </Button>
            <Button onPress={onCancel}>
              <ButtonLarge style={styles.buttonDeclineText}>
                Nah, maybe next time
              </ButtonLarge>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: dialogStyles.overlay,
  modal: {
    ...dialogStyles.modal,
  },
  overline: {
    alignSelf: 'center',
    color: Colors.purple1,
  },
  communityName: {
    alignSelf: 'center',
    color: Colors.white,
    marginVertical: 16,
    textAlign: 'center',
  },
  description: {
    alignSelf: 'center',
    color: Colors.gray6,
    marginBottom: 26,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: Colors.white,
    borderWidth: 2,
    borderRadius: 44,
    width: 88,
    height: 88,
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    borderColor: Colors.gray2,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.white,
    fontSize: 14,
    minHeight: 56,
    paddingHorizontal: 15,
  },
  errorInput: {
    borderColor: Colors.orange2,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.white,
    fontSize: 14,
    minHeight: 56,
    paddingHorizontal: 15,
  },
  errorCode: {
    color: Colors.orange2,
    marginTop: 8,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 26,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: Colors.gray2,
  },
  disabledButtonText: {
    color: Colors.gray6,
    fontSize: 15,
    fontWeight: '600',
  },
  enabledButtonText: {
    color: Colors.gray1,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDeclineText: {
    alignSelf: 'center',
    color: Colors.gray6,
    textAlign: 'center',
  },
});
