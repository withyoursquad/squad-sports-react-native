import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useSquadLine } from '../../squad-line/useSquadLine';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import UserImage from '../../components/ux/user-image/UserImage';
import { BodyRegular, BodySmall } from '../../components/ux/text/Typography';
import type { User } from '@squad-sports/core';

type Route = RouteProp<RootStackParamList, 'AddCallTitle'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'AddCallTitle'>;

const MAX_TITLE_LENGTH = 30;

export function AddCallTitleScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const apiClient = useApiClient();
  const { makeCall } = useSquadLine();
  const { theme } = useTheme();

  const { connectionId } = route.params;
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const inputRef = useRef<TextInput>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Load the other user's info
  useEffect(() => {
    const load = async () => {
      try {
        const user = await apiClient.getUser(connectionId);
        setOtherUser(user);
      } catch {}
    };
    load();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [connectionId, apiClient]);

  // Animate progress ring
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: title.length / MAX_TITLE_LENGTH,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [title.length, progressAnim]);

  const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(title);
  const isValid = title.trim().length > 0 && title.length <= MAX_TITLE_LENGTH && !hasEmoji;

  const handleTitleChange = useCallback((text: string) => {
    if (text.length <= MAX_TITLE_LENGTH) {
      setTitle(text);
      setError(null);
    }
  }, []);

  const handleStartCall = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await makeCall(connectionId, title.trim());
      if (success) {
        navigation.navigate('ActiveCall', {
          connectionId,
          title: title.trim(),
        });
      } else {
        setError('Failed to start call. Please try again.');
      }
    } catch (err) {
      setError('Call failed. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isValid, isLoading, connectionId, title, makeCall, navigation]);

  const titleColor = title.length >= 25 ? Colors.orange1 : Colors.gray6;

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Squad Line" />

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <UserImage
              imageUrl={otherUser?.imageUrl}
              displayName={otherUser?.displayName}
              size={72}
            />
            {/* Progress ring overlay */}
            <View style={styles.progressRing}>
              <Animated.View
                style={[
                  styles.progressArc,
                  {
                    borderColor: theme.buttonColor,
                    transform: [{
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    }],
                  },
                ]}
              />
            </View>
          </View>

          {otherUser?.displayName && (
            <BodyRegular style={styles.userName}>
              {otherUser.displayName}
            </BodyRegular>
          )}
        </View>

        <View style={styles.titleSection}>
          <BodyRegular style={styles.prompt}>
            Tell {otherUser?.displayName ?? 'them'} why you're calling
          </BodyRegular>

          <TextInput
            ref={inputRef}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Enter a title..."
            placeholderTextColor={Colors.gray6}
            style={[styles.titleInput, { borderColor: title ? Colors.white : Colors.gray5 }]}
            maxLength={MAX_TITLE_LENGTH}
            returnKeyType="go"
            onSubmitEditing={handleStartCall}
            autoCorrect={false}
          />

          <View style={styles.titleMeta}>
            <Text style={[styles.charCount, { color: titleColor }]}>
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
            {hasEmoji && (
              <BodySmall style={styles.warning}>No emojis allowed</BodySmall>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <BodySmall style={styles.errorText}>{error}</BodySmall>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          style={[
            styles.callButton,
            { backgroundColor: isValid && !isLoading ? theme.buttonColor : Colors.gray2 },
          ]}
          onPress={handleStartCall}
          disabled={!isValid || isLoading}
        >
          <Text
            style={[
              styles.callButtonText,
              { color: isValid && !isLoading ? theme.buttonText : Colors.gray6 },
            ]}
          >
            {isLoading ? 'Connecting...' : 'Start Call'}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarRing: {
    position: 'relative',
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressArc: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  userName: {
    color: Colors.white,
    marginTop: 12,
    fontWeight: '600',
  },
  titleSection: {
    width: '100%',
    maxWidth: 400,
  },
  prompt: {
    color: Colors.gray6,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleInput: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: Colors.gray2,
  },
  titleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  charCount: {
    fontSize: 12,
  },
  warning: {
    color: Colors.orange1,
  },
  errorContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(233, 120, 92, 0.14)',
    borderRadius: 8,
  },
  errorText: {
    color: Colors.orange1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  callButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
