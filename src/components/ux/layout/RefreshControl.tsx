import React from 'react';
import { RefreshControl as RNRefreshControl, type RefreshControlProps } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

export default function RefreshControl(props: RefreshControlProps) {
  return <RNRefreshControl tintColor={Colors.white} colors={[Colors.purple1]} {...props} />;
}
