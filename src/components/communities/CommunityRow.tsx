/**
 * CommunityRow - Row with community image + name (for selection lists).
 * Ported from squad-demo/src/components/communities/CommunityRow.tsx.
 */
import React, { useCallback } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular, TitleTiny } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type CommunityData = {
  id: string;
  name: string;
  imageUri?: string | null;
};

export type CommunityRowProps = {
  community: CommunityData;
  onSelect: (community: CommunityData | null) => void;
  selectedCommunity: CommunityData | null;
};

export default function CommunityRow({
  community,
  onSelect,
  selectedCommunity,
}: CommunityRowProps) {
  const { theme, baseThemeColors } = useTheme();
  const isSelectedCommunity = selectedCommunity?.id === community?.id;

  const handleSelect = useCallback(() => {
    if (isSelectedCommunity) {
      onSelect(null);
    } else {
      onSelect(community);
    }
  }, [community, isSelectedCommunity, onSelect]);

  const opacity =
    !selectedCommunity || isSelectedCommunity ? 1 : 0.5;

  const LabelComponent =
    !selectedCommunity || isSelectedCommunity ? TitleTiny : BodyRegular;

  return (
    <Button onPress={handleSelect} style={styles.rowContainer}>
      <View style={[styles.infoContainer, { opacity }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: community.imageUri || '' }}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
        <LabelComponent
          style={[
            styles.name,
            {
              color: theme.isDarkMode
                ? baseThemeColors.primaryWhiteColor
                : baseThemeColors.primaryTextColor,
            },
          ]}
        >
          {community.name || ''}
        </LabelComponent>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  imageContainer: {
    alignItems: 'center',
    borderColor: Colors.white,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  name: {
    color: Colors.white,
    flex: 1,
    marginLeft: 16,
  },
  rowContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
});
