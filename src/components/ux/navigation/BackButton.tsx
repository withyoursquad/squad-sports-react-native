import React, { useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Colors } from '../../../theme/ThemeContext';
import Button from '../buttons/Button';

export default function BackButton() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const handlePress = useCallback(() => navigation.goBack(), [navigation]);

  const color = theme.isDarkMode ? Colors.white : Colors.gray1;

  return (
    <Button onPress={handlePress} style={styles.button}>
      <Text style={[styles.chevron, { color }]}>{'<'}</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '600',
  },
});
