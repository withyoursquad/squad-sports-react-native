/**
 * Invite Screen — contacts list with search, QR code, and squad management.
 * Ported from squad-demo/src/screens/Invite.tsx + ListView.tsx.
 *
 * Features:
 *   - Search contacts or enter phone number
 *   - QR code invite link
 *   - Contacts on Squad section (users to add)
 *   - Pending requests (sent + received)
 *   - Device contacts (alphabetical sections)
 *   - Max 8 squad members enforcement
 *   - Share invite link
 */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Pressable,
  ActivityIndicator,
  FlatList,
  TextInput,
  SectionList,
  Alert,
} from 'react-native';
// expo-contacts is an optional peer dependency
let Contacts: any;
try {
  Contacts = require('expo-contacts');
} catch {
  // expo-contacts not installed
}

import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import UserImage from '../../components/ux/user-image/UserImage';
import Button from '../../components/ux/buttons/Button';
import {
  TitleMedium,
  TitleSmall,
  BodyRegular,
  BodyMedium,
  BodySmall,
} from '../../components/ux/text/Typography';
import type { Connection } from '@squad-sports/core';

const MAX_SQUAD_SIZE = 12;

interface ContactItem {
  id: string;
  name: string;
  phone?: string;
  imageUrl?: string;
  type: 'squad_user' | 'invite_sent' | 'invite_received' | 'device_contact';
  userId?: string;
}

// Dynamic import for QR code (optional peer dep)
let QRCode: React.ComponentType<{ value: string; size: number; backgroundColor: string; color: string }> | null = null;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch {}

