/**
 * SuccessToast - Green/themed checkmark + message.
 * Ported from squad-demo/src/components/toasts/SuccessToast.tsx.
 */
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyMedium } from '../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SuccessToastProps = {
  message: string;
};

export default function SuccessToast({ message }: SuccessToastProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.toastContent, { borderColor: theme.primaryColor }]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.primaryColor },
          ]}
        >
          <Text style={styles.checkmark}>{'\u2713'}</Text>
        </View>
        <BodyMedium style={styles.message}>{message}</BodyMedium>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    paddingHorizontal: 8,
    width: SCREEN_WIDTH,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  message: {
    color: Colors.gray1,
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 16,
  },
  toastContent: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.purple1,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
});
