/**
 * AudioPlayerRow — audio player with waveform visualization.
 * Updated to include Waveform component matching squad-demo's PlayerRow.
 *
 * Supports two modes:
 *  1. With `levels` — renders a proper waveform visualization with per-bar
 *     progress tracking (ported from squad-demo Waveform + PlayerRow).
 *  2. Without `levels` — renders a simple progress bar (original SDK behavior).
 */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Colors } from '../../theme/ThemeContext';
import { BodySmall } from '../ux/text/Typography';
import Waveform from './Waveform';

interface AudioPlayerRowProps {
  /** Remote or local URI for the audio file. */
  audioUrl: string;
  /** Known duration in milliseconds (optional; discovered on load if omitted). */
  duration?: number;
  /** Audio level samples for waveform rendering. When provided, a full
   *  waveform is shown instead of the simple progress bar. */
  levels?: number[];
  /** Width of the waveform in px (only used when `levels` is provided). */
  waveformWidth?: number;
  /** Height of the waveform in px. */
  waveformHeight?: number;
  /** Color for unfilled waveform bars. */
  waveformColor?: string;
  /** Color for filled (played) waveform bars. */
  waveformFilledColor?: string;
  /** Called when playback begins. */
  onPlayStarted?: () => void;
  /** Called when playback finishes. */
  onPlayFinished?: () => void;
}

function AudioPlayerRow({
  audioUrl,
  duration: initialDuration,
  levels,
  waveformWidth = 160,
  waveformHeight = 32,
  waveformColor = Colors.apricot,
  waveformFilledColor = Colors.red,
  onPlayStarted,
  onPlayFinished,
}: AudioPlayerRowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(initialDuration ?? 0);
  const [isLoaded, setIsLoaded] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      setPosition(status.positionMillis);
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }

      const progress = status.durationMillis
        ? status.positionMillis / status.durationMillis
        : 0;

      progressAnim.setValue(progress);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        progressAnim.setValue(0);
        onPlayFinished?.();
      }
    },
    [progressAnim, onPlayFinished],
  );

  const loadSound = useCallback(async () => {
    if (soundRef.current) return soundRef.current;

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: false },
      onPlaybackStatusUpdate,
    );
    soundRef.current = sound;
    setIsLoaded(true);
    return sound;
  }, [audioUrl, onPlaybackStatusUpdate]);

  const togglePlayback = useCallback(async () => {
    try {
      const sound = await loadSound();

      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        await sound.playAsync();
        setIsPlaying(true);
        onPlayStarted?.();
      }
    } catch (err) {
      console.error('[AudioPlayer] Error:', err);
    }
  }, [isPlaying, loadSound, onPlayStarted]);

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Derive position in seconds for waveform progress.
  const positionSeconds = duration > 0 ? position / 1000 : 0;
  const durationSeconds = duration > 0 ? duration / 1000 : 0;

  return (
    <View style={styles.container}>
      {/* Play / Pause button */}
      <Pressable style={styles.playButton} onPress={togglePlayback}>
        <View style={[styles.playIcon, isPlaying && styles.pauseIcon]}>
          {isPlaying ? (
            <View style={styles.pauseBars}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.playTriangle} />
          )}
        </View>
      </Pressable>

      {/* Waveform or simple progress bar */}
      {levels && levels.length > 0 ? (
        <Waveform
          color={waveformColor}
          width={waveformWidth}
          height={waveformHeight}
          levels={levels}
          duration={durationSeconds}
          position={positionSeconds}
          filledColor={waveformFilledColor}
        />
      ) : (
        <View style={styles.waveformContainer}>
          <View style={styles.waveformBg}>
            <Animated.View
              style={[
                styles.waveformFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Duration / position text */}
      <BodySmall style={styles.duration}>
        {formatMs(isPlaying ? position : duration)}
      </BodySmall>
    </View>
  );
}

export { AudioPlayerRow };
export default memo(AudioPlayerRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray3,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 10,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {},
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: Colors.gray1,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 3,
  },
  pauseBar: {
    width: 3,
    height: 14,
    backgroundColor: Colors.gray1,
    borderRadius: 1,
  },
  waveformContainer: {
    flex: 1,
    height: 4,
  },
  waveformBg: {
    flex: 1,
    backgroundColor: Colors.gray5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  waveformFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  duration: {
    color: Colors.gray6,
    minWidth: 32,
    textAlign: 'right',
  },
});
