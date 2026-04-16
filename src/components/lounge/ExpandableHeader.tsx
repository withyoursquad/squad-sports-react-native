/**
 * Animated collapsing profile header.
 * Ported from squad-demo/src/screens/spikes/ExpandableHeader.tsx.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { TitleSmall, BodyMedium } from '../ux/text/Typography';
import type { User } from '@squad-sports/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ExpandableHeaderProps = {
  user: User;
  scrollOffsetY: Animated.Value;
  onEditPhoto?: () => void;
  isOwnProfile: boolean;
  onSettingsPress?: () => void;
  onEllipsisPress?: () => void;
};

export default function ExpandableHeader({
  user,
  scrollOffsetY,
  onEditPhoto,
  isOwnProfile,
  onSettingsPress,
  onEllipsisPress,
}: ExpandableHeaderProps) {
  const H_MAX_HEIGHT = isOwnProfile ? 216 : 200;
  const H_MIN_HEIGHT = 60;
  const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const localScrollOffsetY = useRef(new Animated.Value(0)).current;
  const lastAnimationTime = useRef(0);
  const previousScrollValue = useRef(0);

  const headerHeight = localScrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerScale = localScrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const buttonsOpacity = localScrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerColor = localScrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [Colors.gray1, 'rgba(0,0,0,0)'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const threshold = 5;
    const animationCooldown = 150;
    const velocityThreshold = 0.3;

    const listenerId = scrollOffsetY.addListener(({ value }) => {
      const currentTime = Date.now();
      if (currentTime - lastAnimationTime.current < animationCooldown) return;

      const clampedValue = Math.max(0, Math.min(value, H_SCROLL_DISTANCE));
      const delta = clampedValue - previousScrollValue.current;
      const velocity = Math.abs(delta) / animationCooldown;

      if (velocity > velocityThreshold || Math.abs(delta) > threshold) {
        lastAnimationTime.current = currentTime;
        Animated.spring(localScrollOffsetY, {
          toValue: delta > 0 ? H_SCROLL_DISTANCE : 0,
          useNativeDriver: false,
          tension: 65,
          friction: 5,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }).start();
      }

      previousScrollValue.current = clampedValue;
    });

    return () => scrollOffsetY.removeListener(listenerId);
  }, [H_SCROLL_DISTANCE, localScrollOffsetY, scrollOffsetY]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.backgroundFill, { top: -insets.top, backgroundColor: headerColor }]}
      />
      <Animated.View style={{ height: headerHeight, transform: [{ scale: headerScale }] }}>
        <Animated.View style={[styles.headerBackground, { backgroundColor: headerColor }]} />

        <View style={styles.header}>
          <Pressable style={styles.headerGoBack} onPress={handleGoBack}>
            <TitleSmall style={styles.backText}>{'<'}</TitleSmall>
          </Pressable>

          <View style={styles.nameContainer}>
            <TitleSmall style={styles.nameText} numberOfLines={1}>
              {user.displayName ? `${user.displayName}'s Lab` : 'Profile'}
            </TitleSmall>
          </View>

          <View style={styles.buttonContainer}>
            {isOwnProfile ? (
              <Pressable onPress={onSettingsPress} style={styles.headerIconCircle}>
                <TitleSmall style={styles.iconText}>{'...'}</TitleSmall>
              </Pressable>
            ) : (
              <Pressable onPress={onEllipsisPress} style={styles.headerIconCircle}>
                <TitleSmall style={styles.iconText}>{'...'}</TitleSmall>
              </Pressable>
            )}
          </View>
        </View>

        <Animated.View style={[styles.headerContentContainer, { opacity: buttonsOpacity }]}>
          <Pressable onPress={isOwnProfile ? onEditPhoto : undefined} style={styles.pictureContainer}>
            <UserImage
              imageUrl={user.imageUrl}
              displayName={user.displayName}
              size={88}
            />
            {isOwnProfile && (
              <BodyMedium style={styles.editLabel}>Edit photo</BodyMedium>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  backgroundFill: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    bottom: 24,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  headerBackground: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingLeft: 16,
    width: '100%',
  },
  headerGoBack: {
    flex: 1,
    paddingVertical: 8,
  },
  backText: {
    color: Colors.white,
    fontSize: 20,
  },
  nameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    width: '50%',
  },
  nameText: {
    color: Colors.white,
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: -4,
  },
  headerContentContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pictureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  editLabel: {
    color: Colors.gray6,
    marginTop: 8,
  },
});
