/**
 * Audio recording components — full recording stack.
 * Ported from squad-demo/src/components/audio/recording-footer/.
 * Components: RecordButton, PlaybackButton, SendButton, RecordingTimer, RecordingFooter.
 */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../../../theme/ThemeContext';

// --- RecordButton ---
export function RecordButton({
  isRecording,
  onPressIn,
  onPressOut,
  color = Colors.purple1,
}: { isRecording: boolean; onPressIn: () => void; onPressOut: () => void; color?: string }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.recordButton, isRecording && styles.recordButtonActive, { borderColor: isRecording ? Colors.red : color }]}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <View style={styles.stopIcon} />
        ) : (
          <View style={[styles.micIcon, { backgroundColor: color }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

// --- PlaybackButton ---
export function PlaybackButton({
  isPlaying,
  onPress,
}: { isPlaying: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.playbackButton} onPress={onPress} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
      {isPlaying ? (
        <View style={styles.pauseIcon}>
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </View>
      ) : (
        <View style={styles.playIcon} />
      )}
    </Pressable>
  );
}

// --- SendButton ---
export function SendButton({ onPress, disabled, color = Colors.purple1 }: { onPress: () => void; disabled?: boolean; color?: string }) {
  return (
    <Pressable
      style={[styles.sendButton, { backgroundColor: disabled ? Colors.gray3 : color }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Send"
    >
      <Text style={[styles.sendIcon, { color: disabled ? Colors.gray6 : Colors.gray1 }]}>{'>'}</Text>
    </Pressable>
  );
}

// --- RecordingTimer ---
export function RecordingTimer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <Text style={styles.timer} accessibilityLabel={`Recording: ${m} minutes ${s} seconds`}>
      {m}:{s.toString().padStart(2, '0')}
    </Text>
  );
}

// --- Waveform ---
export function Waveform({ levels, progress = 0, color = Colors.white }: { levels?: number[]; progress?: number; color?: string }) {
  const bars = levels ?? Array.from({ length: 30 }, () => Math.random());
  const filledBars = Math.floor(bars.length * progress);

  return (
    <View style={styles.waveformContainer}>
      {bars.map((level, i) => (
        <View
          key={i}
          style={[
            styles.waveformBar,
            { height: 4 + level * 20, backgroundColor: i < filledBars ? color : Colors.gray5 },
          ]}
        />
      ))}
    </View>
  );
}

// --- RecordingFooter ---
export interface RecordingFooterProps {
  onRecordingComplete: (uri: string, durationMs: number) => void;
  onCancel?: () => void;
  primaryColor?: string;
  disabled?: boolean;
}

export function RecordingFooter({ onRecordingComplete, onCancel, primaryColor = Colors.purple1, disabled }: RecordingFooterProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {}
  }, []);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordingUri(uri);
        recordingRef.current = null;
        setState('preview');
      }
    } catch { setState('idle'); }
  }, []);

  const handleSend = useCallback(() => {
    if (recordingUri) {
      onRecordingComplete(recordingUri, seconds * 1000);
      setRecordingUri(null);
      setState('idle');
      setSeconds(0);
    }
  }, [recordingUri, seconds, onRecordingComplete]);

  const handleCancel = useCallback(() => {
    setRecordingUri(null);
    setState('idle');
    setSeconds(0);
    onCancel?.();
  }, [onCancel]);

  if (disabled) return null;

  return (
    <View style={styles.footer}>
      {state === 'idle' && (
        <RecordButton isRecording={false} onPressIn={startRecording} onPressOut={() => {}} color={primaryColor} />
      )}
      {state === 'recording' && (
        <View style={styles.recordingRow}>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>x</Text>
          </Pressable>
          <View style={styles.recordingCenter}>
            <View style={styles.recordingDot} />
            <RecordingTimer seconds={seconds} />
          </View>
          <Pressable onPress={stopRecording} style={[styles.stopButton, { backgroundColor: primaryColor }]}>
            <View style={styles.stopIconSmall} />
          </Pressable>
        </View>
      )}
      {state === 'preview' && (
        <View style={styles.previewRow}>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>x</Text>
          </Pressable>
          <RecordingTimer seconds={seconds} />
          <SendButton onPress={handleSend} color={primaryColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  recordButton: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(110,130,231,0.1)' },
  recordButtonActive: { backgroundColor: 'rgba(255,68,120,0.1)' },
  micIcon: { width: 18, height: 28, borderRadius: 9 },
  stopIcon: { width: 20, height: 20, borderRadius: 4, backgroundColor: Colors.red },
  playbackButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  pauseIcon: { flexDirection: 'row', gap: 3 },
  pauseBar: { width: 3, height: 14, backgroundColor: Colors.gray1, borderRadius: 1 },
  playIcon: { width: 0, height: 0, borderLeftWidth: 10, borderTopWidth: 6, borderBottomWidth: 6, borderLeftColor: Colors.gray1, borderTopColor: 'transparent', borderBottomColor: 'transparent', marginLeft: 2 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { fontSize: 18, fontWeight: '700' },
  timer: { color: Colors.white, fontSize: 16, fontVariant: ['tabular-nums'], fontWeight: '300' },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 24 },
  waveformBar: { width: 3, borderRadius: 1.5 },
  footer: { padding: 16, alignItems: 'center' },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%' },
  recordingCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.red },
  cancelButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray3, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: Colors.white, fontSize: 18, fontWeight: '300' },
  stopButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stopIconSmall: { width: 14, height: 14, borderRadius: 2, backgroundColor: Colors.white },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'space-between' },
});
