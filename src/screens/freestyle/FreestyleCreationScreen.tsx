import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodySmall } from '../../components/ux/text/Typography';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading';

export function FreestyleCreationScreen() {
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Request mic permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Access',
          'Squad needs microphone access to record freestyles. Please enable it in Settings.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };
    requestPermissions();

    return () => {
      // Cleanup recording on unmount
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [navigation]);

  const startRecording = useCallback(async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      setState('recording');
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } catch (err) {
      console.error('[FreestyleCreation] Failed to start recording:', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
    }
  }, [pulseAnim]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordingUri(uri);
        recordingRef.current = null;
      }
      setState('recorded');
    } catch (err) {
      console.error('[FreestyleCreation] Failed to stop recording:', err);
      setState('idle');
    }
  }, [pulseAnim]);

  const submitFreestyle = useCallback(async () => {
    if (!recordingUri) return;

    setState('uploading');

    try {
      // Read the audio file as bytes
      const response = await fetch(recordingUri);
      const blob = await response.blob();
      const buffer = new Uint8Array(await (blob as any).arrayBuffer());

      // Create freestyle via API (protobuf)
      const { Freestyle } = await import('@squad-sports/core');
      const freestyle = new Freestyle({});
      const created = await apiClient.createFreestyle(freestyle);

      if (created?.id) {
        // Upload audio to the created freestyle
        await apiClient.uploadFreestyleAudio(created.id, buffer);
      }

      navigation.goBack();
    } catch (err) {
      console.error('[FreestyleCreation] Error submitting:', err);
      Alert.alert('Upload Failed', 'Failed to post your freestyle. Please try again.');
      setState('recorded');
    }
  }, [recordingUri, apiClient, navigation]);

  const discard = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingUri(null);
    setState('idle');
    setDuration(0);
  }, []);

  // Playback for review
  const playback = useCallback(async () => {
    if (!recordingUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {}
  }, [recordingUri]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="New Freestyle" />

      <View style={styles.content}>
        <TitleMedium style={styles.prompt}>What's on your mind?</TitleMedium>
        <BodyRegular style={styles.hint}>
          Record an audio freestyle to share with your squad
        </BodyRegular>

        <View style={styles.recordingArea}>
          {(state === 'recording' || state === 'recorded') && (
            <Text style={styles.timer}>{formatTime(duration)}</Text>
          )}

          <Animated.View style={{ transform: [{ scale: state === 'recording' ? pulseAnim : 1 }] }}>
            <Pressable
              style={[
                styles.recordButton,
                state === 'recording' && styles.recordButtonActive,
                { borderColor: state === 'recording' ? Colors.red : theme.buttonColor },
              ]}
              onPress={
                state === 'idle' ? startRecording
                : state === 'recording' ? stopRecording
                : state === 'recorded' ? playback
                : undefined
              }
            >
              {state === 'recording' ? (
                <View style={styles.stopIcon} />
              ) : state === 'recorded' ? (
                <Text style={[styles.playIcon, { color: theme.buttonColor }]}>{'>'}</Text>
              ) : (
                <View style={[styles.micIcon, { backgroundColor: theme.buttonColor }]} />
              )}
            </Pressable>
          </Animated.View>

          <BodySmall style={styles.recordHint}>
            {state === 'idle' && 'Tap to record'}
            {state === 'recording' && 'Tap to stop'}
            {state === 'recorded' && 'Tap to preview'}
            {state === 'uploading' && 'Uploading...'}
          </BodySmall>
        </View>
      </View>

      {state === 'recorded' && (
        <View style={styles.footer}>
          <Button style={styles.discardButton} onPress={discard}>
            <Text style={styles.discardText}>Discard</Text>
          </Button>
          <Button
            style={[styles.submitButton, { backgroundColor: theme.buttonColor }]}
            onPress={submitFreestyle}
          >
            <Text style={[styles.submitText, { color: theme.buttonText }]}>
              Share Freestyle
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  prompt: { color: Colors.white, textAlign: 'center', marginBottom: 8 },
  hint: { color: Colors.gray6, textAlign: 'center', marginBottom: 48 },
  recordingArea: { alignItems: 'center', gap: 24 },
  timer: { color: Colors.white, fontSize: 48, fontWeight: '300', fontVariant: ['tabular-nums'] },
  recordButton: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(110, 130, 231, 0.1)',
  },
  recordButtonActive: { backgroundColor: 'rgba(255, 68, 120, 0.1)' },
  micIcon: { width: 24, height: 36, borderRadius: 12 },
  stopIcon: { width: 24, height: 24, borderRadius: 4, backgroundColor: Colors.red },
  playIcon: { fontSize: 28, fontWeight: '700' },
  recordHint: { color: Colors.gray6 },
  footer: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  discardButton: {
    flex: 1, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gray5,
  },
  discardText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  submitButton: { flex: 2, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600' },
});
