import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface ErrorHintProps {
  hint?: string | null;
  error?: { name: string; message: string } | null;
  onDismiss?: () => void;
}

export function ErrorHint({ hint, error, onDismiss }: ErrorHintProps) {
  if (!hint && !error) return null;

  const message = hint ?? error?.message;

  return (
    <Pressable onPress={onDismiss} style={styles.container}>
      <View style={styles.indicator} />
      <Text style={styles.text}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(233, 120, 92, 0.14)',
    borderRadius: 8,
  },
  indicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: Colors.orange1,
    marginRight: 8,
  },
  text: {
    color: Colors.orange1,
    fontSize: 14,
    flex: 1,
  },
});
