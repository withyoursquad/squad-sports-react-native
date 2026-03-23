import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
  countryCode?: string;
}

export function PhoneNumberInput({
  value,
  onChangeText,
  onSubmitEditing,
  style,
  countryCode = '+1',
}: PhoneNumberInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      onChangeText(cleaned);
    },
    [onChangeText],
  );

  return (
    <View style={[styles.container, focused && styles.containerFocused, style]}>
      <View style={styles.countryCode}>
        <Text style={styles.countryCodeText}>{countryCode}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={handleChange}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Phone number"
        placeholderTextColor={Colors.gray6}
        keyboardType="phone-pad"
        style={styles.input}
        maxLength={15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray5,
    borderRadius: 8,
    backgroundColor: Colors.black,
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: Colors.white,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.gray5,
  },
  countryCodeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
