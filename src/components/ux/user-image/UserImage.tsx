import React, { memo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../../theme/ThemeContext';

interface UserImageProps {
  imageUrl?: string | null;
  displayName?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}

function UserImage({
  imageUrl,
  displayName,
  size = 48,
  style,
  borderColor,
}: UserImageProps) {
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      ...(borderColor && { borderWidth: 2, borderColor }),
    },
    style,
  ];

  const a11yLabel = displayName ? `${displayName}'s profile photo` : 'User profile photo';

  if (imageUrl) {
    return (
      <View style={containerStyle} accessibilityLabel={a11yLabel} accessibilityRole="image">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.placeholder]} accessibilityLabel={a11yLabel} accessibilityRole="image">
      <Text style={[styles.initials, { fontSize: size * 0.36 }]} accessibilityElementsHidden>
        {initials}
      </Text>
    </View>
  );
}

export default memo(UserImage);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: Colors.purple1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '600',
  },
});
