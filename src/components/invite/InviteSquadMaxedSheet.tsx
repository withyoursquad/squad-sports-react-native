/**
 * InviteSquadMaxedSheet - Bottom sheet: "You can only have up to 12 people in your Squad".
 * Ported from squad-demo/src/screens/invite/InviteSquadMaxedBottomSheet.tsx.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { TitleMedium, BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type InviteSquadMaxedSheetProps = {
  onConfirm: () => void;
};

export default function InviteSquadMaxedSheet({
  onConfirm,
}: InviteSquadMaxedSheetProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TitleMedium style={styles.title}>Whoa! Slow down a sec</TitleMedium>
      <BodyRegular style={styles.body}>
        {' '}
        You can only have{' '}
        <Text style={styles.highlightedText}>up to 12 people</Text> in your
        Squad. Remove someone to add a new friend to your Squad.
      </BodyRegular>

      <Button
        onPress={onConfirm}
        style={[
          styles.button,
          { backgroundColor: theme.buttonColor },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Cool, got it
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: Colors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    padding: 16,
  },
  highlightedText: {
    color: Colors.apricot,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
});
