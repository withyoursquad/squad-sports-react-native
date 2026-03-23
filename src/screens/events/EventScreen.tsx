import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import UserImage from '../../components/ux/user-image/UserImage';
import { TitleSmall, TitleMedium, BodyRegular, BodyMedium, BodySmall } from '../../components/ux/text/Typography';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  imageUrl?: string;
  attendeeCount: number;
  isAttending: boolean;
}

export function EventScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getEvents();
        if (data?.events) {
          setEvents(data.events.map((e: any) => ({
            id: e.id,
            title: e.title ?? '',
            description: e.description,
            date: e.startDate ?? e.date,
            location: e.location,
            imageUrl: e.imageUrl,
            attendeeCount: e.attendeeCount ?? 0,
            isAttending: e.isAttending ?? false,
          })));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [apiClient]);

  const toggleAttendance = useCallback(async (eventId: string, isAttending: boolean) => {
    try {
      if (isAttending) {
        await apiClient.removeAttendee(eventId);
      } else {
        await apiClient.setAttendee(eventId);
      }
      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, isAttending: !isAttending, attendeeCount: e.attendeeCount + (isAttending ? -1 : 1) }
          : e
      ));
    } catch {}
  }, [apiClient]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Events" />

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && (
              <View style={styles.cardImagePlaceholder}>
                <BodySmall style={styles.cardImageText}>Event Image</BodySmall>
              </View>
            )}
            <View style={styles.cardContent}>
              <TitleSmall style={styles.eventTitle}>{item.title}</TitleSmall>
              {item.date && (
                <BodyMedium style={styles.eventDate}>{formatDate(item.date)}</BodyMedium>
              )}
              {item.location && (
                <BodySmall style={styles.eventLocation}>{item.location}</BodySmall>
              )}
              {item.description && (
                <BodyRegular style={styles.eventDesc} numberOfLines={2}>{item.description}</BodyRegular>
              )}

              <View style={styles.cardFooter}>
                <BodySmall style={styles.attendeeCount}>
                  {item.attendeeCount} attending
                </BodySmall>
                <Button
                  style={[
                    styles.attendButton,
                    item.isAttending
                      ? styles.attendButtonActive
                      : { backgroundColor: theme.buttonColor },
                  ]}
                  onPress={() => toggleAttendance(item.id, item.isAttending)}
                >
                  <Text style={[
                    styles.attendButtonText,
                    item.isAttending ? styles.attendButtonTextActive : { color: theme.buttonText },
                  ]}>
                    {item.isAttending ? 'Going' : 'Attend'}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <BodyRegular style={styles.emptyText}>No upcoming events</BodyRegular>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 24, gap: 16 },
  card: { backgroundColor: Colors.gray2, borderRadius: 16, overflow: 'hidden' },
  cardImagePlaceholder: {
    height: 140, backgroundColor: Colors.gray3,
    justifyContent: 'center', alignItems: 'center',
  },
  cardImageText: { color: Colors.gray6 },
  cardContent: { padding: 16 },
  eventTitle: { color: Colors.white, marginBottom: 4 },
  eventDate: { color: Colors.purple1, marginBottom: 2 },
  eventLocation: { color: Colors.gray6, marginBottom: 8 },
  eventDesc: { color: Colors.gray6, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendeeCount: { color: Colors.gray6 },
  attendButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16 },
  attendButtonActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.green },
  attendButtonText: { fontSize: 13, fontWeight: '600' },
  attendButtonTextActive: { color: Colors.green },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { color: Colors.gray6 },
});
