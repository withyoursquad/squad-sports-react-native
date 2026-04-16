/**
 * Progress / milestone congratulation dialog.
 * Ported from squad-demo/src/components/dialogs/ProgressCongratulation.tsx
 *
 * Celebration dialog with animated confetti, avatar circle,
 * milestone title, info text, and dismiss button.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular, ButtonLarge } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

/** Milestone types the host app can trigger */
export enum MilestoneType {
  firstMessage = 'firstMessage',
  firstFreestyle = 'firstFreestyle',
  firstPoll = 'firstPoll',
  firstSOTD = 'firstSOTD',
  firstSquaddie = 'firstSquaddie',
  firstFriendInvite = 'firstFriendInvite',
}

type MilestoneMetadata = {
  defaultTitle: string;
  defaultInfo: string;
};

const MILESTONES: Record<MilestoneType, MilestoneMetadata> = {
  [MilestoneType.firstMessage]: {
    defaultTitle: 'You Broke the Ice',
    defaultInfo:
      'First message sent. Conversations build chemistry. Chemistry builds culture. Keep it moving.',
  },
  [MilestoneType.firstFreestyle]: {
    defaultTitle: 'Freestyle Activated',
    defaultInfo:
      'Your first freestyle is live. Shifters create, not just consume. Keep showing up.',
  },
  [MilestoneType.firstPoll]: {
    defaultTitle: 'First Vote In',
    defaultInfo:
      "You answered your first poll. Shifters don't scroll -- they decide. Stay active.",
  },
  [MilestoneType.firstSOTD]: {
    defaultTitle: 'Squaddie of the Day!',
    defaultInfo:
      'Reaching out to your friends just got easier.',
  },
  [MilestoneType.firstSquaddie]: {
    defaultTitle: 'Circle Strengthened',
    defaultInfo:
      'A Shifter joined your circle. Strong circles elevate standards. Keep building with purpose.',
  },
  [MilestoneType.firstFriendInvite]: {
    defaultTitle: 'Circle Expanded',
    defaultInfo:
      'You invited a Shifter into your circle. Alignment matters. Build it intentionally.',
  },
};

export interface ProgressCongratulationProps {
  visible: boolean;
  milestoneType?: MilestoneType;
  title?: string;
  info?: string;
  profileImageUrl?: string;
  onDismiss: () => void;
}

export default function ProgressCongratulation({
  visible,
  milestoneType,
  title,
  info,
  profileImageUrl,
  onDismiss,
}: ProgressCongratulationProps) {
  if (!visible) return null;

  const metadata = milestoneType ? MILESTONES[milestoneType] : undefined;
  const displayTitle = title ?? metadata?.defaultTitle ?? 'Congratulations!';
  const displayInfo = info ?? metadata?.defaultInfo ?? '';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ProgressCongratulationContent
          title={displayTitle}
          info={displayInfo}
          profileImageUrl={profileImageUrl}
          onDismiss={onDismiss}
        />
      </View>
    </Modal>
  );
}

interface ContentProps {
  title: string;
  info: string;
  profileImageUrl?: string;
  onDismiss: () => void;
}

function ProgressCongratulationContent({
  title,
  info,
  profileImageUrl,
  onDismiss,
}: ContentProps) {
  return (
    <View style={styles.wrapper}>
      <ProgressCongratulationAnimation />
      <View style={styles.circle}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.starIcon}>*</Text>
        )}
      </View>

      <View style={styles.container}>
        <View style={styles.gradientContainer} />
        <TitleSmall style={styles.infoLabel}>{title}</TitleSmall>
        <BodyRegular style={styles.infoText}>{info}</BodyRegular>
        <Button style={styles.dismissButton} onPress={onDismiss}>
          <ButtonLarge style={styles.buttonText}>Bet, got it</ButtonLarge>
        </Button>
      </View>
    </View>
  );
}

function ProgressCongratulationAnimation() {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.animatedView,
        { opacity: animatedValue },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  animatedView: {
    bottom: '65%',
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -72,
    zIndex: 10,
  },
  buttonText: {
    color: Colors.gray1,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    top: 36,
    zIndex: 10,
    borderWidth: 2,
    borderColor: Colors.white,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  starIcon: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    width: DEVICE_WIDTH - 32,
    zIndex: 0,
    backgroundColor: Colors.gray1,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: Colors.gray12,
  },
  dismissButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  infoLabel: {
    color: Colors.white,
    marginBottom: 16,
    paddingTop: 44,
  },
  infoText: {
    color: Colors.white,
    marginBottom: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
