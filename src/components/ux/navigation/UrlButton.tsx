import React from 'react';
import { Text, StyleSheet, Linking, Pressable } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface UrlButtonProps {
  url: string;
  children: React.ReactNode;
  style?: object;
}

export default function UrlButton({ url, children, style }: UrlButtonProps) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} style={style} accessibilityRole="link">
      {children}
    </Pressable>
  );
}

export function UrlButtonInline({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <Text onPress={() => Linking.openURL(url)} accessibilityRole="link">
      {children}
    </Text>
  );
}
