/**
 * Activity stats panel — 2x2 grid of user metrics.
 * Ported from squad-demo/src/components/lounge/ActivityPanel.tsx.
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleMedium, BodyMedium } from '../ux/text/Typography';
import { Circle } from '../ux/shapes/Shapes';
import type { UserActivity } from '@squad-sports/core';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function ActivityItem({ value, label, emoji }: { value: number | undefined; label: string; emoji: string }) {
  if (value === undefined && value !== 0) return null;

  return (
    <View style={styles.itemContainer}>
      <Circle size={32} color="rgba(255,255,255,0.08)">
        <BodyMedium>{emoji}</BodyMedium>
      </Circle>
      <TitleMedium style={styles.itemValue}>{String(value ?? 0)}</TitleMedium>
      <BodyMedium style={styles.itemLabel}>{label}</BodyMedium>
    </View>
  );
}

export default function ActivityPanel({ activityData }: { activityData: UserActivity | null }) {
  if (!activityData) return null;

  return (
    <View style={styles.container}>
      <ActivityItem
        value={(activityData as any).messagesSent ?? (activityData as any).messageCount}
        label="Messages Sent"
        emoji="💬"
      />
      <ActivityItem
        value={(activityData as any).freestylesSent ?? (activityData as any).freestyleCount}
        label="Freestyles"
        emoji="🎙"
      />
      <ActivityItem
        value={(activityData as any).totalSquaddies ?? (activityData as any).squadCount}
        label="Total Shifters"
        emoji="👥"
      />
      <ActivityItem
        value={(activityData as any).pollResponses ?? (activityData as any).pollCount}
        label="Poll Responses"
        emoji="📊"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.1,
    padding: 16,
    width: '100%',
  },
  itemContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    height: 120,
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    width: '48%',
  },
  itemValue: {
    color: Colors.white,
  },
  itemLabel: {
    color: Colors.gray6,
  },
});
