import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Colors } from '../../theme/ThemeContext';
import { BodySmall } from '../ux/text/Typography';

interface AudioPlayerRowProps {
  audioUrl: string;
  duration?: number;
}

function AudioPlayerRow({ audioUrl, duration: initialDuration }: AudioPlayerRowProps) {
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
  }, [audioUrl]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
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
    }
  }, [progressAnim]);

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
      }
    } catch (err) {
      console.error('[AudioPlayer] Error:', err);
    }
  }, [isPlaying, loadSound]);

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
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
