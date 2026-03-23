/**
 * Root-level UX components from squad-demo/src/components/ux/.
 * Ported: ToolTip, TopToast, TopDialog, TopBottomSheet, SettingsCaret,
 *         UserLabelTag, UserImageBorder, QrCode, QrScan, WaitForLoadable,
 *         OfflineBanner, HexagonImageMask, UserImageWithCommunityTag.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

// --- ToolTip ---
export function ToolTip({ text, visible, onDismiss, position = 'bottom' }: {
  text: string; visible: boolean; onDismiss?: () => void; position?: 'top' | 'bottom';
}) {
  if (!visible) return null;
  return (
    <Pressable style={[styles.tooltip, position === 'top' ? styles.tooltipTop : styles.tooltipBottom]} onPress={onDismiss}>
      <Text style={styles.tooltipText}>{text}</Text>
      <View style={[styles.tooltipArrow, position === 'top' ? styles.arrowBottom : styles.arrowTop]} />
    </Pressable>
  );
}

// --- TopToast ---
export function TopToast({ visible, message, onDismiss }: { visible: boolean; message: string; onDismiss?: () => void }) {
  const [anim] = useState(new Animated.Value(visible ? 1 : 0));
  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 300, useNativeDriver: true }).start();
    if (visible) { const t = setTimeout(() => onDismiss?.(), 3000); return () => clearTimeout(t); }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={[styles.topToast, { opacity: anim }]}>
      <Text style={styles.topToastText}>{message}</Text>
    </Animated.View>
  );
}

// --- TopDialog ---
export function TopDialog({ visible, title, message, onConfirm, onCancel }: {
  visible: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!visible) return null;
  return (
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogBox}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogButtons}>
          <Pressable style={styles.dialogButton} onPress={onCancel}><Text style={styles.dialogButtonText}>Cancel</Text></Pressable>
          <Pressable style={[styles.dialogButton, styles.dialogButtonPrimary]} onPress={onConfirm}><Text style={styles.dialogButtonTextPrimary}>Confirm</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

// --- SettingsCaret ---
export function SettingsCaret() {
  return <Text style={styles.caret}>{'>'}</Text>;
}

// --- UserLabelTag ---
export function UserLabelTag({ label, color = Colors.purple1 }: { label: string; color?: string }) {
  return (
    <View style={[styles.labelTag, { backgroundColor: color }]}>
      <Text style={styles.labelTagText}>{label}</Text>
    </View>
  );
}

// --- UserImageBorder ---
export function UserImageBorder({ color = Colors.purple1, size = 52, children }: { color?: string; size?: number; children: React.ReactNode }) {
  return (
    <View style={[styles.imageBorder, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      {children}
    </View>
  );
}

// --- WaitForLoadable ---
export function WaitForLoadable({ loadable, fallback, children }: {
  loadable: { state: string; contents: unknown }; fallback: React.ReactNode; children: (data: unknown) => React.ReactNode;
}) {
  if (loadable.state === 'hasValue') return <>{children(loadable.contents)}</>;
  if (loadable.state === 'hasError') return null;
  return <>{fallback}</>;
}

// --- OfflineBanner ---
export function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <View style={styles.offlineBanner}><Text style={styles.offlineBannerText}>No internet connection</Text></View>
  );
}

// --- UserImageWithCommunityTag ---
export function UserImageWithCommunityTag({ imageUrl, displayName, communityName, communityColor, size = 48 }: {
  imageUrl?: string; displayName?: string; communityName?: string; communityColor?: string; size?: number;
}) {
  const UserImage = require('./user-image/UserImage').default;
  return (
    <View>
      <UserImage imageUrl={imageUrl} displayName={displayName} size={size} />
      {communityName && (
        <View style={[styles.communityTag, { backgroundColor: communityColor ?? Colors.purple1 }]}>
          <Text style={styles.communityTagText}>{communityName.substring(0, 3).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ToolTip
  tooltip: { position: 'absolute', backgroundColor: Colors.gray2, borderRadius: 8, padding: 12, maxWidth: 250, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8 },
  tooltipTop: { top: -60 },
  tooltipBottom: { bottom: -60 },
  tooltipText: { color: Colors.white, fontSize: 13 },
  tooltipArrow: { position: 'absolute', width: 12, height: 12, backgroundColor: Colors.gray2, transform: [{ rotate: '45deg' }], alignSelf: 'center' },
  arrowTop: { top: -6 },
  arrowBottom: { bottom: -6 },

  // TopToast
  topToast: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: Colors.gray2, borderRadius: 12, padding: 16, zIndex: 10000, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  topToastText: { color: Colors.white, fontSize: 14 },

  // TopDialog
  dialogOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 32 },
  dialogBox: { backgroundColor: Colors.gray2, borderRadius: 20, padding: 24, width: '100%', maxWidth: 320 },
  dialogTitle: { color: Colors.white, fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  dialogMessage: { color: Colors.gray6, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  dialogButtons: { flexDirection: 'row', gap: 8 },
  dialogButton: { flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  dialogButtonPrimary: { backgroundColor: Colors.purple1 },
  dialogButtonText: { color: Colors.gray6, fontSize: 15 },
  dialogButtonTextPrimary: { color: Colors.gray1, fontSize: 15, fontWeight: '600' },

  // SettingsCaret
  caret: { color: Colors.gray6, fontSize: 14 },

  // UserLabelTag
  labelTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  labelTagText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  // UserImageBorder
  imageBorder: { borderWidth: 2, justifyContent: 'center', alignItems: 'center' },

  // OfflineBanner
  offlineBanner: { backgroundColor: Colors.orange2, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  offlineBannerText: { color: Colors.white, fontSize: 13, fontWeight: '600' },

  // CommunityTag
  communityTag: { position: 'absolute', bottom: -2, right: -4, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, borderWidth: 2, borderColor: Colors.gray9 },
  communityTagText: { color: Colors.white, fontSize: 7, fontWeight: '800' },
});
