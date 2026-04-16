import React, { ReactNode, useMemo, memo } from 'react';
import { StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { theme } = useTheme();

  const screenStyle = useMemo(
    () => [
      styles.screen,
      style,
      { backgroundColor: theme.screenBackground },
    ],
    [style, theme.screenBackground],
  );

  return <SafeAreaView style={screenStyle}>{children}</SafeAreaView>;
}

export default memo(Screen);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width,
    height,
  },
});
