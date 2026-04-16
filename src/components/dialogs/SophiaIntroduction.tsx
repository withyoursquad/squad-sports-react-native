/**
 * Sophia AI assistant introduction dialog (bottom-sheet style).
 * Ported from squad-demo/src/components/dialogs/SophiaIntroduction.tsx
 *
 * Shows Sophia's avatar, intro message, accept/decline buttons.
 */
import React from 'react';
import { Modal, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import {
  TitleSmall,
  TitleTiny,
  BodyRegular,
  BodySmall,
  ButtonLarge,
} from '../ux/text/Typography';
import UserImage from '../ux/user-image/UserImage';
import Button from '../ux/buttons/Button';

export interface SophiaIntroductionProps {
  visible: boolean;
  userName?: string;
  sophiaDisplayName?: string;
  sophiaImageUrl?: string;
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
}

export default function SophiaIntroduction({
  visible,
  userName,
  sophiaDisplayName = 'Sophia',
  sophiaImageUrl,
  onAccept,
  onDecline,
}: SophiaIntroductionProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TitleSmall style={styles.title}>
            Hey {userName ?? 'there'}
          </TitleSmall>
          <View style={styles.sophiaContainer}>
            <UserImage
              imageUrl={sophiaImageUrl}
              displayName={sophiaDisplayName}
              size={88}
            />
            <TitleTiny style={styles.sophiaTitle}>
              {sophiaDisplayName}
            </TitleTiny>
            <BodySmall style={styles.sophiaDetail}>from Squad</BodySmall>
          </View>
          <BodyRegular style={styles.textContent}>
            Accept my friend request so I can show you how to use Squad.
          </BodyRegular>
          <View style={styles.buttonsContainer}>
            <Button onPress={onDecline} style={styles.declineButton}>
              <ButtonLarge style={styles.declineText}>Ignore</ButtonLarge>
            </Button>
            <Button onPress={onAccept} style={styles.acceptButton}>
              <ButtonLarge style={styles.acceptText}>Accept</ButtonLarge>
            </Button>
          </View>
        </View>
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
  acceptButton: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    height: 56,
    justifyContent: 'center',
    marginLeft: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptText: {
    color: Colors.gray1,
    marginLeft: 8,
  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  declineText: {
    color: Colors.white,
    marginLeft: 8,
  },
  sophiaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  sophiaDetail: {
    color: Colors.gray6,
  },
  sophiaTitle: {
    color: Colors.white,
    marginTop: 8,
  },
  textContent: {
    color: Colors.white,
    marginVertical: 24,
    textAlign: 'center',
    width: '100%',
  },
  title: {
    color: Colors.white,
    marginTop: 24,
  },
});
