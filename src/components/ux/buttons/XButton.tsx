import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Button from './Button';
import { Colors } from '../../../theme/ThemeContext';

interface XButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export default function XButton({ onPress, color = Colors.white, size = 24 }: XButtonProps) {
  return (
    <Button onPress={onPress} style={styles.button}>
      <Text style={[styles.text, { color, fontSize: size }]}>x</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  text: {
    fontWeight: '300',
  },
});
