import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Button from './Button';
import { Colors } from '../../../theme/ThemeContext';

interface InfoButtonProps {
  onPress: () => void;
  size?: number;
}

export default function InfoButton({ onPress, size = 20 }: InfoButtonProps) {
  return (
    <Button onPress={onPress} accessibilityLabel="More information">
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.text, { fontSize: size * 0.6 }]}>i</Text>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1.5, borderColor: Colors.gray6, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.gray6, fontWeight: '600', fontStyle: 'italic' },
});
