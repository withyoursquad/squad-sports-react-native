import React, { useCallback } from 'react';
import { Pressable, StyleProp, ViewStyle, PressableProps } from 'react-native';

export type ButtonProps = PressableProps & {
  disabledStyle?: StyleProp<ViewStyle>;
  feedback?: boolean;
};

export default function Button({
  disabledStyle = {},
  feedback = true,
  style,
  ...props
}: ButtonProps) {
  const styleWithFeedback = useCallback(
    ({ pressed }: { pressed: boolean }) => {
      const stylesToApply: StyleProp<ViewStyle>[] = [
        feedback ? { opacity: pressed ? 0.6 : 1 } : {},
        style as StyleProp<ViewStyle>,
        props.disabled ? disabledStyle : {},
      ].filter(Boolean);
      return stylesToApply;
    },
    [style, feedback, props.disabled, disabledStyle],
  );

  return (
    <Pressable
      {...props}
      style={styleWithFeedback}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: props.disabled ?? undefined }}
    >
      {props.children}
    </Pressable>
  );
}
