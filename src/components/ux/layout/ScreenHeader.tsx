import React, { ReactNode } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Colors } from '../../../theme/ThemeContext';

const { width } = Dimensions.get('window');

interface ScreenHeaderProps {
  right?: ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function ScreenHeader({
  right,
  title,
  showBack = true,
  onBack,
}: ScreenHeaderProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const textColor = theme.isDarkMode ? Colors.white : Colors.gray1;

  return (
    <View style={styles.screenHeader} accessibilityRole="header">
      <View style={styles.sideContainer}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backText, { color: textColor }]}>{'<'}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text
          style={[styles.screenHeaderText, { color: textColor }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>
      <View style={styles.sideContainer}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
    width,
  },
  sideContainer: {
    width: 40,
    alignItems: 'center',
  },
  titleContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeaderText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
  },
});
