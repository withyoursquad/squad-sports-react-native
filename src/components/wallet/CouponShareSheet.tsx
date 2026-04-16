/**
 * CouponShareSheet.tsx
 * Bottom sheet for share options (internal squad share vs external share).
 * Ported from squad-demo/src/components/wallet/CouponShareSheet.tsx
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleSmall, TitleTiny } from '../ux/text/Typography';

export type CouponShareSheetProps = {
  /** Called when a selection is made. */
  onSelect?: () => void;
  /** Called for external share (system share sheet). */
  onExternalShare?: () => void;
  /** Called for internal share (within Squad). */
  onInternalShare?: () => void;
  /** Called when the sheet should close. */
  onDismiss?: () => void;
};

export default function CouponShareSheet({
  onSelect,
  onExternalShare,
  onInternalShare,
  onDismiss,
}: CouponShareSheetProps) {
  const handleExternalShare = useCallback(() => {
    onDismiss?.();
    onExternalShare?.();
  }, [onExternalShare, onDismiss]);

  const handleInternalShare = useCallback(() => {
    onDismiss?.();
    onInternalShare?.();
  }, [onInternalShare, onDismiss]);

  return (
    <View style={styles.content}>
      <TitleSmall style={styles.title}>Share Code</TitleSmall>

      <View style={styles.divider} />

      <View style={styles.optionsContainer}>
        <Button style={styles.button} onPress={handleInternalShare}>
          <TitleTiny style={styles.description}>
            Share to 741 Shifter
          </TitleTiny>
        </Button>

        <Button style={styles.button} onPress={handleExternalShare}>
          <TitleTiny style={styles.description}>
            Share Outside the Lab
          </TitleTiny>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  description: {
    color: Colors.white,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.gray2,
    marginVertical: 24,
  },
  optionsContainer: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: Colors.white,
  },
});
