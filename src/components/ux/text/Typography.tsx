import React, { ReactNode } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypographyProps extends TextProps {
  children: ReactNode;
}

function createTypography(baseStyle: object) {
  return function TypographyComponent({ children, style, ...props }: TypographyProps) {
    return (
      <Text style={[baseStyle, style]} {...props}>
        {children}
      </Text>
    );
  };
}

export const TitleLarge = createTypography({ fontSize: 56, lineHeight: 66, fontWeight: '500' });
export const TitleRegular = createTypography({ fontSize: 32, lineHeight: 42, fontWeight: '500' });
export const TitleMedium = createTypography({ fontSize: 24, lineHeight: 36, fontWeight: '500' });
export const TitleSmall = createTypography({ fontSize: 18, lineHeight: 27, fontWeight: '700' });
export const TitleTiny = createTypography({ fontSize: 16, lineHeight: 24, fontWeight: '500' });
export const SubtitleSmall = createTypography({ fontSize: 14, lineHeight: 21, fontWeight: '500' });
export const BodyRegular = createTypography({ fontSize: 16, lineHeight: 24 });
export const BodyMedium = createTypography({ fontSize: 14, lineHeight: 21 });
export const BodySmall = createTypography({ fontSize: 12, lineHeight: 18 });
export const ButtonLarge = createTypography({ fontSize: 16 });
export const ButtonSmall = createTypography({ fontSize: 14 });
