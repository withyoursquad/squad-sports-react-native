/**
 * Freestyle Creation — prompt selection + audio recording.
 * Ported from squad-demo/src/screens/FreestyleCreation.tsx.
 *
 * Flow:
 *   1. Prompt carousel shows pages of selectable prompts
 *   2. User picks a prompt → enables recording
 *   3. Record button expands into full recording UI (timer + playback + send)
 *   4. Submit creates freestyle, uploads audio, navigates back
 *   5. Loading overlay during upload
 */
import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import PromptCarousel, {
  type PromptPage,
  type PromptOption,
  type SelectedPrompt,
} from '../../components/freestyle/PromptCarousel';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodySmall } from '../../components/ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading';

export function FreestyleCreationScreen() {
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPrompt | null>(null);
  const [prompts, setPrompts] = useState<PromptPage[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const schedule = await apiClient.getFreestylePrompts();
        if (schedule && (schedule as any).prompts) {
          const pages: PromptPage[] = ((schedule as any).prompts as any[]).map((p: any) => ({
            title: p.body ?? '',
            options: (p.options ?? []).map((o: any) => ({
              id: o.id ?? '',
              body: o.body ?? '',
              emoji: o.decoration?.value ?? o.emoji ?? '',
              emojiType: o.decoration?.case ?? 'emoji',
            })),
          }));
          setPrompts(pages);
        }
      } catch (err) {
        console.error('[FreestyleCreation] Failed to load prompts:', err);
      } finally {
        setPromptsLoading(false);
      }
    };
    loadPrompts();
  }, [apiClient]);

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
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [navigation]);

  const handlePromptSelect = useCallback((option: PromptOption, title: string) => {
    setSelectedPrompt({ option, promptTitle: title });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 59) {
            // Auto-stop at 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

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
    setIsPosting(true);

    try {
      const response = await fetch(recordingUri);
      const blob = await response.blob();
      const buffer = new Uint8Array(await (blob as any).arrayBuffer());

      const { Freestyle } = await import('@squad-sports/core');
      const freestyle = new Freestyle({
        emoji: selectedPrompt?.option.emoji,
        prompt: selectedPrompt?.promptTitle,
      });
      const created = await apiClient.createFreestyle(freestyle);

      if (created?.id) {
        await apiClient.uploadFreestyleAudio(created.id, buffer);
      }

      navigation.goBack();
    } catch (err) {
      console.error('[FreestyleCreation] Error submitting:', err);
      Alert.alert('Upload Failed', 'Failed to post your freestyle. Please try again.');
      setState('recorded');
    } finally {
      setIsPosting(false);
    }
  }, [recordingUri, apiClient, navigation, selectedPrompt]);

  const discard = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingUri(null);
    setState('idle');
    setDuration(0);
  }, []);

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

  const timerColor =
    duration >= 55 ? Colors.red :
    duration >= 45 ? Colors.orange1 :
    Colors.white;

  const recordingDisabled = !selectedPrompt || isPosting;

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="POST FREESTYLE" />

      {/* Prompt Selection Carousel */}
      <PromptCarousel
        prompts={prompts}
        selected={selectedPrompt}
        onSelect={handlePromptSelect}
        loading={promptsLoading}
      />

      {/* Recording Footer */}
      <View style={styles.recorderContainer} pointerEvents="box-none">
        {!selectedPrompt && !promptsLoading && prompts.length > 0 && (
          <View style={styles.tooltipContainer}>
            <BodySmall style={styles.tooltipText}>
              Select a prompt to start recording your Freestyle
            </BodySmall>
          </View>
        )}

        <View style={styles.recordingFooter}>
          {(state === 'recording' || state === 'recorded') && (
            <View style={styles.recordingControls}>
              {/* Timer */}
              <Text style={[styles.timer, { color: timerColor }]}>
                {formatTime(duration)}
              </Text>

              {/* Recording status */}
              <View style={styles.statusRow}>
                {state === 'recording' && (
                  <View style={styles.statusBadge}>
                    <View style={styles.redDot} />
                    <BodySmall style={styles.statusText}>Recording</BodySmall>
                  </View>
                )}
                {state === 'recorded' && (
                  <BodySmall style={styles.statusText}>Ready to post</BodySmall>
                )}
              </View>

              {/* Playback button (recorded state) */}
              {state === 'recorded' && (
                <Pressable style={styles.playbackButton} onPress={playback}>
                  <Text style={[styles.playIcon, { color: theme.buttonColor }]}>{'>'}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Record / Stop button */}
          <Animated.View style={{ transform: [{ scale: state === 'recording' ? pulseAnim : 1 }] }}>
            <Pressable
              style={[
                styles.recordButton,
                state === 'recording' && styles.recordButtonActive,
                { borderColor: state === 'recording' ? Colors.red : theme.buttonColor },
                recordingDisabled && styles.recordButtonDisabled,
              ]}
              onPress={
                state === 'idle' && !recordingDisabled ? startRecording
                : state === 'recording' ? stopRecording
                : undefined
              }
              disabled={recordingDisabled && state === 'idle'}
            >
              {state === 'recording' ? (
                <View style={styles.stopIcon} />
              ) : (
                <View style={[
                  styles.micIcon,
                  { backgroundColor: recordingDisabled ? Colors.gray6 : theme.buttonColor },
                ]} />
              )}
            </Pressable>
          </Animated.View>

          {/* Action hint */}
          <BodySmall style={styles.recordHint}>
            {state === 'idle' && (recordingDisabled ? 'Select a prompt first' : 'Tap to record')}
            {state === 'recording' && 'Tap to stop'}
            {state === 'recorded' && ''}
            {state === 'uploading' && 'Uploading...'}
          </BodySmall>

          {/* Discard + Submit buttons */}
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

          {/* Close button when recording/recorded */}
          {(state === 'recording' || state === 'recorded') && (
            <Pressable style={styles.closeButton} onPress={discard}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Loading overlay */}
      {isPosting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.white} />
            <BodyRegular style={styles.loadingText}>
              Posting your freestyle...
            </BodyRegular>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Recorder container overlay
  recorderContainer: {
    position: 'absolute',
    height: '100%',
    width: SCREEN_WIDTH,
    justifyContent: 'flex-end',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    color: Colors.gray6,
    backgroundColor: Colors.gray2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // Recording footer
  recordingFooter: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 16,
  },
  recordingControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  statusText: {
    color: Colors.gray6,
  },
  playbackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Record button
  recordButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 130, 231, 0.1)',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 68, 120, 0.1)',
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  recordButtonDisabled: {
    borderColor: Colors.gray5,
    backgroundColor: 'rgba(61, 61, 61, 0.2)',
  },
  micIcon: {
    width: 24,
    height: 36,
    borderRadius: 12,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  recordHint: {
    color: Colors.gray6,
  },

  // Footer buttons
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    width: '100%',
  },
  discardButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray5,
  },
  discardText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Close button
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingContent: {
    backgroundColor: Colors.black,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginTop: 10,
  },
});
