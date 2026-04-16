/**
 * Interaction timestamp displayed under a squad member avatar.
 * Ported from squad-demo/src/screens/home/SquaddyInteractionTimestamp.tsx
 *
 * Shows relative time like "5m ago", "2h ago", etc.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyMedium } from '../ux/text/Typography';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function getTimeSinceString(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
}

export interface SquaddyInteractionTimestampProps {
  /** Timestamp of the last message / interaction */
  lastMessageSentAt?: Date | string | number | null;
}

export default function SquaddyInteractionTimestamp({
  lastMessageSentAt,
}: SquaddyInteractionTimestampProps) {
  const { theme } = useTheme();

  const dateObj = useMemo(() => {
    if (!lastMessageSentAt) return null;
    if (lastMessageSentAt instanceof Date) return lastMessageSentAt;
    return new Date(lastMessageSentAt);
  }, [lastMessageSentAt]);

  if (!dateObj) return null;

  const timeSince = getTimeSinceString(dateObj);

  return (
    <View>
      <BodyMedium
        style={[
          styles.lastInteractionText,
          { color: (theme as any).baseThemeColors?.primaryGreyColor ?? Colors.gray6 },
        ]}
      >
        {timeSince}
      </BodyMedium>
    </View>
  );
}

const styles = StyleSheet.create({
  lastInteractionText: {
    color: Colors.gray6,
    textAlign: 'center',
  },
});
