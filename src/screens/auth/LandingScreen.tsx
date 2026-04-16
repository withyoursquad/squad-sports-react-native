import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useTheme } from '../../theme/ThemeContext';

type LandingNavProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export function LandingScreen() {
  const navigation = useNavigation<LandingNavProp>();
  const { theme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>
          Squad Sports
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray6 }]}>
          Connect with your squad
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonColor }]}
          onPress={() => navigation.navigate('EnterEmail')}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton]}
          onPress={() => navigation.navigate('EnterEmail')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.white }]}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  buttons: {
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
  },
});
