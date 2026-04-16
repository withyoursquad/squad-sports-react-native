/**
 * ContactsSectionHeader - Alphabetical section header (A, B, C...).
 * Ported from squad-demo/src/screens/invite/ContactsSectionHeader.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleTiny } from '../ux/text/Typography';

export type ContactsSectionHeaderProps = {
  title: string;
};

export default function ContactsSectionHeader({ title }: ContactsSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <TitleTiny style={styles.title}>{title}</TitleTiny>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginTop: 24,
    width: 32,
  },
  title: {
    color: Colors.white,
  },
});
