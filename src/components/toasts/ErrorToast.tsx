/**
 * ErrorToast - Red/orange warning + message.
 * Ported from squad-demo/src/components/toasts/ErrorToast.tsx.
 */
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ErrorToastProps = {
  message: string;
  onPress?: () => void;
};

export default function ErrorToast({ message, onPress }: ErrorToastProps) {
  const content = (
    <>
      <View style={styles.containerBackground} />
      <View style={styles.toastContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.warningIcon}>!</Text>
        </View>
        <BodyMedium style={styles.message}>{message}</BodyMedium>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Button onPress={onPress} style={styles.container}>
        {content}
      </Button>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: SCREEN_WIDTH,
  },
  containerBackground: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.black,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    position: 'absolute',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.orange2,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  message: {
    color: Colors.white,
    marginLeft: 16,
    width: '90%',
  },
  toastContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(233, 120, 92, 0.15)',
    borderColor: Colors.orange1,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
    width: '100%',
  },
  warningIcon: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
