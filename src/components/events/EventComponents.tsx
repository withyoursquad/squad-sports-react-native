/**
 * Event components.
 * Ported from squad-demo/src/components/events/*.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { TitleSmall, BodyRegular, BodyMedium, BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

// --- EventCard ---
export const EventCard = memo(function EventCard({
  id, title, date, location, attendeeCount, isAttending, imageUrl,
  onPress, onToggleAttend, primaryColor = Colors.purple1,
}: {
  id: string; title: string; date?: string; location?: string;
  attendeeCount: number; isAttending: boolean; imageUrl?: string;
  onPress?: () => void; onToggleAttend?: () => void; primaryColor?: string;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {imageUrl && <View style={styles.cardImage}><BodySmall style={styles.cardImageText}>Event</BodySmall></View>}
      <View style={styles.cardContent}>
        <TitleSmall style={styles.cardTitle}>{title}</TitleSmall>
        {date && <BodyMedium style={[styles.cardDate, { color: primaryColor }]}>{date}</BodyMedium>}
        {location && <BodySmall style={styles.cardLocation}>{location}</BodySmall>}
        <View style={styles.cardFooter}>
          <BodySmall style={styles.attendeeCount}>{attendeeCount} attending</BodySmall>
          <Button
            style={[styles.attendBtn, isAttending ? styles.attendBtnActive : { backgroundColor: primaryColor }]}
            onPress={onToggleAttend}
          >
            <Text style={[styles.attendBtnText, isAttending && styles.attendBtnTextActive]}>
              {isAttending ? 'Going' : 'Attend'}
            </Text>
          </Button>
        </View>
      </View>
    </Pressable>
  );
});

// --- EventsHeader ---
export function EventsHeader({ title = 'Events' }: { title?: string }) {
  return (
    <View style={styles.header}>
      <TitleSmall style={styles.headerTitle}>{title}</TitleSmall>
    </View>
  );
}

// --- EventsAttendeesBottomSheet ---
export function EventsAttendeesBottomSheet({
  attendees, title = 'Attendees',
}: { attendees: Array<{ id: string; name: string; imageUrl?: string }>; title?: string }) {
  return (
    <View>
      <TitleSmall style={styles.attendeesTitle}>{title} ({attendees.length})</TitleSmall>
      <FlatList
        data={attendees}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.attendeeRow}>
            <UserImage imageUrl={item.imageUrl} displayName={item.name} size={40} />
            <BodyRegular style={styles.attendeeName}>{item.name}</BodyRegular>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.gray2, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  cardImage: { height: 140, backgroundColor: Colors.gray3, justifyContent: 'center', alignItems: 'center' },
  cardImageText: { color: Colors.gray6 },
  cardContent: { padding: 16 },
  cardTitle: { color: Colors.white, marginBottom: 4 },
  cardDate: { marginBottom: 2 },
  cardLocation: { color: Colors.gray6, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendeeCount: { color: Colors.gray6 },
  attendBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16 },
  attendBtnActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.green },
  attendBtnText: { color: Colors.gray1, fontSize: 13, fontWeight: '600' },
  attendBtnTextActive: { color: Colors.green },
  header: { paddingHorizontal: 24, paddingVertical: 12 },
  headerTitle: { color: Colors.white },
  attendeesTitle: { color: Colors.white, paddingHorizontal: 16, paddingVertical: 12 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  attendeeName: { color: Colors.white },
});
