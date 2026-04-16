/**
 * Masked text input — for phone numbers, codes, etc.
 * Ported from squad-demo/src/components/ux/inputs/MaskedTextInput.tsx.
 */
import React, { useCallback, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputFocusEventData,
  ViewStyle,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

type MaskedTextInputProps = TextInputProps & {
  focusStyle?: StyleProp<ViewStyle>;
  mask?: (RegExp | string)[];
  placeholderFillCharacter?: string;
};

const MaskedTextInput = React.forwardRef(function MaskedTextInputComponent(
  { style, focusStyle, onFocus, onBlur, mask, onChangeText, value, placeholderFillCharacter, ...props }: MaskedTextInputProps,
  ref,
) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleChange = useCallback(
    (text: string) => {
      if (mask) {
        // Apply mask — keep only characters matching mask patterns
        let masked = '';
        let textIdx = 0;
        for (let i = 0; i < mask.length && textIdx < text.length; i++) {
          const pattern = mask[i];
          if (pattern instanceof RegExp) {
            if (pattern.test(text[textIdx]!)) {
              masked += text[textIdx]!;
            }
            textIdx++;
          } else {
            masked += pattern;
            if (text[textIdx] === pattern) textIdx++;
          }
        }
        onChangeText?.(masked);
      } else {
        onChangeText?.(text);
      }
    },
    [mask, onChangeText],
  );

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChange}
      onFocus={handleFocus as any}
      onBlur={handleBlur as any}
      style={[styles.input, style, focused ? focusStyle : {}]}
      ref={ref as any}
      accessibilityRole="text"
    />
  );
});

export default MaskedTextInput;

const styles = StyleSheet.create({
  input: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 8,
    textAlign: 'center',
  },
});
