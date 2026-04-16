/**
 * Version upgrade dialog — soft-lock and hard-lock variants.
 * Ported from squad-demo/src/components/dialogs/VersionUpgradeDialog.tsx
 *
 * Soft-lock: "App Update Available" with dismiss option.
 * Hard-lock: "App Update Required" — no dismiss.
 */
import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import {
  TitleMedium,
  TitleTiny,
  BodyRegular,
} from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

const { height: DEVICE_HEIGHT } = Dimensions.get('window');

const DEFAULT_APP_URL = Platform.select({
  android:
    'https://play.google.com/store/apps/details?id=com.withyoursquad.app',
  ios: 'https://apps.apple.com/us/app/squad-fun-private-social/id1457056468',
  default: 'https://squadforsports.com',
});

export interface VersionUpgradeDialogProps {
  visible: boolean;
  /** If true the user cannot dismiss the dialog */
  hardLock?: boolean;
  /** Custom description text */
  description?: string;
  /** Custom store URL; defaults to Squad app store link */
  storeUrl?: string;
  /** Called when the user taps "Update" */
  onUpdate?: () => void;
  /** Called when the user dismisses (soft-lock only) */
  onDismiss?: () => void;
}

export default function VersionUpgradeDialog({
  visible,
  hardLock = false,
  description,
  storeUrl,
  onUpdate,
  onDismiss,
}: VersionUpgradeDialogProps) {
  if (!visible) return null;

  const overline = hardLock ? 'App Update Required' : 'App Update Available';
  const descriptionText =
    description ??
    (hardLock
      ? 'Squad requires that you update to the latest app version so you can continue to use the app.'
      : 'Squad recommends that you update to the latest version. You can keep using this app while downloading the update.');

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      Linking.openURL(storeUrl ?? DEFAULT_APP_URL ?? '');
    }
  };

  const content = (
    <View style={[styles.standardPadding, styles.column]}>
      <TitleTiny style={styles.overline}>{overline}</TitleTiny>
      <TitleMedium style={styles.title}>New Version Taking Lift Off</TitleMedium>
      <BodyRegular style={styles.description}>{descriptionText}</BodyRegular>
      <Button style={styles.buttonPrimary} onPress={handleUpdate}>
        <BodyRegular style={styles.buttonPrimaryText}>Update App</BodyRegular>
      </Button>
      {!hardLock && onDismiss && (
        <Button style={styles.buttonSecondary} onPress={onDismiss}>
          <BodyRegular style={styles.buttonSecondaryText}>
            Nah, not this time
          </BodyRegular>
        </Button>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        {hardLock ? (
          <View style={styles.fullscreen}>{content}</View>
        ) : (
          <View style={styles.bottomSheet}>{content}</View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  bottomSheet: {
    backgroundColor: Colors.gray1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  fullscreen: {
    backgroundColor: Colors.gray1,
    height: DEVICE_HEIGHT,
    justifyContent: 'center',
  },
  buttonPrimary: {
    alignItems: 'stretch',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  buttonPrimaryText: {
    color: Colors.black,
    textAlign: 'center',
  },
  buttonSecondary: {
    alignItems: 'stretch',
    padding: 16,
    width: '100%',
  },
  buttonSecondaryText: {
    color: Colors.gray10,
    textAlign: 'center',
  },
  column: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  description: {
    color: Colors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  overline: {
    color: Colors.purple1,
    marginBottom: 4,
  },
  standardPadding: {
    padding: 16,
  },
  title: {
    color: Colors.white,
    marginBottom: 24,
  },
});
