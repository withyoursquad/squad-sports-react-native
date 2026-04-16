/**
 * ToastContainer - Manages toast queue and display with slide-in animation.
 * Ported from squad-demo/src/components/toasts/ToastWrapper.tsx + index.ts.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import SuccessToast from './SuccessToast';
import ErrorToast from './ErrorToast';
import BusyToast from './BusyToast';

export type ToastType = 'success' | 'error' | 'busy';

export type ToastEntry = {
  id: string;
  type: ToastType;
  message: string;
};

export type ToastContainerProps = {
  /** Currently-displayed toast, or null to hide. */
  toast: ToastEntry | null;
  /** Called when the toast auto-dismisses. */
  onDismiss: () => void;
  /** Additional style for the safe-area wrapper. */
  style?: ViewStyle;
};

export default function ToastContainer({
  toast,
  onDismiss,
  style,
}: ToastContainerProps) {
  const [toastPosition] = useState(new Animated.Value(-100));

  const onHide = useCallback(() => {
    Animated.timing(toastPosition, {
      duration: 500,
      toValue: -100,
      delay: 2000,
      useNativeDriver: false,
    }).start(() => {
      onDismiss();
    });
  }, [toastPosition, onDismiss]);

  const onShow = useCallback(() => {
    Animated.timing(toastPosition, {
      duration: 500,
      toValue: 16,
      useNativeDriver: false,
    }).start(onHide);
  }, [toastPosition, onHide]);

  useEffect(() => {
    if (toast) {
      onShow();
    }
  }, [toast, onShow]);

  if (!toast) return null;

  const renderToast = () => {
    switch (toast.type) {
      case 'success':
        return <SuccessToast message={toast.message} />;
      case 'error':
        return <ErrorToast message={toast.message} />;
      case 'busy':
        return <BusyToast message={toast.message} />;
      default:
        return <SuccessToast message={toast.message} />;
    }
  };

  return (
    <SafeAreaView style={[style, styles.safeArea]}>
      <Animated.View style={{ transform: [{ translateY: toastPosition }] }}>
        {renderToast()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10000,
  },
});
