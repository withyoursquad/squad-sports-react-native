/**
 * ContactThumbnail - Contact avatar with initials fallback.
 * Ported from squad-demo/src/screens/invite/Thumbnail.tsx.
 */
import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export type ContactThumbnailProps = {
  imageUrl?: string | null;
  initials?: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export default function ContactThumbnail({
  imageUrl,
  initials,
  size,
  style,
}: ContactThumbnailProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={styles.initials}>{initials ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    justifyContent: 'center',
  },
  initials: {
    color: Colors.gray8,
    fontSize: 16,
    lineHeight: 24,
  },
});
