/**
 * SotdButton.tsx
 * Main SOTD button that shows locked/unlocked state.
 * Ported from squad-demo/src/components/SOTD/SotdButton.tsx
 */
import React, { useCallback } from 'react';
import SotdButtonUnlocked from './SotdButtonUnlocked';
import SotdButtonLocked from './SotdButtonLocked';

export type SotdButtonProps = {
  /** Whether the SOTD feature is unlocked for the user. */
  isUnlocked: boolean;
  /** Current SOTD user data, if any. */
  currentUser?: {
    id: string;
    displayName: string;
    imageUrl?: string;
  } | null;
  /** Called when the user taps the button (navigate to selection, etc.). */
  onPress: () => void;
  /** Called when a locked button is tapped. */
  onLockedPress?: () => void;
  /** Number of additional shifters needed to unlock. */
  shiftersNeeded?: number;
  /** Whether the initial animation should play. */
  shouldAnimate?: boolean;
  /** Called when the animation completes. */
  onAnimationComplete?: () => void;
};

export default function SotdButton({
  isUnlocked,
  currentUser,
  onPress,
  onLockedPress,
  shiftersNeeded = 3,
  shouldAnimate = false,
  onAnimationComplete,
}: SotdButtonProps) {
  if (isUnlocked) {
    return (
      <SotdButtonUnlocked
        currentUser={currentUser}
        onPress={onPress}
      />
    );
  }

  return (
    <SotdButtonLocked
      onPress={onLockedPress}
      shiftersNeeded={shiftersNeeded}
      shouldAnimate={shouldAnimate}
      onAnimationComplete={onAnimationComplete}
    />
  );
}
