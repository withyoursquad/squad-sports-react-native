import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '../SquadProvider';
import { SquadLineClient, type CallState, type CallInfo } from './SquadLineClient';

/**
 * React hook for Squad Line voice calling.
 * Wraps SquadLineClient for easy consumption in components.
 */
export function useSquadLine() {
  const apiClient = useApiClient();
  const [callState, setCallState] = useState<CallState>('idle');
  const [currentCall, setCurrentCall] = useState<CallInfo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);

  const client = SquadLineClient.getInstance(apiClient);

  useEffect(() => {
    const onCallStateChanged = (state: CallState) => setCallState(state);
    const onMuteChanged = (muted: boolean) => setIsMuted(muted);
    const onSpeakerChanged = (speaker: boolean) => setIsSpeakerOn(speaker);
    const onIncomingCall = (info: CallInfo) => setIncomingCall(info);
    const onConnected = (info: CallInfo) => {
      setCurrentCall(info);
      setIncomingCall(null);
    };
    const onDisconnected = () => {
      setCurrentCall(null);
      setIncomingCall(null);
    };

    client.on('callStateChanged', onCallStateChanged);
    client.on('muteChanged', onMuteChanged);
    client.on('speakerChanged', onSpeakerChanged);
    client.on('incomingCall', onIncomingCall);
    client.on('connected', onConnected);
    client.on('disconnected', onDisconnected);

    return () => {
      client.off('callStateChanged', onCallStateChanged);
      client.off('muteChanged', onMuteChanged);
      client.off('speakerChanged', onSpeakerChanged);
      client.off('incomingCall', onIncomingCall);
      client.off('connected', onConnected);
      client.off('disconnected', onDisconnected);
    };
  }, [client]);

  const makeCall = useCallback(
    (connectionId: string, title: string, calleeIdentity?: string) =>
      client.makeCall(connectionId, title, calleeIdentity),
    [client],
  );

  const endCall = useCallback(() => client.endCall(), [client]);
  const acceptCall = useCallback(() => client.acceptCall(), [client]);
  const rejectCall = useCallback(() => client.rejectCall(), [client]);
  const toggleMute = useCallback(() => client.toggleMute(), [client]);
  const toggleSpeaker = useCallback(() => client.toggleSpeaker(), [client]);
  const sendReaction = useCallback(
    (emoji: string, imageUrl?: string) => client.sendReaction(emoji, imageUrl),
    [client],
  );

  return {
    callState,
    currentCall,
    incomingCall,
    isMuted,
    isSpeakerOn,
    makeCall,
    endCall,
    acceptCall,
    rejectCall,
    toggleMute,
    toggleSpeaker,
    sendReaction,
  };
}
