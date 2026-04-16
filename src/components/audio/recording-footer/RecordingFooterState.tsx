/**
 * RecordingFooterState — core recording UI logic.
 * Ported from squad-demo/src/components/audio/recording-footer/RecordingFooterState.tsx.
 *
 * Manages expand/collapse animation, microphone permission flow,
 * recording lifecycle (idle -> recording -> preview), playback of the
 * recorded clip, and submission.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  LayoutAnimation,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Colors } from '../../../theme/ThemeContext';
import Button from '../../ux/buttons/Button';
import { Circle } from '../../ux/shapes/Shapes';
import { BodySmall } from '../../ux/text/Typography';
import PlaybackButton from './PlaybackButton';
import RecordButton from './RecordButton';
import { RecordingTimer, RecordingTimerStatus } from './RecordingTimer';
import SendButton from './SendButton';

export interface RecordingFooterStateProps {
  /** Called with the local file URI when the user taps Send. */
  onSubmit: (filepath: string) => void;
  /** Disables the record button entirely. */
  disabled?: boolean;
  /** Shows a loading spinner on the Send button. */
  loading?: boolean;
  /** Bottom safe-area inset to account for (defaults to 32). */
  bottomInset?: number;
}

type RecordingPhase = 'idle' | 'recording' | 'preview';

export default function RecordingFooterState({
  onSubmit,
  disabled,
  loading,
  bottomInset = 32,
}: RecordingFooterStateProps) {
  // --- State ---
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  // --- Refs ---
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingUriRef = useRef<string | null>(null);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // --- Stop playback when app goes to background ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        soundRef.current?.pauseAsync().catch(() => {});
        setIsPlaying(false);
      }
    });
    return () => subscription.remove();
  }, []);

  // --- Expand / Collapse with LayoutAnimation ---
  const changeExpanded = useCallback((value: boolean) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'linear', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.9 },
    });
    setExpanded(value);
  }, []);

  const expand = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
    }
    changeExpanded(true);
  }, [changeExpanded]);

  const collapse = useCallback(async () => {
    changeExpanded(false);
    setPhase('idle');
    setIsPlaying(false);
    setPlaybackPosition(0);
    setRecordedDuration(0);

    // Tear down active recording / sound.
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {}
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}
    recordingUriRef.current = null;
  }, [changeExpanded]);

  // --- Recording ---

  const startRecording = useCallback(async () => {
    try {
      // Ensure permissions.
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Dispose of any previous sound.
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setPhase('recording');
    } catch (err) {
      console.error('[RecordingFooter] Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      recordingUriRef.current = uri;

      // Compute recorded duration.
      if (uri) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound, status } = await Audio.Sound.createAsync({ uri });
        if (status.isLoaded && status.durationMillis) {
          setRecordedDuration(Math.ceil(status.durationMillis / 1000));
        }
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      setPhase('preview');
    } catch (err) {
      console.error('[RecordingFooter] Failed to stop recording:', err);
      setPhase('idle');
    }
  }, []);

  // --- Timer expired (60 s limit) ---
  const handleTimerExpired = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // --- Record button tap ---
  const handleRecordButtonPress = useCallback(() => {
    if (!expanded) {
      expand();
      // Start recording immediately after expanding.
      startRecording();
      return;
    }

    if (phase === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [expanded, phase, expand, startRecording, stopRecording]);

  // --- Playback ---

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setPlaybackPosition(Math.floor(status.positionMillis / 1000));

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // --- Submit ---

  const handleSubmit = useCallback(async () => {
    if (!recordingUriRef.current) return;
    setUploading(true);
    onSubmit(recordingUriRef.current);
    collapse();
    setUploading(false);
  }, [onSubmit, collapse]);

  // --- Derive timer status ---

  const timerStatus: RecordingTimerStatus =
    isPlaying
      ? 'playing'
      : phase === 'recording'
        ? 'recording'
        : phase === 'preview'
          ? 'stopped'
          : 'idle';

  // --- Render ---

  return (
    <View
      style={[
        styles.footer,
        expanded ? styles.footerContentExpanded : styles.footerContentCollapsed,
        { marginBottom: -bottomInset },
      ]}
    >
      {expanded && (
        <RecordingTimer
          status={timerStatus}
          onTimerExpired={handleTimerExpired}
          recordedDuration={recordedDuration}
          playbackPosition={playbackPosition}
        />
      )}

      <View style={styles.recordingButtons}>
        {expanded && (
          <PlaybackButton
            isPlaying={isPlaying}
            onPress={togglePlayback}
            disabled={phase === 'recording' || phase === 'idle'}
          />
        )}

        <View style={expanded ? undefined : styles.microphoneButtonCollapsed}>
          <RecordButton
            isRecording={phase === 'recording'}
            onPress={handleRecordButtonPress}
            disabled={disabled || uploading}
          />
        </View>

        {expanded && (
          <SendButton
            onPress={handleSubmit}
            disabled={phase !== 'preview'}
            loading={loading}
          />
        )}
      </View>

      {/* Close button — absolutely positioned, must appear after content for press handling */}
      {expanded && (
        <Button onPress={collapse} style={styles.closeButton}>
          <Circle size={32} color={Colors.gray2}>
            <BodySmall style={styles.closeIcon}>X</BodySmall>
          </Circle>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  closeIcon: {
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: Colors.gray1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  footerContentCollapsed: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  footerContentExpanded: {
    marginTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  microphoneButtonCollapsed: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingVertical: 16,
  },
  recordingButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
