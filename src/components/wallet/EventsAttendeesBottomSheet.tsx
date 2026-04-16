/**
 * EventsAttendeesBottomSheet.tsx
 * List of event attendees in a scrollable bottom sheet.
 * Ported from squad-demo/src/components/wallet/EventsAttendeesBottomSheet.tsx
 */
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall } from '../ux/text/Typography';
import EventsAttendeesUserItem, { AttendeeUser } from './EventsAttendeesUserItem';

export type EventsAttendeesBottomSheetProps = {
  /** List of attendees to display. */
  attendees: AttendeeUser[];
  /** Optional tab/header name override. */
  tabName?: string;
};

export default function EventsAttendeesBottomSheet({
  attendees,
  tabName,
}: EventsAttendeesBottomSheetProps) {
  const headerLabel = tabName || `Shifters Going (${attendees?.length || 0})`;

  return (
    <View style={styles.container}>
      <TitleSmall style={styles.title}>{headerLabel}</TitleSmall>
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventsAttendeesUserItem user={item} />
        )}
        style={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  listContainer: {
    marginTop: 24,
  },
  title: {
    color: Colors.white,
    textAlign: 'center',
  },
});
