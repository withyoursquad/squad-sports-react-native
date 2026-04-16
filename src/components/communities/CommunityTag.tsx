/**
 * CommunityTag - Small color-coded tag showing community name/image.
 * Ported from squad-demo/src/components/communities/CommunityTag.tsx.
 */
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export type CommunityTagProps = {
  /** Community image URI. */
  imageUri?: string | null;
  /** Size of the parent avatar (used to scale the tag). */
  size?: number;
};

export default function CommunityTag({ imageUri, size }: CommunityTagProps) {
  const containerSize = (() => {
    if (!size) return 24;
    if (size > 40) return 32;
    if (size > 30) return 16;
    return 16;
  })();

  const iconSize = (() => {
    if (!size) return 16;
    if (size > 40) return 24;
    if (size > 30) return 12;
    return 8;
  })();

  return (
    <View
      style={[
        styles.tagContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
      ]}
    >
      {imageUri ? (
        <Image
          style={[styles.image, { width: iconSize, height: iconSize }]}
          source={{ uri: imageUri }}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 28,
    width: 28,
  },
  tagContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray11,
    borderColor: Colors.white,
    borderRadius: 15,
    borderWidth: 1,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    width: 28,
  },
});
