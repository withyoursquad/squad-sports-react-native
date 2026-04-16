/**
 * BusyToast - Loading spinner + message.
 * Ported from squad-demo/src/components/toasts/BusyToast.tsx.
 */
import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyMedium } from '../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type BusyToastProps = {
  message: string;
};

export default function BusyToast({ message }: BusyToastProps) {
  return (
    <View style={styles.container}>
      <View style={styles.containerBackground} />
      <View style={styles.toastContent}>
        <ActivityIndicator size="small" color={Colors.purple1} />
        <BodyMedium style={styles.message}>{message}</BodyMedium>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: SCREEN_WIDTH,
  },
  containerBackground: {
    alignSelf: 'center',
    backgroundColor: Colors.black,
    borderRadius: 16,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  message: {
    color: Colors.white,
    marginLeft: 16,
  },
  toastContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(110, 130, 231, 0.15)',
    borderColor: Colors.purple1,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
    width: '100%',
  },
});
