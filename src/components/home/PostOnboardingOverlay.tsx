/**
 * Post-onboarding loading overlay.
 * Ported from squad-demo's post-onboarding logic in Home.tsx.
 *
 * Displays a loading overlay after onboarding is completed, waiting for
 * initial data to load. Shows for min 3s, max 5s.
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';

interface PostOnboardingOverlayProps {
  visible: boolean;
  onHide: () => void;
  hasConnections: boolean;
  hasError: boolean;
}

const MIN_DISPLAY_TIME = 3000;
const MAX_DISPLAY_TIME = 5000;

export default function PostOnboardingOverlay({
  visible,
  onHide,
  hasConnections,
  hasError,
}: PostOnboardingOverlayProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!visible) return;

    startTime.current = Date.now();

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const hasMinTimePassed = elapsed >= MIN_DISPLAY_TIME;
      const hasMaxTimePassed = elapsed >= MAX_DISPLAY_TIME;

      const shouldHide =
        (hasMinTimePassed && hasConnections) ||
        hasMaxTimePassed ||
        (hasMinTimePassed && hasError);

      if (shouldHide) {
        clearInterval(checkInterval);
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onHide());
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [visible, hasConnections, hasError, onHide, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.white} />
        <TitleSmall style={styles.title}>Setting up your squad...</TitleSmall>
        <BodyRegular style={styles.subtitle}>
          We're getting everything ready for you
        </BodyRegular>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  title: {
    color: Colors.white,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.gray6,
    textAlign: 'center',
  },
});
