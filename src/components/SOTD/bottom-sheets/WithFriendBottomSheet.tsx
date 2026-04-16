/**
 * WithFriendBottomSheet.tsx
 * Shown when a friend has been selected as SOTD.
 * Ported from squad-demo/src/components/SOTD/WithFriendBottomSheet.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import UserImage from '../../ux/user-image/UserImage';
import {
  BodyRegular,
  ButtonLarge,
  TitleMedium,
} from '../../ux/text/Typography';

export type SOTDWithFriendBottomSheetProps = {
  /** The selected SOTD user. */
  squaddy: {
    id: string;
    displayName: string;
    imageUrl?: string;
  };
  /** Called when "Hit up" is pressed. */
  onHitUp: () => void;
  /** Called when the sheet is dismissed. */
  onDismiss?: () => void;
};

export default function SOTDWithFriendBottomSheet({
  squaddy,
  onHitUp,
  onDismiss,
}: SOTDWithFriendBottomSheetProps) {
  return (
    <View style={styles.container}>
      <TitleMedium style={styles.title}>Squaddie of the Day</TitleMedium>
      <BodyRegular style={styles.subtitle}>
        Message {squaddy.displayName} to grow your friendship
      </BodyRegular>

      <View style={styles.avatarContainer}>
        <View style={styles.hexagonFrame}>
          <UserImage
            imageUrl={squaddy.imageUrl}
            displayName={squaddy.displayName}
            size={100}
          />
        </View>
      </View>

      {/* Shadow indicator */}
      <View style={styles.shadow} />

      <TitleMedium style={styles.userName}>{squaddy.displayName}</TitleMedium>

      <BodyRegular style={styles.description}>
        You have 24hrs to hit them up so you can meet the challenge.
      </BodyRegular>

      <Button style={styles.button} onPress={onHitUp}>
        <View style={styles.buttonContent}>
          <View style={styles.micIcon}>
            <View style={styles.micBody} />
            <View style={styles.micBase} />
          </View>
          <ButtonLarge style={styles.buttonText}>
            Hit up {squaddy.displayName}
          </ButtonLarge>
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 6,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.gray1,
    marginLeft: 8,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  description: {
    color: Colors.gray6,
    textAlign: 'center',
  },
  hexagonFrame: {
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: Colors.gold,
    borderRadius: 54,
    overflow: 'hidden',
  },
  micIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBody: {
    width: 10,
    height: 14,
    backgroundColor: Colors.gray1,
    borderRadius: 5,
  },
  micBase: {
    width: 14,
    height: 3,
    backgroundColor: Colors.gray1,
    borderRadius: 1.5,
    marginTop: 2,
  },
  shadow: {
    width: 80,
    height: 30,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ scaleY: 0.3 }],
  },
  subtitle: {
    color: Colors.gray6,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
  },
  userName: {
    color: Colors.white,
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
