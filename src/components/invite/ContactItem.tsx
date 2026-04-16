/**
 * ContactItem - Device contact row with thumbnail, name, phone, and Invite button.
 * Ported from squad-demo/src/screens/invite/ContactsItem.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyMedium, SubtitleSmall, BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import ContactThumbnail from './ContactThumbnail';

export type ContactItemContact = {
  id: string;
  name: string;
  phoneNumbers: string[];
  imageUri?: string | null;
  initials?: string;
};

export type ContactItemProps = {
  contact: ContactItemContact;
  sendInvite: (contact: ContactItemContact) => void;
  style?: ViewStyle;
};

export default function ContactItem({
  contact,
  sendInvite,
  style,
}: ContactItemProps) {
  const handleInviteContact = useCallback(
    () => sendInvite(contact),
    [contact, sendInvite],
  );

  return (
    <View style={[styles.container, style]}>
      <ContactThumbnail
        imageUrl={contact.imageUri}
        initials={contact.initials}
        size={56}
      />
      <View style={styles.text}>
        <SubtitleSmall style={styles.primary}>{contact.name}</SubtitleSmall>
        {contact.phoneNumbers[0] && (
          <BodySmall style={styles.secondary}>
            via SMS: {contact.phoneNumbers[0]}
          </BodySmall>
        )}
        <BodySmall style={styles.context}>invite to 741</BodySmall>
      </View>
      <Button onPress={handleInviteContact} style={styles.button}>
        <BodyMedium style={styles.buttonContent}>Invite</BodyMedium>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: 16,
  },
  buttonContent: {
    color: Colors.white,
    marginLeft: 8,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  context: {
    color: Colors.gray6,
  },
  primary: {
    color: Colors.white,
  },
  secondary: {
    color: Colors.gray8,
  },
  text: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
});
