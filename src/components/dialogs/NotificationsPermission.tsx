/**
 * Push notifications permission request dialog.
 * Ported from squad-demo/src/components/dialogs/NotificationsPermission.tsx
 *
 * "Get Notified When Your Friends Reach Out"
 * Accept/decline footer (not just continue).
 */
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import { dialogStyles } from './DialogStyles';

export interface NotificationsPermissionProps {
  visible: boolean;
  onAllow: () => void | Promise<void>;
  onDeny: () => void | Promise<void>;
}

const TITLE = 'Get Notified When Your Friends Reach Out';
const BODY =
  'Enable push notifications so you don\'t miss anything your friends are trying to tell you. All messages expire in 24-48 hours.';

export default function NotificationsPermission({
  visible,
  onAllow,
  onDeny,
}: NotificationsPermissionProps) {
  const [working, setWorking] = useState(false);

  const handleAllow = useCallback(async () => {
    setWorking(true);
    try {
      await onAllow();
    } finally {
      setWorking(false);
    }
  }, [onAllow]);

  const handleDeny = useCallback(async () => {
    setWorking(true);
    try {
      await onDeny();
    } finally {
      setWorking(false);
    }
  }, [onDeny]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TitleSmall style={styles.title}>{TITLE}</TitleSmall>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>N</Text>
          </View>
          <BodyMedium style={styles.body}>{BODY}</BodyMedium>
          <View style={styles.buttons}>
            <Button
              disabled={working}
              disabledStyle={styles.buttonLeftDisabled}
              style={[styles.button, styles.buttonLeft]}
              onPress={handleDeny}
            >
              <Text style={styles.buttonLeftText}>Nah, I'm good</Text>
            </Button>
            <Button
              disabled={working}
              disabledStyle={styles.buttonRightDisabled}
              style={[styles.button, styles.buttonRight]}
              onPress={handleAllow}
            >
              <Text style={styles.buttonRightText}>Yea, for sure</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ...dialogStyles,
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
});
