/**
 * WelcomeAnimation - Welcome animation using RN Animated API.
 * Ported from squad-demo/src/screens/onboarding/WelcomeAnimation.tsx.
 * Uses pure Animated API instead of Lottie for SDK portability.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export type WelcomeAnimationProps = {
  /** Optional safe area top inset. */
  topInset?: number;
};

export default function WelcomeAnimation({
  topInset = 0,
}: WelcomeAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heart1Anim = useRef(new Animated.Value(0)).current;
  const heart2Anim = useRef(new Animated.Value(0)).current;
  const heart3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale in
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Floating hearts animation (loops)
    const animateHeart = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animateHeart(heart1Anim, 0);
    animateHeart(heart2Anim, 600);
    animateHeart(heart3Anim, 1200);
  }, [fadeAnim, scaleAnim, heart1Anim, heart2Anim, heart3Anim]);

  const heartTranslateY = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

  const heartOpacity = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topInset,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Floating hearts */}
      <View style={styles.heartsContainer}>
        <Animated.Text
          style={[
            styles.heart,
            styles.heart1,
            {
              opacity: heartOpacity(heart1Anim),
              transform: [{ translateY: heartTranslateY(heart1Anim) }],
            },
          ]}
        >
          {'\u2665'}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.heart,
            styles.heart2,
            {
              opacity: heartOpacity(heart2Anim),
              transform: [{ translateY: heartTranslateY(heart2Anim) }],
            },
          ]}
        >
          {'\u2665'}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.heart,
            styles.heart3,
            {
              opacity: heartOpacity(heart3Anim),
              transform: [{ translateY: heartTranslateY(heart3Anim) }],
            },
          ]}
        >
          {'\u2665'}
        </Animated.Text>
      </View>

      {/* People icons */}
      <View style={styles.peopleContainer}>
        <View style={[styles.personCircle, styles.person1]} />
        <View style={[styles.personCircle, styles.person2]} />
        <View style={[styles.personCircle, styles.person3]} />
      </View>

      {/* Fallback text */}
      <Text style={styles.fallbackTitle}>Welcome to Squad</Text>
      <Text style={styles.fallbackSubtitle}>
        Let's get you set up with your profile
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  fallbackSubtitle: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  fallbackTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 32,
    textAlign: 'center',
  },
  heart: {
    color: Colors.red,
    fontSize: 24,
    position: 'absolute',
  },
  heart1: {
    left: 20,
    top: 10,
  },
  heart2: {
    right: 20,
    top: 30,
  },
  heart3: {
    left: 60,
    top: 0,
  },
  heartsContainer: {
    height: 80,
    position: 'relative',
    width: 200,
  },
  peopleContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  person1: {
    backgroundColor: Colors.purple1,
    height: 40,
    width: 40,
  },
  person2: {
    backgroundColor: Colors.orange1,
    height: 48,
    marginHorizontal: 8,
    width: 48,
  },
  person3: {
    backgroundColor: Colors.purple2,
    height: 36,
    width: 36,
  },
  personCircle: {
    borderRadius: 24,
  },
});
