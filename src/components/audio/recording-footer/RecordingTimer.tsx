/**
 * RecordingTimer — countdown timer with color-coded states.
 * Ported from squad-demo/src/components/audio/recording-footer/RecordingTimer.tsx.
 *
 * - White text normally
 * - Orange (apricot) at 6-15 seconds remaining while recording
 * - Red at <= 5 seconds remaining while recording
 * - Shows "Recording" label with red dot while recording
 * - Shows "Listening..." while playing back
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../theme/ThemeContext';
import { BodyRegular, TitleSmall } from '../../ux/text/Typography';
import { Circle } from '../../ux/shapes/Shapes';

export type RecordingTimerStatus = 'idle' | 'recording' | 'stopped' | 'playing';

interface RecordingTimerProps {
  /** Current status of the recorder / player. */
  status: RecordingTimerStatus;
  /** Called when countdown reaches zero. */
  onTimerExpired?: () => void;
  /** Duration of recorded audio in seconds (set after recording stops). */
  recordedDuration?: number;
  /** Current playback position in seconds. */
  playbackPosition?: number;
}

function formatTime(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RecordingTimer({
  status,
  onTimerExpired,
  recordedDuration = 0,
  playbackPosition = 0,
}: RecordingTimerProps) {
  const [timer, setTimer] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isRecording = status === 'recording';
  const isPlaying = status === 'playing';

  // Start / stop the countdown interval based on recording state.
  useEffect(() => {
    if (isRecording) {
      setTimer(60);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isRecording]);

  // When timer reaches zero, fire the expiry callback.
  useEffect(() => {
    if (timer <= 0 && isRecording) {
      onTimerExpired?.();
    }
  }, [timer, isRecording, onTimerExpired]);

  // Determine what time value to display.
  const displayTime = isPlaying
    ? playbackPosition
    : isRecording
      ? timer
      : recordedDuration > 0
        ? recordedDuration
        : timer;

  return (
    <View style={styles.timer}>
      <View>
        {/* Status label */}
        <View style={styles.recordingTextContainer}>
          {!isPlaying && !isRecording && (
            <BodyRegular style={styles.recordingTextContainerHidden}> </BodyRegular>
          )}
          {isPlaying && (
            <BodyRegular style={styles.listeningText}>Listening...</BodyRegular>
          )}
          {isRecording && (
            <>
              <Circle size={10} color={Colors.red} />
              <BodyRegular style={styles.recordingText}>Recording</BodyRegular>
            </>
          )}
        </View>

        {/* Time display */}
        <TitleSmall
          style={
            timer <= 5 && isRecording
              ? styles.timerWarning
              : timer < 16 && timer >= 6 && isRecording
                ? styles.timerCaution
                : styles.timerText
          }
        >
          {formatTime(displayTime)}
        </TitleSmall>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listeningText: {
    color: Colors.gray6,
  },
  recordingText: {
    color: Colors.red,
    marginLeft: 4,
  },
  recordingTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  recordingTextContainerHidden: {
    opacity: 0,
  },
  timer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  timerCaution: {
    color: Colors.apricot,
    textAlign: 'center',
  },
  timerText: {
    color: Colors.white,
    textAlign: 'center',
  },
  timerWarning: {
    color: Colors.red,
    textAlign: 'center',
  },
});
