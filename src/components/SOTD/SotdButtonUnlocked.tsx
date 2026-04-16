/**
 * SotdButtonUnlocked.tsx
 * Unlocked state: pulsing animation, community color, trophy icon.
 * Ported from squad-demo/src/components/SOTD/SotdButton_unlocked.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CurrentSotdUser from './CurrentSotdUser';
import NoCurrentSotdUser from './NoCurrentSotdUser';

export type SotdButtonUnlockedProps = {
  /** Current SOTD user data, if any. */
  currentUser?: {
    id: string;
    displayName: string;
    imageUrl?: string;
  } | null;
  /** Called when the button is pressed. */
  onPress: () => void;
};

export default function SotdButtonUnlocked({
  currentUser,
  onPress,
}: SotdButtonUnlockedProps) {
  if (currentUser) {
    return (
      <CurrentSotdUser
        onPress={onPress}
        style={styles.container}
        displayName={currentUser.displayName}
        imageUrl={currentUser.imageUrl}
      />
    );
  }

  return (
    <NoCurrentSotdUser
      style={styles.container}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '40%',
  },
});
