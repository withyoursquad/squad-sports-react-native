/**
 * Voice Reply Overlay — overlay for recording a voice reply to a freestyle.
 * Ported from squad-demo/src/screens/lounge/FreestyleReply.tsx.
 */
import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../../theme/ThemeContext';
import { useApiClient } from '../../SquadProvider';
// Inline overlay (BlurOverlay doesn't support onClose)
import { TitleSmall, BodyRegular, BodySmall } from '../ux/text/Typography';

type ReplyStatus = 'idle' | 'recording' | 'recorded' | 'uploading' | 'sent' | 'failed';

interface VoiceReplyOverlayProps {
  visible: boolean;
  connectionId: string;
  freestyleId?: string;
  onClose: () => void;
  onSent?: () => void;
}

export default function VoiceReplyOverlay({
  visible,
  connectionId,
  freestyleId,
  onClose,
  onSent,
}: VoiceReplyOverlayProps) {
  const apiClient = useApiClient();
  const [status, setStatus] = useState<ReplyStatus>('idle');
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true } as any);
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setStatus('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } catch (err) {
      console.error('[VoiceReply] Record error:', err);
    }
  }, [pulseAnim]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        setStatus('recorded');
      }
    } catch {
      setStatus('idle');
    }
  }, [pulseAnim]);

  const submit = useCallback(async () => {
    if (!recordingRef.current) return;
    setStatus('uploading');
    try {
      const uri = recordingRef.current.getURI();
      if (!uri) throw new Error('No recording URI');

      const response = await fetch(uri);
      const blob = await response.blob();
      const buffer = new Uint8Array(await (blob as any).arrayBuffer());

      const { Message: Msg } = await import('@squad-sports/core');
      const msg = new Msg({});
      const created = await apiClient.createMessage(msg);
      if (created?.id) {
        await apiClient.uploadMessageAudio(created.id, buffer);
      }

      setStatus('sent');
      onSent?.();
      setTimeout(onClose, 500);
    } catch (err) {
      console.error('[VoiceReply] Submit error:', err);
      setStatus('failed');
    }
  }, [apiClient, connectionId, onClose, onSent]);

  const discard = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordingRef.current = null;
    setStatus('idle');
    setDuration(0);
  }, []);

  if (!visible) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.content}>
        <TitleSmall style={styles.title}>
          {freestyleId ? 'Reply to Freestyle' : 'Voice Message'}
        </TitleSmall>

        {(status === 'recording' || status === 'recorded') && (
          <Text style={styles.timer}>{formatTime(duration)}</Text>
        )}

        {status === 'recording' && (
          <View style={styles.statusBadge}>
            <View style={styles.redDot} />
            <BodySmall style={styles.statusText}>Recording</BodySmall>
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: status === 'recording' ? pulseAnim : 1 }] }}>
          <Pressable
            style={[
              styles.recordButton,
              status === 'recording' && styles.recordButtonActive,
            ]}
            onPress={
              status === 'idle' ? startRecording
              : status === 'recording' ? stopRecording
              : undefined
            }
          >
            {status === 'recording' ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.micIcon} />
            )}
          </Pressable>
        </Animated.View>

        {status === 'recorded' && (
          <View style={styles.actions}>
            <Pressable style={styles.discardBtn} onPress={discard}>
              <BodyRegular style={styles.discardText}>Discard</BodyRegular>
            </Pressable>
            <Pressable style={styles.sendBtn} onPress={submit}>
              <BodyRegular style={styles.sendText}>Send</BodyRegular>
            </Pressable>
          </View>
        )}

        {status === 'uploading' && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator color={Colors.white} size="small" />
            <BodySmall style={styles.uploadingText}>Sending...</BodySmall>
          </View>
        )}

        {status === 'sent' && (
          <BodyRegular style={styles.sentText}>Message sent!</BodyRegular>
        )}

        {status === 'failed' && (
          <View>
            <BodyRegular style={styles.failedText}>Failed to send</BodyRegular>
            <Pressable onPress={submit}>
              <BodySmall style={styles.retryText}>Retry</BodySmall>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { color: Colors.white, marginBottom: 24 },
  timer: { color: Colors.white, fontSize: 36, fontWeight: '300', fontVariant: ['tabular-nums'], marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  statusText: { color: Colors.gray6 },
  recordButton: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: Colors.purple1,
    backgroundColor: 'rgba(110,130,231,0.1)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  recordButtonActive: { borderColor: Colors.red, backgroundColor: 'rgba(255,68,120,0.1)', width: 88, height: 88, borderRadius: 44 },
  micIcon: { width: 20, height: 28, borderRadius: 10, backgroundColor: Colors.purple1 },
  stopIcon: { width: 20, height: 20, borderRadius: 3, backgroundColor: Colors.red },
  actions: { flexDirection: 'row', gap: 16 },
  discardBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: Colors.gray5 },
  discardText: { color: Colors.white },
  sendBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 20, backgroundColor: Colors.purple1 },
  sendText: { color: Colors.white, fontWeight: '600' },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  uploadingText: { color: Colors.gray6 },
  sentText: { color: Colors.green, marginTop: 12 },
  failedText: { color: Colors.red, marginBottom: 8 },
  retryText: { color: Colors.purple1, textAlign: 'center' },
});
