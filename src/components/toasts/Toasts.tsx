/**
 * Toast components.
 * Ported from squad-demo/src/components/toasts/*.
 */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

// --- SuccessToast ---
export function SuccessToast({ message, visible, onDismiss }: { message: string; visible: boolean; onDismiss?: () => void }) {
  return <ToastBase type="success" message={message} visible={visible} onDismiss={onDismiss} />;
}

// --- ErrorToast ---
export function ErrorToast({ message, visible, onDismiss }: { message: string; visible: boolean; onDismiss?: () => void }) {
  return <ToastBase type="error" message={message} visible={visible} onDismiss={onDismiss} />;
}

// --- BusyToast ---
export function BusyToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <Animated.View style={styles.toast}>
      <ActivityIndicator size="small" color={Colors.white} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// --- Base Toast ---
function ToastBase({ type, message, visible, onDismiss, duration = 3000 }: {
  type: 'success' | 'error' | 'info'; message: string; visible: boolean; onDismiss?: () => void; duration?: number;
}) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [shouldRender, setShouldRender] = useState(false);

  const indicatorColor = type === 'success' ? Colors.green : type === 'error' ? Colors.red : Colors.purple1;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      if (duration > 0) {
        const t = setTimeout(() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            setShouldRender(false);
            onDismiss?.();
          });
        }, duration);
        return () => clearTimeout(t);
      }
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShouldRender(false));
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
      <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
      <Text style={styles.toastText} numberOfLines={2}>{message}</Text>
      <Pressable onPress={onDismiss}><Text style={styles.dismiss}>x</Text></Pressable>
    </Animated.View>
  );
}

// --- ToastWrapper (renders from modal queue) ---
export function ToastWrapper({ toast, onDismiss }: {
  toast: { type: string; message: string } | null; onDismiss: () => void;
}) {
  if (!toast) return null;
  return <ToastBase type={toast.type as any} message={toast.message} visible={true} onDismiss={onDismiss} />;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', top: 60, left: 16, right: 16,
    backgroundColor: Colors.gray2, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    zIndex: 10000, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  indicator: { width: 4, height: 24, borderRadius: 2, marginRight: 12 },
  toastText: { flex: 1, color: Colors.white, fontSize: 14 },
  dismiss: { color: Colors.gray6, fontSize: 18, paddingLeft: 12 },
});
