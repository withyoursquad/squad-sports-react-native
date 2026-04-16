/**
 * PollTag — Badge showing poll theme (e.g. "Daily Poll") or community tag.
 * Ported from squad-demo Tag.tsx + CommunityPollTag.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { SubtitleSmall } from '../ux/text/Typography';

interface PollTagProps {
  label: string;
  /** If set, renders a community-style gradient tag */
  communityTag?: string;
}

export default function PollTag({ label, communityTag }: PollTagProps) {
  if (communityTag) {
    return <CommunityPollTag label={communityTag} />;
  }

  const isCustomTheme = !!label && label !== 'Daily Poll' && label !== '';
  const tagBg = isCustomTheme
    ? 'rgba(233, 120, 92, 0.15)'
    : 'rgba(110, 130, 231, 0.15)';
  const tagColor = isCustomTheme ? Colors.orange1 : Colors.white;

  return (
    <View style={[styles.tag, { backgroundColor: tagBg }]}>
      <SubtitleSmall style={{ color: tagColor }}>{label}</SubtitleSmall>
    </View>
  );
}

function CommunityPollTag({ label }: { label: string }) {
  return (
    <View style={styles.communityTag}>
      <View style={styles.communityGradient} />
      <SubtitleSmall style={styles.communityText}>{label}</SubtitleSmall>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'center',
    borderRadius: 4,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  communityTag: {
    alignSelf: 'center',
    backgroundColor: Colors.gray5,
    borderRadius: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  communityGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.gray4,
  },
  communityText: {
    color: Colors.white,
    textAlign: 'center',
  },
});
