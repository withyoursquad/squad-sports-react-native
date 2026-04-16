/**
 * AnimatedPollOptions — Animated progress bar for a single poll option after voting.
 * Ported from squad-demo. Uses RN Animated API for the fill transition.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular, TitleTiny } from '../ux/text/Typography';

export interface PollOptionData {
  id: number;
  label: string;
  imageUrl?: string;
}

interface AnimatedPollOptionsProps {
  option: PollOptionData;
  completedPercentage: number;
  /** Primary fill color – falls back to community primary color from theme */
  fillColor?: string;
}

export default function AnimatedPollOptions({
  option,
  completedPercentage,
  fillColor,
}: AnimatedPollOptionsProps) {
  const { theme } = useTheme();
  const safePercentage = isNaN(completedPercentage) ? 0 : completedPercentage;
  const animatedPercentage = useRef(new Animated.Value(0)).current;

  const resolvedFillColor = fillColor ?? theme.primaryColor ?? Colors.purple1;

  useEffect(() => {
    Animated.timing(animatedPercentage, {
      toValue: safePercentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [safePercentage, animatedPercentage]);

  const animatedWidth = animatedPercentage.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedFill,
          { width: animatedWidth, backgroundColor: resolvedFillColor },
        ]}
      />

      <View style={styles.imageContainer}>
        {option.imageUrl ? (
          <Image
            source={{ uri: option.imageUrl }}
            contentFit="contain"
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      <View style={styles.textContainer}>
        <BodyRegular style={styles.label}>{option.label}</BodyRegular>
      </View>

      <TitleTiny style={styles.percentage}>{safePercentage}%</TitleTiny>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  animatedFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.35,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
    overflow: 'hidden',
    marginLeft: 16,
  },
  image: {
    height: 48,
    width: 48,
  },
  imagePlaceholder: {
    height: 48,
    width: 48,
    backgroundColor: Colors.gray3,
    borderRadius: 24,
  },
  label: {
    color: Colors.white,
    textAlign: 'left',
    marginHorizontal: 16,
  },
  textContainer: {
    flexGrow: 1,
  },
  percentage: {
    color: Colors.white,
    textAlign: 'right',
    marginRight: 16,
  },
});
