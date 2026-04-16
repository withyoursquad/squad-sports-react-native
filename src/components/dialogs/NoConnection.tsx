/**
 * No internet connection dialog.
 * Ported from squad-demo/src/components/dialogs/NoConnection.tsx
 *
 * Full-screen "No Connection" message with refresh button.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export interface NoConnectionProps {
  visible: boolean;
  onRefresh: () => void | Promise<void>;
}

export default function NoConnection({
  visible,
  onRefresh,
}: NoConnectionProps) {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    onRefresh();

    // Visual feedback for the refresh action
    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
    }, 1000);
    setTimer(t);
  }, [onRefresh]);

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.container}>
        <View style={styles.body}>
          <TitleSmall style={styles.title}>No Connection</TitleSmall>
          <BodyMedium style={styles.description}>
            Check your internet connection or tap 'Refresh' to load this page
          </BodyMedium>
        </View>
        <Button style={styles.purpleButton} onPress={refresh}>
          <Text style={styles.purpleButtonText}>Refresh</Text>
        </Button>
      </View>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.white} />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 24,
  },
  container: {
    backgroundColor: Colors.black,
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  description: {
    color: Colors.white,
    marginTop: 24,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: Colors.black,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    opacity: 0.8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  purpleButton: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  purpleButtonText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    marginBottom: 24,
  },
});
