/**
 * All dialog components.
 * Ported from squad-demo/src/components/dialogs/*.
 * 17 dialog types: permission dialogs, confirmations, introductions.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';

// --- Base Dialog ---
interface BaseDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function BaseDialog({ visible, title, message, icon, confirmLabel = 'OK', cancelLabel = 'Cancel', destructive, onConfirm, onCancel }: BaseDialogProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} accessibilityRole="alert">
      <View style={styles.dialog}>
        {icon && <View style={styles.iconCircle}><Text style={styles.icon}>{icon}</Text></View>}
        <TitleSmall style={styles.title}>{title}</TitleSmall>
        <BodyRegular style={styles.message}>{message}</BodyRegular>
        <View style={styles.buttons}>
          <Button style={[styles.confirmBtn, destructive && styles.destructiveBtn]} onPress={onConfirm}>
            <Text style={[styles.confirmText, destructive && styles.destructiveText]}>{confirmLabel}</Text>
          </Button>
          <Button style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

// --- Permission Dialogs ---
export function MicrophonePermissionDialog({ visible, onAllow, onDeny }: { visible: boolean; onAllow: () => void; onDeny: () => void }) {
  return <BaseDialog visible={visible} title="Microphone Access" message="Squad needs microphone access to record freestyles and voice messages." icon="M" confirmLabel="Allow" onConfirm={onAllow} onCancel={onDeny} />;
}

export function CameraPermissionDialog({ visible, onAllow, onDeny }: { visible: boolean; onAllow: () => void; onDeny: () => void }) {
  return <BaseDialog visible={visible} title="Camera Access" message="Squad needs camera access to take profile photos." icon="C" confirmLabel="Allow" onConfirm={onAllow} onCancel={onDeny} />;
}

export function ImagesPermissionDialog({ visible, onAllow, onDeny }: { visible: boolean; onAllow: () => void; onDeny: () => void }) {
  return <BaseDialog visible={visible} title="Photo Library" message="Squad needs access to your photos for your profile picture." icon="I" confirmLabel="Allow" onConfirm={onAllow} onCancel={onDeny} />;
}

export function ContactPermissionDialog({ visible, onAllow, onDeny }: { visible: boolean; onAllow: () => void; onDeny: () => void }) {
  return <BaseDialog visible={visible} title="Contacts Access" message="Squad can find your friends who are already on the app." icon="P" confirmLabel="Allow" onConfirm={onAllow} onCancel={onDeny} />;
}

export function NotificationsPermissionDialog({ visible, onAllow, onDeny }: { visible: boolean; onAllow: () => void; onDeny: () => void }) {
  return <BaseDialog visible={visible} title="Notifications" message="Get notified when you receive messages, calls, and squad updates." icon="N" confirmLabel="Allow" onConfirm={onAllow} onCancel={onDeny} />;
}

// --- Confirmation Dialogs ---
export function DeleteConfirmationDialog({ visible, onConfirm, onCancel }: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <BaseDialog visible={visible} title="Delete" message="Are you sure? This action cannot be undone." confirmLabel="Delete" destructive onConfirm={onConfirm} onCancel={onCancel} />;
}

export function BlockConfirmationDialog({ visible, userName, onConfirm, onCancel }: { visible: boolean; userName: string; onConfirm: () => void; onCancel: () => void }) {
  return <BaseDialog visible={visible} title="Block User" message={`Are you sure you want to block ${userName}? They won't be able to contact you.`} confirmLabel="Block" destructive onConfirm={onConfirm} onCancel={onCancel} />;
}

export function UnblockConfirmationDialog({ visible, userName, onConfirm, onCancel }: { visible: boolean; userName: string; onConfirm: () => void; onCancel: () => void }) {
  return <BaseDialog visible={visible} title="Unblock User" message={`Unblock ${userName}?`} confirmLabel="Unblock" onConfirm={onConfirm} onCancel={onCancel} />;
}

export function FlagConfirmationDialog({ visible, onConfirm, onCancel }: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <BaseDialog visible={visible} title="Report Content" message="Are you sure you want to report this content? Our team will review it." confirmLabel="Report" destructive onConfirm={onConfirm} onCancel={onCancel} />;
}

export function RemoveFromSquadDialog({ visible, userName, onConfirm, onCancel }: { visible: boolean; userName: string; onConfirm: () => void; onCancel: () => void }) {
  return <BaseDialog visible={visible} title="Remove from Squad" message={`Remove ${userName} from your squad?`} confirmLabel="Remove" destructive onConfirm={onConfirm} onCancel={onCancel} />;
}

export function NoConnectionDialog({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return <BaseDialog visible={visible} title="No Connection" message="Please check your internet connection and try again." confirmLabel="OK" onConfirm={onDismiss} onCancel={onDismiss} />;
}

// --- Special Dialogs ---
export function VersionUpgradeDialog({ visible, onUpdate, onDismiss, hardLock = false }: { visible: boolean; onUpdate: () => void; onDismiss: () => void; hardLock?: boolean }) {
  return <BaseDialog visible={visible} title="Update Available" message={hardLock ? "A required update is available. Please update to continue." : "A new version is available with improvements."} confirmLabel="Update" cancelLabel={hardLock ? "" : "Later"} onConfirm={onUpdate} onCancel={onDismiss} />;
}

export function CollectEmailDialog({ visible, onSubmit, onDismiss }: { visible: boolean; onSubmit: (email: string) => void; onDismiss: () => void }) {
  return <BaseDialog visible={visible} title="Stay Connected" message="Enter your email to receive important updates about your squad." confirmLabel="Submit" onConfirm={() => onSubmit('')} onCancel={onDismiss} />;
}

export function ProgressCongratulationDialog({ visible, title, message, onDismiss }: { visible: boolean; title: string; message: string; onDismiss: () => void }) {
  return <BaseDialog visible={visible} title={title} message={message} confirmLabel="Awesome!" onConfirm={onDismiss} onCancel={onDismiss} />;
}

export function SquadLineInvitationDialog({ visible, callerName, onAccept, onDecline }: { visible: boolean; callerName: string; onAccept: () => void; onDecline: () => void }) {
  return <BaseDialog visible={visible} title="Squad Line" message={`${callerName} is inviting you to a call`} confirmLabel="Accept" cancelLabel="Decline" onConfirm={onAccept} onCancel={onDecline} />;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 32 },
  dialog: { backgroundColor: Colors.gray2, borderRadius: 20, padding: 32, width: '100%', maxWidth: 340, alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.purple1, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  icon: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  title: { color: Colors.white, marginBottom: 8, textAlign: 'center' },
  message: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  buttons: { width: '100%', gap: 8 },
  confirmBtn: { height: 48, borderRadius: 24, backgroundColor: Colors.purple1, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: Colors.gray1, fontSize: 15, fontWeight: '600' },
  destructiveBtn: { backgroundColor: Colors.red },
  destructiveText: { color: Colors.white },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: Colors.gray6, fontSize: 15 },
});
