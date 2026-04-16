/**
 * FreestyleReplyCard — Card variant for message threads with reply lines.
 * Shows thread context (reply lines) and handles pending/uploading/failed states.
 * Ported from squad-demo/src/components/freestyle/card/FreestyleReplyCard.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Colors, useTheme } from '../../../theme/ThemeContext';
import { BodySmall, SubtitleSmall } from '../../ux/text/Typography';
import UserImage from '../../ux/user-image/UserImage';
import { AudioPlayerRow } from '../../audio/AudioPlayerRow';

type FreestyleReplyCardProps = {
  freestyle: {
    id?: string;
    prompt?: string;
    contentUrl?: string;
    emoji?: string;
    createdAt?: Date | string;
    expiresAt?: Date | string;
    creator?: {
      id?: string;
      displayName?: string;
      imageUri?: string;
    };
    metadata?: {
      duration?: number;
      levels?: number[];
    };
  };
  onMessageFeed?: boolean;
  hasPrevious?: boolean;
  isMine?: boolean;
  status?: 'pending' | 'uploading' | 'sent' | 'failed';
  onPlayFinished?: () => void;
  routeName?: string;
};

export default function FreestyleReplyCard({
  freestyle,
  onMessageFeed,
  hasPrevious,
  isMine,
  status,
  onPlayFinished,
  routeName = 'Thread',
}: FreestyleReplyCardProps) {
  const { theme } = useTheme();

  const handlePlayFinished = useCallback(() => {
    onPlayFinished?.();
  }, [onPlayFinished]);

  if (!freestyle.creator) {
    return null;
  }

  const createdAtStr =
    freestyle.createdAt instanceof Date
      ? freestyle.createdAt.toISOString()
      : freestyle.createdAt;

  const expiresAtStr =
    freestyle.expiresAt instanceof Date
      ? freestyle.expiresAt.toISOString()
      : freestyle.expiresAt;

  return (
    <View style={hasPrevious ? styles.hasPreviousPadding : undefined}>
      {/* Thread reply line for messages from others */}
      {onMessageFeed && !isMine && (
        <View style={[styles.threadLineTheirs, { transform: [{ scaleX: -1 }] }]}>
          <View style={styles.threadLineSvg} />
        </View>
      )}

      <View style={styles.card}>
        {/* Top row: avatar + prompt text + timing */}
        <View style={styles.cardTopRow}>
          <UserImage
            imageUrl={freestyle.creator.imageUri}
            displayName={freestyle.creator.displayName}
            size={40}
          />
          <View style={styles.prompt}>
            <SubtitleSmall style={styles.promptText}>
              {freestyle.prompt}
            </SubtitleSmall>
            <View style={styles.timingTextSection}>
              {createdAtStr && (
                <BodySmall style={styles.timingText}>
                  {timeSinceText(createdAtStr)}
                </BodySmall>
              )}
              <Text style={styles.timingTextSeparator}>{'\u00B7'}</Text>
              {expiresAtStr && (
                <BodySmall style={styles.timingText}>
                  {expiresText(expiresAtStr)}
                </BodySmall>
              )}
            </View>
          </View>
        </View>

        {/* Audio player or status indicator */}
        {status === 'pending' || status === 'uploading' ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Processing voice message...</Text>
          </View>
        ) : status === 'failed' ? (
          <View style={styles.statusContainer}>
            <Text style={styles.failedText}>Failed to send. Please try again.</Text>
          </View>
        ) : freestyle.contentUrl ? (
          <AudioPlayerRow
            audioUrl={freestyle.contentUrl}
            duration={freestyle.metadata?.duration}
            onPlayFinished={handlePlayFinished}
          />
        ) : null}
      </View>

      {/* Thread reply line for own messages */}
      {onMessageFeed && isMine && (
        <View style={styles.threadLine}>
          <View style={styles.threadLineSvg} />
        </View>
      )}
    </View>
  );
}

// --- Time helpers ---

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

function timeSinceText(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  return `${Math.floor(diff / DAY)}d ago`;
}

function expiresText(dateString: string): string {
  const diff = new Date(dateString).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  if (diff < HOUR) return `Expires in ${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `Expires in ${Math.floor(diff / HOUR)}h`;
  return `Expires in ${Math.floor(diff / DAY)}d`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.black,
    borderColor: Colors.gray5,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 23,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  hasPreviousPadding: {
    marginBottom: 20,
  },
  prompt: {
    marginLeft: 16,
    flex: 1,
  },
  promptText: {
    color: Colors.white,
  },
  threadLine: {
    backgroundColor: Colors.transparent,
    left: '4%',
    position: 'absolute',
    top: '100%',
  },
  threadLineTheirs: {
    backgroundColor: Colors.transparent,
    right: '4%',
    position: 'absolute',
    top: '100%',
  },
  threadLineSvg: {
    width: 30,
    height: 30,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.gray5,
    borderBottomLeftRadius: 12,
  },
  timingText: {
    color: Colors.gray6,
  },
  timingTextSection: {
    flexDirection: 'row',
    marginTop: 2,
  },
  timingTextSeparator: {
    color: Colors.gray6,
    marginHorizontal: 3,
  },
  statusContainer: {
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    color: Colors.gray6,
  },
  failedText: {
    color: Colors.red,
  },
});
