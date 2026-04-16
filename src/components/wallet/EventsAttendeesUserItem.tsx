/**
 * EventsAttendeesUserItem.tsx
 * Individual attendee row in the attendees list.
 * Ported from squad-demo/src/components/wallet/EventsAttendeesBottomSheetUserItem.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodyMedium, TitleTiny } from '../ux/text/Typography';

export type AttendeeUser = {
  id: string;
  displayName?: string;
  imageUrl?: string;
  communityId?: string;
};

export type EventsAttendeesUserItemProps = {
  /** The attendee user to display. */
  user: AttendeeUser;
  /** Whether this user is in the logged-in user's squad. */
  isSquaddy?: boolean;
};

export default function EventsAttendeesUserItem({
  user,
  isSquaddy = false,
}: EventsAttendeesUserItemProps) {
  return (
    <View style={styles.container}>
      <UserImage
        size={56}
        imageUrl={user.imageUrl}
        displayName={user.displayName}
      />
      <View style={styles.textContainer}>
        <TitleTiny style={styles.name}>{user.displayName}</TitleTiny>
        {isSquaddy && (
          <BodyMedium style={styles.squadLabel}>in your circle</BodyMedium>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  name: {
    color: Colors.white,
  },
  squadLabel: {
    color: Colors.gray11,
  },
  textContainer: {
    marginLeft: 16,
  },
});
