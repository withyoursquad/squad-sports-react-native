/**
 * Search text input with debounced updates and search icon.
 * Ported from squad-demo/src/components/ux/inputs/SearchTextInput.tsx.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, TextInputProps, Text } from 'react-native';
import { TextInput } from './TextInput';
import { Colors } from '../../../theme/ThemeContext';

interface SearchTextInputProps extends TextInputProps {
  debounceUpdate?: (text: string) => void;
  inputBackgroundColor?: string;
}

export default function SearchTextInput({
  debounceUpdate,
  inputBackgroundColor,
  ...props
}: SearchTextInputProps) {
  const [searchText, setSearchText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        debounceUpdate?.(text);
      }, 200);
    },
    [debounceUpdate],
  );

  return (
    <View style={[styles.container, { backgroundColor: inputBackgroundColor ?? Colors.gray1 }]}>
      <Text style={styles.icon} accessibilityElementsHidden>Q</Text>
      <TextInput
        {...props}
        style={styles.input}
        value={searchText}
        onChangeText={handleChange}
        placeholderTextColor={Colors.gray6}
        accessibilityLabel={props.accessibilityLabel ?? 'Search'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
    color: Colors.gray6,
    fontSize: 16,
  },
  input: {
    color: Colors.white,
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
});
