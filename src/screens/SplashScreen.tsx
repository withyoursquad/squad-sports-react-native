/**
 * Branded Splash screen shown during SDK initialization.
 * Ported from squad-demo/src/screens/Splash.tsx.
 *
 * Displays a full-screen branded loading experience with:
 *   - Dark background with decorative gradient circles
 *   - Animated loading indicator
 *   - Min 3s display, max 8s emergency timeout
 *   - Fade-out transition when ready
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/ThemeContext';
import { TitleSmall, BodySmall } from '../components/ux/text/Typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_SPLASH_DURATION = 3000;
const ABSOLUTE_MAX_SPLASH = 8000;

interface SplashScreenProps {
  isReady?: boolean;
  onHidden?: () => void;
  brandName?: string;
}

export function SplashScreen({ isReady = false, onHidden, brandName }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);
  const startTime = useRef(Date.now());
  const hasStartedHide = useRef(false);

  // Decorative circle animations
  const circle1Scale = useRef(new Animated.Value(0.8)).current;
  const circle2Scale = useRef(new Animated.Value(0.6)).current;
  const circle3Scale = useRef(new Animated.Value(0.4)).current;
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Subtle breathing animation for decorative elements
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(circle1Scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(circle2Scale, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
          Animated.timing(circle3Scale, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(circle1Scale, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
          Animated.timing(circle2Scale, { toValue: 0.6, duration: 2200, useNativeDriver: true }),
          Animated.timing(circle3Scale, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [circle1Scale, circle2Scale, circle3Scale, pulseOpacity]);

  const hideSplash = useRef(() => {
    if (hasStartedHide.current) return;
    hasStartedHide.current = true;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setHidden(true);
      onHidden?.();
    });
  });

  useEffect(() => {
    // Emergency timeout — never show splash longer than 8s
    const emergencyTimeout = setTimeout(() => {
      hideSplash.current();
    }, ABSOLUTE_MAX_SPLASH);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, MIN_SPLASH_DURATION - elapsed);

    // Wait for minimum display time, then fade out
    const timer = setTimeout(() => {
      hideSplash.current();
    }, remaining);

    return () => clearTimeout(timer);
  }, [isReady]);

  if (hidden) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Decorative gradient circles */}
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle1,
          { transform: [{ scale: circle1Scale }], opacity: pulseOpacity },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle2,
          { transform: [{ scale: circle2Scale }], opacity: pulseOpacity },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle3,
          { transform: [{ scale: circle3Scale }], opacity: pulseOpacity },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <TitleSmall style={styles.logoText}>squad</TitleSmall>
        </View>

        <ActivityIndicator
          size="small"
          color={Colors.white}
          style={styles.spinner}
        />

        {brandName && (
          <BodySmall style={styles.brandText}>
            Powered by Squad Sports
          </BodySmall>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
  },
  spinner: {
    marginBottom: 24,
  },
  brandText: {
    color: Colors.gray6,
    fontSize: 11,
  },

  // Decorative circles (matching inAppSplash.svg grayscale aesthetic)
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: 'rgba(217, 217, 217, 0.03)',
    top: -SCREEN_WIDTH * 0.3,
    right: -SCREEN_WIDTH * 0.3,
  },
  circle2: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: 'rgba(104, 104, 104, 0.05)',
    bottom: SCREEN_HEIGHT * 0.15,
    left: -SCREEN_WIDTH * 0.2,
  },
  circle3: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: 'rgba(217, 217, 217, 0.04)',
    bottom: -SCREEN_WIDTH * 0.1,
    right: SCREEN_WIDTH * 0.1,
  },
});
