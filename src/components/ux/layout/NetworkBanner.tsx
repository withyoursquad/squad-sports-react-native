import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface NetworkBannerProps {
  isOnline: boolean;
}

/**
 * Animated banner that slides down when the device goes offline.
 * Automatically wired into SquadProvider — integrators don't need to add this.
 */
export function NetworkBanner({ isOnline }: NetworkBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-50));
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShouldRender(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
  }, [isOnline, slideAnim]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.orange2,
    paddingTop: 50,
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 9998,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
