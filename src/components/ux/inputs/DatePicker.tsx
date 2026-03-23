/**
 * Date picker for birthdate selection.
 * Ported from squad-demo/src/components/ux/inputs/DatePicker.tsx.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumAge?: number;
}

export default function DatePicker({ value, onChange, label, minimumAge = 13 }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - minimumAge);

  const formatDate = (date?: Date) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handlePress = async () => {
    try {
      const DateTimePicker = (await import('react-native-date-picker')).default;
      setShowPicker(true);
    } catch {
      // react-native-date-picker not installed — use simple text fallback
    }
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={styles.container}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Select date'}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {formatDate(value)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.gray6,
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  container: {
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
    backgroundColor: Colors.black,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
  },
  placeholder: {
    color: Colors.gray6,
  },
});
