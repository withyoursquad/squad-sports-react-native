import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../buttons/Button';
import { Colors } from '../../../theme/ThemeContext';

interface LinkButtonProps {
  screen: string;
  params?: Record<string, unknown>;
  children: React.ReactNode;
  style?: object;
}

export default function LinkButton({ screen, params, children, style }: LinkButtonProps) {
  const navigation = useNavigation();
  return (
    <Button onPress={() => (navigation as any).navigate(screen, params)} style={style} accessibilityRole="link">
      {children}
    </Button>
  );
}
