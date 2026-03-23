import React, { useCallback, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TextInputFocusEventData,
  ViewStyle,
  StyleSheet,
} from 'react-native';

type TextInputProps = RNTextInputProps & {
  ref?: any;
  focusStyle?: StyleProp<ViewStyle>;
};

export const TextInput = React.forwardRef(function TextInputComponent(
  { style, onFocus, onBlur, focusStyle, ...props }: TextInputProps,
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

  return (
    <RNTextInput
      {...props}
      onFocus={handleFocus as any}
      onBlur={handleBlur as any}
      textAlignVertical="center"
      style={[styles.input, style, focused ? focusStyle : {}]}
      ref={ref as any}
      autoComplete="off"
      accessibilityRole="text"
      accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    textAlignVertical: 'center',
  },
});
