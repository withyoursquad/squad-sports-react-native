import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../buttons/Button';
import { TitleSmall, BodyRegular } from '../text/Typography';

interface PermissionsCTAContentProps {
  icon?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  onAllow?: () => void;
  isDenied?: boolean;
}

export default function PermissionsCTAContent({
  icon,
  title,
  description,
  buttonLabel = 'Allow',
  onAllow,
  isDenied = false,
}: PermissionsCTAContentProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      )}
      <TitleSmall style={styles.title}>{title}</TitleSmall>
      <BodyRegular style={styles.description}>{description}</BodyRegular>
      <Button
        style={styles.button}
        onPress={isDenied ? () => Linking.openSettings() : onAllow}
        accessibilityLabel={isDenied ? 'Open Settings' : buttonLabel}
      >
        <Text style={styles.buttonText}>
          {isDenied ? 'Open Settings' : buttonLabel}
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.purple1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  icon: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  title: { color: Colors.white, marginBottom: 8, textAlign: 'center' },
  description: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, backgroundColor: Colors.purple1 },
  buttonText: { color: Colors.gray1, fontWeight: '600', fontSize: 15 },
});
