import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (code: string) => void;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

export function CodeInput({
  length = 6,
  value,
  onChangeText,
  onComplete,
  style,
  autoFocus = true,
}: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
      onChangeText(cleaned);
      if (cleaned.length === length) {
        onComplete?.(cleaned);
      }
    },
    [length, onChangeText, onComplete],
  );

  const digits = value.padEnd(length, '').split('');

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
      />
      <View style={styles.digits}>
        {digits.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.digitBox,
              index < value.length && styles.digitBoxFilled,
              index === value.length && styles.digitBoxActive,
            ]}
          >
            <View style={digit ? styles.dot : styles.dotEmpty} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  digits: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  digitBoxFilled: {
    borderColor: Colors.white,
  },
  digitBoxActive: {
    borderColor: Colors.purple1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  dotEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gray5,
  },
});
