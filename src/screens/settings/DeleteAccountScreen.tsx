import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useSquadSDK, useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodyMedium, BodySmall } from '../../components/ux/text/Typography';

const REASONS = [
  { id: 'not_useful', label: "It's not useful to me" },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'too_many_notifications', label: 'Too many notifications' },
  { id: 'found_alternative', label: 'Found an alternative' },
  { id: 'other', label: 'Other' },
];

export function DeleteAccountScreen() {
  const navigation = useNavigation();
  const sdk = useSquadSDK();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const { UserDeletionRequestBody } = await import('@squad-sports/core');
      await apiClient.requestAccountDeletion(
        new UserDeletionRequestBody({
          reason: (selectedReason === 'other' ? otherText : selectedReason ?? '') as any,
        }),
      );
      await sdk.sessionManager.logout();
      // Navigator will route to auth
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  }, [selectedReason, otherText, apiClient, sdk]);

  const handleContinue = useCallback(() => {
    if (!selectedReason) return;

    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all your messages, freestyles, and connections. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete My Account', style: 'destructive', onPress: handleDelete },
      ],
    );
  }, [selectedReason, handleDelete]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Delete Account" />

      <View style={styles.content}>
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>{'!'}</Text>
          <BodyMedium style={styles.warningText}>
            This action is permanent and cannot be undone
          </BodyMedium>
        </View>

        <TitleMedium style={styles.heading}>
          We're sorry to see you go
        </TitleMedium>
        <BodyRegular style={styles.subtitle}>
          Please tell us why you're leaving so we can improve
        </BodyRegular>

        <View style={styles.reasons}>
          {REASONS.map(reason => (
            <Pressable
              key={reason.id}
              style={[
                styles.reasonRow,
                selectedReason === reason.id && [styles.reasonRowSelected, { borderColor: Colors.red }],
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View style={[
                styles.radio,
                selectedReason === reason.id && styles.radioSelected,
              ]}>
                {selectedReason === reason.id && <View style={styles.radioDot} />}
              </View>
              <BodyRegular style={styles.reasonText}>{reason.label}</BodyRegular>
            </Pressable>
          ))}
        </View>

        {selectedReason === 'other' && (
          <TextInput
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Tell us more..."
            placeholderTextColor={Colors.gray6}
            style={styles.otherInput}
            multiline
            maxLength={200}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          style={[styles.deleteButton, { opacity: selectedReason ? 1 : 0.5 }]}
          onPress={handleContinue}
          disabled={!selectedReason || isDeleting}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </Text>
        </Button>

        <Button style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Keep My Account</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255, 68, 120, 0.1)',
    borderRadius: 8, padding: 12, marginBottom: 24,
  },
  warningIcon: { color: Colors.red, fontSize: 18, fontWeight: '700' },
  warningText: { color: Colors.red, flex: 1 },
  heading: { color: Colors.white, marginBottom: 8 },
  subtitle: { color: Colors.gray6, marginBottom: 24 },
  reasons: { gap: 8 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, backgroundColor: Colors.gray2, borderRadius: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  reasonRowSelected: { backgroundColor: 'rgba(255, 68, 120, 0.05)' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.gray5,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: Colors.red },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.red },
  reasonText: { color: Colors.white, flex: 1 },
  otherInput: {
    marginTop: 12, color: Colors.white, fontSize: 14,
    backgroundColor: Colors.gray2, borderRadius: 8,
    padding: 16, minHeight: 80, textAlignVertical: 'top',
  },
  footer: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  deleteButton: {
    height: 56, borderRadius: 28, backgroundColor: Colors.red,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  cancelButton: {
    height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  cancelButtonText: { color: Colors.gray6, fontSize: 15 },
});
