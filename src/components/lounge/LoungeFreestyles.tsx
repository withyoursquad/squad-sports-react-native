/**
 * Freestyles tab for the Lounge view.
 * Ported from squad-demo/src/screens/lounge/Freestyles.tsx.
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../theme/ThemeContext';
import { useApiClient } from '../../SquadProvider';
import {
  OmniScrollView,
  OmniScrollViewBuilderSliver,
  OmniScrollViewFixedChildSliver,
  type OmniScrollViewSliver,
} from '../OmniScrollView';
import FreestyleFeedSectionHeader from './FreestyleFeedSectionHeader';
import FreestyleCard from '../feed/FreestyleCard';
import { BodyRegular, TitleSmall } from '../ux/text/Typography';
import type { User } from '@squad-sports/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoungeFreestylesProps {
  user: User;
  freestyles: any[];
  isOwnProfile: boolean;
  onScroll?: (event: any) => void;
  onRefresh?: () => Promise<void>;
}

export default function LoungeFreestyles({
  user,
  freestyles,
  isOwnProfile,
  onScroll,
  onRefresh,
}: LoungeFreestylesProps) {
  const navigation = useNavigation();

  // Split into listened/unlistened
  const unlistened = freestyles.filter((f: any) => !f.listenedByMe);
  const listened = freestyles.filter((f: any) => f.listenedByMe);
  const hasUnlistened = unlistened.length > 0;
  const hasListened = listened.length > 0;
  const isEmpty = freestyles.length === 0;

  if (isEmpty) {
    return (
      <View style={styles.emptyContent}>
        <BodyRegular style={styles.emptyText}>
          {isOwnProfile
            ? "You haven't dropped any freestyles yet. Share your first take!"
            : `${user.displayName ?? 'This user'} hasn't shared any freestyles yet.`}
        </BodyRegular>
        {isOwnProfile && (
          <View style={styles.footerContainer}>
            <Pressable
              style={styles.createButton}
              onPress={() => (navigation as any).navigate('FreestyleCreate')}
            >
              <TitleSmall style={styles.createButtonText}>+</TitleSmall>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  const slivers: Array<OmniScrollViewSliver> = [];

  const freestyleBuilder = (freestyle: any) => (
    <FreestyleCard
      key={freestyle.id}
      id={freestyle.id}
      audioUrl={freestyle.audioUrl}
      duration={freestyle.duration}
      creatorName={freestyle.creator?.displayName ?? user.displayName}
      creatorImageUrl={freestyle.creator?.imageUrl ?? user.imageUrl}
      createdAt={freestyle.createdAt}
      listenCount={freestyle.listenCount}
      reactionCount={freestyle.reactionCount}
      prompt={freestyle.prompt?.text}
    />
  );

  if (hasUnlistened && hasListened) {
    slivers.push(
      new OmniScrollViewFixedChildSliver('whats-new-header', () => (
        <FreestyleFeedSectionHeader>{"What\u2019s New"}</FreestyleFeedSectionHeader>
      ))
    );
    slivers.push(
      new OmniScrollViewBuilderSliver({
        data: unlistened,
        extractKey: (d: any) => d.id ?? '',
        builder: freestyleBuilder,
      })
    );
    slivers.push(
      new OmniScrollViewFixedChildSliver('older-header', () => (
        <FreestyleFeedSectionHeader>Older</FreestyleFeedSectionHeader>
      ))
    );
    slivers.push(
      new OmniScrollViewBuilderSliver({
        data: listened,
        extractKey: (d: any) => d.id ?? '',
        builder: freestyleBuilder,
      })
    );
  } else {
    slivers.push(
      new OmniScrollViewBuilderSliver({
        data: hasUnlistened ? unlistened : listened,
        extractKey: (d: any) => d.id ?? '',
        builder: freestyleBuilder,
      })
    );
  }

  return (
    <View style={styles.container}>
      <OmniScrollView slivers={slivers} onScroll={onScroll} onRefresh={onRefresh} style={styles.list} />
      {isOwnProfile && (
        <View style={styles.footerContainer}>
          <Pressable
            style={styles.createButton}
            onPress={() => (navigation as any).navigate('FreestyleCreate')}
          >
            <TitleSmall style={styles.createButtonText}>+</TitleSmall>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    color: Colors.white,
    textAlign: 'center',
  },
  footerContainer: {
    backgroundColor: Colors.gray9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    width: SCREEN_WIDTH,
  },
  createButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.purple1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});
