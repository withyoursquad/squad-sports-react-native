/**
 * CommunityBottomSheet - Bottom sheet for switching communities.
 * Ported from squad-demo/src/components/communities/CommunityBottomSheet.tsx.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyMedium, BodyRegular, TitleSmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import CommunityRow, { CommunityData } from './CommunityRow';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CommunityBottomSheetProps = {
  communities: CommunityData[] | null;
  initialSelected?: CommunityData | null;
  onSelect?: (community: CommunityData | null) => void;
  onDismiss: () => void;
  isLoading?: boolean;
};

export default function CommunityBottomSheet({
  communities,
  initialSelected = null,
  onSelect,
  onDismiss,
  isLoading = false,
}: CommunityBottomSheetProps) {
  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityData | null>(initialSelected);

  const handleSelect = useCallback(
    (community: CommunityData | null) => {
      setSelectedCommunity(community);
      onSelect?.(community);
    },
    [onSelect],
  );

  const renderCommunityRow = useCallback(
    ({ item }: { item: CommunityData }) => (
      <CommunityRow
        community={item}
        onSelect={handleSelect}
        selectedCommunity={selectedCommunity}
      />
    ),
    [handleSelect, selectedCommunity],
  );

  return (
    <View style={styles.container}>
      <View style={styles.closeContainer}>
        <Button onPress={onDismiss}>
          <BodyRegular style={styles.closeText}>Close</BodyRegular>
        </Button>
      </View>
      <View style={styles.titleContainer}>
        <TitleSmall style={styles.title}>Join a Community</TitleSmall>
        <BodyMedium style={styles.subtitle}>
          Anyone who joins a community will have a curated Squad experience
        </BodyMedium>
      </View>
      {isLoading || !communities ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.white} />
          <BodyRegular style={styles.loadingText}>
            Loading your communities
          </BodyRegular>
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={renderCommunityRow}
          style={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closeContainer: {
    alignItems: 'flex-end',
  },
  closeText: {
    color: Colors.white,
  },
  container: {
    height: SCREEN_HEIGHT * 0.85,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  listContainer: {
    marginTop: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginTop: 32,
  },
  subtitle: {
    color: Colors.gray6,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
  },
  titleContainer: {
    marginTop: 16,
  },
});
