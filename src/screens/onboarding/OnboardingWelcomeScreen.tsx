import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useTheme, Colors } from '../../theme/ThemeContext';
import Button from '../../components/ux/buttons/Button';
import { TitleRegular, BodyRegular } from '../../components/ux/text/Typography';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <View style={styles.content}>
        <View style={[styles.circle, { borderColor: theme.buttonColor }]}>
          <Text style={styles.circleEmoji}>{'\\uD83C\\uDFC8'}</Text>
        </View>

        <TitleRegular style={styles.title}>
          Welcome to Squad
        </TitleRegular>

        <BodyRegular style={styles.subtitle}>
          Connect with your squad, share freestyles, and experience sports together.
        </BodyRegular>
      </View>

      <View style={styles.footer}>
        <Button
          style={[styles.button, { backgroundColor: theme.buttonColor }]}
          onPress={() => navigation.navigate('OnboardingTeamSelect')}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Get Started
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  circleEmoji: {
    fontSize: 48,
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.gray6,
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: {
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
