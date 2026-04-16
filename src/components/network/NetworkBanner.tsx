/**
 * NetworkBanner — Animated banner for network connectivity status.
 * Shows red when offline, orange when reconnecting. Auto-hides when online.
 * Animated slide-in/out with spring/timing animations.
 * Ported from squad-demo network banner patterns.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Colors } from '../../theme/ThemeContext';
import { networkBannerVisible, networkStateAtom } from '../../state/ui';

type NetworkBannerVariant = 'offline' | 'reconnecting' | 'online';

interface NetworkBannerProps {
  /** Override automatic state detection with a manual variant */
  variant?: NetworkBannerVariant;
  /** Whether the user can dismiss the banner by tapping */
  dismissible?: boolean;
  /** Called when the banner is dismissed */
  onDismiss?: () => void;
  /** Custom offline message */
  offlineMessage?: string;
  /** Custom reconnecting message */
  reconnectingMessage?: string;
}

export function NetworkBanner({
  variant: overrideVariant,
  dismissible = true,
  onDismiss,
  offlineMessage = "You're offline. Showing saved content.",
  reconnectingMessage = 'Reconnecting...',
}: NetworkBannerProps) {
  const bannerVisible = useRecoilValue(networkBannerVisible);
  const networkState = useRecoilValue(networkStateAtom);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Determine variant from network state or override
  const variant: NetworkBannerVariant =
    overrideVariant ??
    (!networkState.isConnected
      ? 'offline'
      : networkState.isInternetReachable === false
        ? 'reconnecting'
        : 'online');

  const isVisible = bannerVisible && variant !== 'online' && !dismissed;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setDismissed(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
  }, [isVisible, slideAnim]);

  // Reset dismissed state when network state changes
  useEffect(() => {
    if (networkState.isConnected && networkState.isInternetReachable !== false) {
      setDismissed(false);
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!shouldRender) return null;

  const backgroundColor =
    variant === 'offline' ? Colors.red : Colors.orange2;

  const message =
    variant === 'offline' ? offlineMessage : reconnectingMessage;

  const handleDismiss = () => {
    if (dismissible) {
      setDismissed(true);
      onDismiss?.();
    }
  };

  const BannerContent = (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );

  if (dismissible) {
    return (
      <Pressable onPress={handleDismiss}>
        {BannerContent}
      </Pressable>
    );
  }

  return BannerContent;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
