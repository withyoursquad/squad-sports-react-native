import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

/**
 * Theme interface ported from squad-demo/src/theme/theme.tsx.
 */
export interface Theme {
  screenBackground: string;
  screenBackgroundTransparency: string;
  bottomSheetHandleIndicator: string;
  offWhiteTransparency?: string;
  recordingButtons?: string;
  emojiKeyboardHeader: string;
  buttonColor: string;
  buttonText: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  isDarkMode: boolean;
}

export interface ColorScheme {
  primaryTextColor: string;
  disabledGrey: string;
  primaryGreyColor: string;
  secondaryGrey: string;
  primaryWhiteColor: string;
  secondaryTextColor: string;
  transparentBGWhite: string;
  transparentBGBlack: string;
  errorColor: string;
  backgroundWhite: string;
  backgroundBlack: string;
  primaryPurple: string;
}

export const Colors = {
  blackBackground: '#1D1D1D',
  squadCircle: '#FAFAFA',
  transparent: 'rgba(0,0,0,0)',
  black: '#0A0A0A',
  white: '#ffffff',
  gray1: '#151515',
  gray2: '#212121',
  gray3: '#353535',
  gray4: '#444444',
  gray5: '#3D3D3D',
  gray6: '#8A8A8A',
  gray7: '#DFE5EB',
  gray8: '#DCDCDC',
  gray9: '#111111',
  gray10: '#8A8A8A',
  gray11: '#D9D9D9',
  gray12: '#0B0B0B',
  purple1: '#6E82E7',
  purple2: '#2E46C9',
  purple3: '#566BD7',
  orange1: '#FF955C',
  orange2: '#E9785C',
  green: '#11EC0F',
  gold: '#D1C282',
  apricot: '#FF955C',
  red: '#FF4478',
  blue: 'rgb(0,98,255)',
  lightGray: '#F2F2F2',
} as const;

const baseThemeColors: ColorScheme = {
  primaryTextColor: Colors.gray1,
  disabledGrey: Colors.gray11,
  primaryGreyColor: Colors.gray6,
  secondaryGrey: Colors.gray5,
  primaryWhiteColor: Colors.white,
  secondaryTextColor: Colors.gray2,
  transparentBGWhite: 'rgba(0,0,0, 0.05)',
  transparentBGBlack: 'rgba(255,255,255, 0.05)',
  errorColor: Colors.orange1,
  backgroundWhite: '#F5F6F8',
  backgroundBlack: '#000000',
  primaryPurple: Colors.purple1,
};

export const defaultTheme: Theme = {
  screenBackground: Colors.gray9,
  screenBackgroundTransparency: 'rgba(17,17,17, 0.8)',
  bottomSheetHandleIndicator: 'rgba(255, 255, 255, 0.14)',
  emojiKeyboardHeader: '#5F5E5F',
  buttonColor: Colors.purple1,
  buttonText: Colors.black,
  primaryColor: Colors.black,
  secondaryColor: Colors.gray2,
  tertiaryColor: Colors.purple1,
  isDarkMode: true,
};

/**
 * Build a theme from community colors, falling back to defaults.
 */
export function buildCommunityTheme(
  primaryColor?: string,
  secondaryColor?: string,
): Theme {
  return {
    ...defaultTheme,
    primaryColor: primaryColor ?? defaultTheme.primaryColor,
    secondaryColor: secondaryColor ?? defaultTheme.secondaryColor,
    buttonColor: primaryColor ?? defaultTheme.buttonColor,
    tertiaryColor: secondaryColor ?? defaultTheme.tertiaryColor,
  };
}

// --- Context ---

interface ThemeContextValue {
  theme: Theme;
  colors: typeof Colors;
  baseThemeColors: ColorScheme;
  switchTheme: (theme: Theme) => void;
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: defaultTheme,
  colors: Colors,
  baseThemeColors,
  switchTheme: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeCtx);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  communityColor?: string;
  communitySecondaryColor?: string;
}

export function ThemeProvider({
  children,
  communityColor,
  communitySecondaryColor,
}: ThemeProviderProps) {
  const initialTheme = useMemo(
    () => buildCommunityTheme(communityColor, communitySecondaryColor),
    [communityColor, communitySecondaryColor],
  );

  const [theme, setTheme] = useState<Theme>(initialTheme);

  const switchTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, colors: Colors, baseThemeColors, switchTheme }),
    [theme, switchTheme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
