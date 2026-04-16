import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import { useMessageUpdates } from '../../realtime/useRealtimeSync';
import { OfflineQueue } from '../../realtime/OfflineQueue';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import MessageCard from '../../components/message/MessageCard';
import Button from '../../components/ux/buttons/Button';
import { BodySmall } from '../../components/ux/text/Typography';

type Route = RouteProp<RootStackParamList, 'Messaging'>;

interface MessageItem {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  createdAt: string;
  isOwn: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
}

export function MessagingScreen() {
  const route = useRoute<Route>();
  const apiClient = useApiClient();
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const { connectionId } = route.params;
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const conversation = await apiClient.getMessages(connectionId);
      if (conversation?.messages) {
        const loggedInUser = await apiClient.getLoggedInUser();
        const myId = loggedInUser?.id;

        const items: MessageItem[] = conversation.messages.map((m: any) => ({
          id: m.id,
          text: m.text,
          audioUrl: m.audioUrl,
          audioDuration: m.audioDuration,
          senderId: m.sender?.id ?? '',
          senderName: m.sender?.displayName,
          senderImage: m.sender?.imageUrl,
          createdAt: m.createdAt ?? '',
          isOwn: m.sender?.id === myId,
          reactions: m.reactions?.map((r: any) => ({ emoji: r.emoji, count: r.count ?? 1 })),
        }));
        setMessages(items);
      }
    } catch (err) {
      console.error('[Messaging] Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [connectionId, apiClient]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Real-time message updates
  useMessageUpdates(connectionId, () => {
    loadMessages();
  });

  // Send text message
  const sendTextMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        text,
        senderId: 'me',
        createdAt: new Date().toISOString(),
        isOwn: true,
      },
    ]);

    try {
      const { Message } = await import('@squad-sports/core');
      const message = new Message({ text, connectionId } as any);
      const created = await apiClient.createMessage(message);

      if (created?.id) {
        setMessages(prev =>
          prev.map(m => m.id === tempId ? { ...m, id: created.id! } : m),
        );
      }
    } catch {
      // Queue for offline
      const offlineQueue = new OfflineQueue();
      offlineQueue.enqueue('message:create', { text, connectionId });
      // Keep optimistic message but mark it
    }
  }, [inputText, connectionId, apiClient]);

  // Audio recording
  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone access is required to send voice messages.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch {
      Alert.alert('Error', 'Failed to start recording.');
    }
  }, []);

  const stopAndSendRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;

        if (uri) {
          // Optimistic: show audio message immediately
          const tempId = `temp-audio-${Date.now()}`;
          setMessages(prev => [
            ...prev,
            {
              id: tempId,
              audioUrl: uri,
              audioDuration: recordingDuration * 1000,
              senderId: 'me',
              createdAt: new Date().toISOString(),
              isOwn: true,
            },
          ]);

          // Upload: create message then upload audio
          const { Message } = await import('@squad-sports/core');
          const message = new Message({ connectionId } as any);
          const created = await apiClient.createMessage(message);

          if (created?.id) {
            const response = await fetch(uri);
            const blob = await response.blob();
            const buffer = new Uint8Array(await (blob as any).arrayBuffer());
            await apiClient.uploadMessageAudio(created.id, buffer);

            setMessages(prev =>
              prev.map(m => m.id === tempId ? { ...m, id: created.id! } : m),
            );
          }
        }
      }
    } catch {
      console.error('[Messaging] Error sending audio message');
    }
  }, [connectionId, recordingDuration, apiClient]);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {}
  }, []);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const renderMessage = useCallback(
    ({ item }: { item: MessageItem }) => (
      <MessageCard
        id={item.id}
        text={item.text}
        audioUrl={item.audioUrl}
        audioDuration={item.audioDuration}
        isOwn={item.isOwn}
        senderName={item.senderName}
        senderImageUrl={item.senderImage}
        timestamp={item.createdAt}
        reactions={item.reactions}
        primaryColor={theme.buttonColor}
      />
    ),
    [theme.buttonColor],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Messages" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          {isRecording ? (
            // Recording mode
            <View style={styles.recordingBar}>
              <Pressable onPress={cancelRecording} style={styles.cancelRecord}>
                <Text style={styles.cancelRecordText}>x</Text>
              </Pressable>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <BodySmall style={styles.recordingTime}>{formatDuration(recordingDuration)}</BodySmall>
              </View>
              <Pressable
                style={[styles.sendRecordButton, { backgroundColor: theme.buttonColor }]}
                onPress={stopAndSendRecording}
              >
                <Text style={[styles.sendIcon, { color: theme.buttonText }]}>{'>'}</Text>
              </Pressable>
            </View>
          ) : (
            // Text mode
            <>
              <Pressable style={styles.micButton} onPress={startRecording}>
                <Text style={styles.micIcon}>{'M'}</Text>
              </Pressable>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={Colors.gray6}
                style={styles.input}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={sendTextMessage}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() ? theme.buttonColor : Colors.gray3 },
                ]}
                onPress={sendTextMessage}
                disabled={!inputText.trim()}
              >
                <Text style={[styles.sendIcon, { color: inputText.trim() ? theme.buttonText : Colors.gray6 }]}>
                  {'>'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  messageList: { padding: 16, gap: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray3,
  },
  micButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.gray2, justifyContent: 'center', alignItems: 'center',
  },
  micIcon: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  input: {
    flex: 1, backgroundColor: Colors.gray2, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.white, fontSize: 15, maxHeight: 100,
  },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  sendIcon: { fontSize: 18, fontWeight: '700' },

  // Recording mode
  recordingBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cancelRecord: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.gray3, justifyContent: 'center', alignItems: 'center',
  },
  cancelRecordText: { color: Colors.white, fontSize: 18, fontWeight: '300' },
  recordingIndicator: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  recordingDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.red,
  },
  recordingTime: { color: Colors.white, fontVariant: ['tabular-nums'] },
  sendRecordButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
});
