import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Colors } from '../theme/ThemeContext';
import { useSquadLine } from './useSquadLine';

/**
 * Full-screen overlay displayed when receiving an incoming Squad Line call.
 * Shows caller info with accept/decline buttons.
 */
export function IncomingCallOverlay() {
  const { incomingCall, acceptCall, rejectCall } = useSquadLine();

  if (!incomingCall) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {incomingCall.remoteCaller?.displayName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>

        <Text style={styles.callerName}>
          {incomingCall.remoteCaller?.displayName ?? 'Unknown'}
        </Text>
        <Text style={styles.callTitle}>
          {incomingCall.title}
        </Text>
        <Text style={styles.subtitle}>Squad Line</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.declineButton} onPress={rejectCall}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 120,
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.purple1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  callerName: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  callTitle: {
    color: Colors.gray6,
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.gray6,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 48,
  },
  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
