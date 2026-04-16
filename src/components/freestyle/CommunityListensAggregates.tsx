/**
 * CommunityListensAggregates — Aggregated listen stats for community freestyles.
 * Shows community avatar and count of listeners from that community.
 * Ported from squad-demo/src/components/freestyle/CommunityListensAggregates.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRecoilValue } from 'recoil';
import { Colors } from '../../theme/ThemeContext';
import { BodyMedium } from '../ux/text/Typography';
import { reCommunityById } from '../../state/communities';

type CommunityListensAggregatesProps = {
  freestyle: {
    totalListens?: number;
    community?: {
      id?: string;
    };
  } | null;
  reactions: Array<{ creator?: { id?: string } }> | null;
};

export function CommunityListensAggregates({
  reactions,
  freestyle,
}: CommunityListensAggregatesProps) {
  const communityId = freestyle?.community?.id || '';
  const community = useRecoilValue(reCommunityById(communityId));

  if (!reactions || !freestyle) {
    return null;
  }

  const communityListens = (freestyle.totalListens ?? 0) - reactions.length;

  if (communityListens <= 0) {
    return null;
  }

  const otherText = communityListens > 1 ? 'Others' : 'Other';

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {community && (community as any)?.imageUri ? (
          <Image
            source={{ uri: (community as any).imageUri }}
            contentFit="contain"
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <BodyMedium style={styles.text}>
        {String(communityListens)} {otherText} from{' '}
        {(community as any)?.name || ''} Shifters
      </BodyMedium>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginRight: 16,
    width: 56,
    overflow: 'hidden',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  image: {
    height: 56,
    width: 56,
  },
  imagePlaceholder: {
    height: 56,
    width: 56,
    backgroundColor: Colors.gray3,
    borderRadius: 28,
  },
  text: {
    color: Colors.gray6,
    flex: 1,
  },
});
