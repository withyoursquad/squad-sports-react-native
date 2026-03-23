import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Animated, Text } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export default function LoadingOverlay({ visible, text }: LoadingOverlayProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, fadeAnim]);

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <ActivityIndicator size="large" color={Colors.white} />
      {text && <Text style={styles.text}>{text}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  text: {
    color: Colors.white,
    marginTop: 16,
    fontSize: 14,
  },
});
