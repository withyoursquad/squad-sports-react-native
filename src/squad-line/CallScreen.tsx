import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme, Colors } from '../theme/ThemeContext';
import { useSquadLine } from './useSquadLine';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Active call screen UI with caller info, timer, and controls.
 */
export function CallScreen() {
  const { theme } = useTheme();
  const {
    callState,
    currentCall,
    isMuted,
    isSpeakerOn,
    endCall,
    toggleMute,
    toggleSpeaker,
  } = useSquadLine();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (callState !== 'connected' || !currentCall?.startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - (currentCall.startTime ?? Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, currentCall?.startTime]);

  const statusText =
    callState === 'connecting' ? 'Connecting...'
    : callState === 'ringing' ? 'Ringing...'
    : callState === 'connected' ? formatDuration(elapsed)
    : callState === 'disconnected' ? 'Call Ended'
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <View style={styles.callerInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.buttonColor }]}>
          <Text style={styles.avatarText}>
            {currentCall?.remoteCaller?.displayName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.callerName}>
          {currentCall?.remoteCaller?.displayName ?? currentCall?.title ?? 'Call'}
        </Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.endCallButton]}
          onPress={endCall}
        >
          <Text style={styles.endCallIcon}>End</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          <Text style={styles.controlIcon}>{isSpeakerOn ? 'Ear' : 'Speaker'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  callerInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  callerName: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    color: Colors.gray6,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  controlIcon: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