export function InviteScreen() {
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [deviceContacts, setDeviceContacts] = useState<ContactItem[]>([]);
  const [contactsPermission, setContactsPermission] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const inviteUrl = inviteCode
    ? `https://app.withyoursquad.com/invite/${inviteCode}`
    : '';

  const remainingSlots = MAX_SQUAD_SIZE - connections.filter(
    (c: any) => c.status === 2 // ACCEPTED
  ).length;

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [codeResult, squadResult] = await Promise.all([
          apiClient.getInvitationCode().catch(() => null),
          apiClient.getUserConnections().catch(() => null),
        ]);
        setInviteCode(codeResult?.code ?? null);
        setConnections(squadResult?.connections ?? []);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [apiClient]);

  // Request contacts permission and load
  useEffect(() => {
    const loadContacts = async () => {
      if (!Contacts) {
        setContactsPermission(false);
        return;
      }
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
          setContactsPermission(false);
          return;
        }
        setContactsPermission(true);

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields?.PhoneNumbers, Contacts.Fields?.Name, Contacts.Fields?.Image].filter(Boolean),
          sort: Contacts.SortTypes?.FirstName,
        });

        const mapped: ContactItem[] = data
          .filter((c: any) => c.phoneNumbers && c.phoneNumbers.length > 0)
          .map((c: any) => ({
            id: c.id ?? c.name ?? '',
            name: c.name ?? '',
            phone: c.phoneNumbers?.[0]?.number,
            imageUrl: (c as any).image?.uri,
            type: 'device_contact' as const,
          }));

        setDeviceContacts(mapped);
      } catch (err) {
        console.error('[Invite] Error loading contacts:', err);
      }
    };
    loadContacts();
  }, []);

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!searchText.trim()) return deviceContacts;
    const q = searchText.toLowerCase();
    return deviceContacts.filter(
      c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  }, [deviceContacts, searchText]);

  // Build sections for SectionList
  const sections = useMemo(() => {
    const sectionMap: Record<string, ContactItem[]> = {};
    filteredContacts.forEach(c => {
      const initial = (c.name[0] ?? '#').toUpperCase();
      if (!sectionMap[initial]) sectionMap[initial] = [];
      sectionMap[initial]!.push(c);
    });
    return Object.entries(sectionMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filteredContacts]);

  const shareCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join my squad on Squad Sports! Use code: ${inviteCode}\n\n${inviteUrl}`,
      });
    } catch {}
  }, [inviteCode, inviteUrl]);

  const copyCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [inviteCode]);

  const sendInvite = useCallback(async (contact: ContactItem) => {
    if (remainingSlots <= 0) {
      Alert.alert('Squad Full', 'Your squad is full (max 8 members). Remove someone to invite more.');
      return;
    }
    try {
      await Share.share({
        message: `Join my squad on Squad Sports!\n\n${inviteUrl}`,
      });
    } catch {}
  }, [remainingSlots, inviteUrl]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader
        title="INVITE FRIENDS"
        right={
          <Pressable onPress={() => setShowQr(!showQr)}>
            <View style={styles.qrToggle}>
              <BodySmall style={styles.qrToggleText}>{showQr ? 'List' : 'QR'}</BodySmall>
            </View>
          </Pressable>
        }
      />

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts or enter phone number"
            placeholderTextColor={Colors.gray6}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* QR Code Section */}
        {showQr ? (
          <View style={styles.qrSection}>
            {inviteCode && QRCode ? (
              <View style={styles.qrContainer}>
                <QRCode
                  value={inviteUrl}
                  size={180}
                  backgroundColor={Colors.white}
                  color={Colors.gray1}
                />
              </View>
            ) : inviteCode ? (
              <Pressable style={styles.codePill} onPress={copyCode}>
                <TitleSmall style={styles.codeText}>{inviteCode}</TitleSmall>
                <BodySmall style={[styles.copyHint, copied && { color: Colors.green }]}>
                  {copied ? 'Copied!' : 'Tap to copy'}
                </BodySmall>
              </Pressable>
            ) : null}
            <BodyMedium style={styles.qrHint}>
              Others can scan this code to join your squad
            </BodyMedium>
            <Button
              style={[styles.shareButton, { backgroundColor: theme.buttonColor }]}
              onPress={shareCode}
              disabled={!inviteCode}
            >
              <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>
                Share Invite Link
              </Text>
            </Button>
          </View>
        ) : (
          <>
            {/* Squad capacity indicator */}
            <View style={styles.capacityRow}>
              <BodySmall style={styles.capacityText}>
                {remainingSlots > 0
                  ? `${remainingSlots} spot${remainingSlots === 1 ? '' : 's'} remaining`
                  : 'Squad is full (8/8)'}
              </BodySmall>
              <View style={styles.capacityDots}>
                {Array.from({ length: MAX_SQUAD_SIZE }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.capacityDot,
                      i < MAX_SQUAD_SIZE - remainingSlots
                        ? { backgroundColor: theme.buttonColor }
                        : { backgroundColor: Colors.gray5 },
                    ]}
                  />
                ))}
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.white} />
              </View>
            ) : !contactsPermission ? (
              <View style={styles.permissionContainer}>
                <TitleMedium style={styles.permissionTitle}>
                  Access Your Contacts
                </TitleMedium>
                <BodyRegular style={styles.permissionText}>
                  Allow access to your contacts to easily invite friends to your squad
                </BodyRegular>
                <Button
                  style={[styles.permissionButton, { backgroundColor: theme.buttonColor }]}
                  onPress={async () => {
                    if (!Contacts) return;
                    const { status } = await Contacts.requestPermissionsAsync();
                    setContactsPermission(status === 'granted');
                  }}
                >
                  <Text style={[styles.permissionButtonText, { color: theme.buttonText }]}>
                    Give Access
                  </Text>
                </Button>
              </View>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section }) => (
                  <View style={styles.sectionHeader}>
                    <TitleSmall style={styles.sectionHeaderText}>{section.title}</TitleSmall>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.contactRow}>
                    <UserImage
                      imageUrl={item.imageUrl}
                      displayName={item.name}
                      size={44}
                    />
                    <View style={styles.contactInfo}>
                      <BodyMedium style={styles.contactName}>{item.name}</BodyMedium>
                      {item.phone && (
                        <BodySmall style={styles.contactPhone}>{item.phone}</BodySmall>
                      )}
                    </View>
                    <Pressable
                      style={[
                        styles.inviteButton,
                        remainingSlots <= 0 && styles.inviteButtonDisabled,
                      ]}
                      onPress={() => sendInvite(item)}
                      disabled={remainingSlots <= 0}
                    >
                      <BodySmall
                        style={[
                          styles.inviteButtonText,
                          remainingSlots <= 0 && { color: Colors.gray6 },
                        ]}
                      >
                        Invite
                      </BodySmall>
                    </Pressable>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <BodyRegular style={styles.emptyText}>
                      {searchText ? 'No contacts found' : 'No contacts available'}
                    </BodyRegular>
                  </View>
                }
                stickySectionHeadersEnabled
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },

  // Search
  searchContainer: { marginBottom: 12 },
  searchInput: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
  },

  // Capacity
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  capacityText: { color: Colors.gray6 },
  capacityDots: { flexDirection: 'row', gap: 4 },
  capacityDot: { width: 8, height: 8, borderRadius: 4 },

  // QR section
  qrSection: { alignItems: 'center', paddingTop: 16 },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
  },
  codePill: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: { color: Colors.white, letterSpacing: 4, fontSize: 24 },
  copyHint: { color: Colors.gray6, marginTop: 4 },
  qrHint: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  qrToggle: {
    backgroundColor: Colors.gray2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qrToggleText: { color: Colors.white },
  shareButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: { fontSize: 16, fontWeight: '600' },

  // Section headers
  sectionHeader: {
    backgroundColor: Colors.gray9,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderText: { color: Colors.gray6, fontSize: 13 },

  // Contact rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  contactInfo: { flex: 1 },
  contactName: { color: Colors.white },
  contactPhone: { color: Colors.gray6 },
  inviteButton: {
    backgroundColor: Colors.purple1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inviteButtonDisabled: {
    backgroundColor: Colors.gray5,
  },
  inviteButtonText: { color: Colors.white, fontWeight: '600', fontSize: 13 },

  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: { color: Colors.white, marginBottom: 8, textAlign: 'center' },
  permissionText: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  permissionButtonText: { fontSize: 15, fontWeight: '600' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 48 },
  emptyText: { color: Colors.gray6 },
});
