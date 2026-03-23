/**
 * Squaddie of the Day (SOTD) components.
 * Ported from squad-demo/src/components/SOTD/*.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { TitleSmall, BodyRegular, BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

// --- SotdButton (locked/unlocked states) ---
export function SotdButton({
  isUnlocked, userName, userImageUrl, onPress, primaryColor = Colors.purple1,
}: { isUnlocked: boolean; userName?: string; userImageUrl?: string; onPress: () => void; primaryColor?: string }) {
  return (
    <Pressable style={[styles.sotdButton, { borderColor: primaryColor }]} onPress={onPress} accessibilityRole="button" accessibilityLabel="Squaddie of the Day">
      {isUnlocked && userImageUrl ? (
        <UserImage imageUrl={userImageUrl} displayName={userName} size={44} />
      ) : (
        <View style={[styles.sotdLocked, { backgroundColor: primaryColor }]}>
          <Text style={styles.sotdLockedText}>SOTD</Text>
        </View>
      )}
    </Pressable>
  );
}

// --- CurrentSotdUser ---
export function CurrentSotdUser({ userName, userImageUrl }: { userName: string; userImageUrl?: string }) {
  return (
    <View style={styles.currentSotd}>
      <UserImage imageUrl={userImageUrl} displayName={userName} size={64} />
      <TitleSmall style={styles.currentSotdName}>{userName}</TitleSmall>
      <BodySmall style={styles.currentSotdLabel}>Squaddie of the Day</BodySmall>
    </View>
  );
}

// --- SOTD Intro Bottom Sheet ---
export function SOTDIntroBottomSheet({ onStart, onDismiss }: { onStart: () => void; onDismiss: () => void }) {
  return (
    <View style={styles.introSheet}>
      <Text style={styles.introEmoji}>trophy</Text>
      <TitleSmall style={styles.introTitle}>Squaddie of the Day</TitleSmall>
      <BodyRegular style={styles.introDesc}>
        Each day, one member of your squad gets the spotlight. Claim your moment!
      </BodyRegular>
      <Button style={styles.introButton} onPress={onStart}>
        <Text style={styles.introButtonText}>Let's Go!</Text>
      </Button>
    </View>
  );
}

// --- SOTD Selecting Bottom Sheet ---
export function SOTDSelectingBottomSheet({
  connections, onSelect, onDismiss,
}: { connections: Array<{ id: string; name: string; imageUrl?: string }>; onSelect: (id: string) => void; onDismiss: () => void }) {
  return (
    <View style={styles.selectSheet}>
      <TitleSmall style={styles.selectTitle}>Choose your Squaddie</TitleSmall>
      {connections.map(c => (
        <Pressable key={c.id} style={styles.selectRow} onPress={() => onSelect(c.id)}>
          <UserImage imageUrl={c.imageUrl} displayName={c.name} size={44} />
          <BodyRegular style={styles.selectName}>{c.name}</BodyRegular>
        </Pressable>
      ))}
    </View>
  );
}

// --- SOTDTag ---
export function SOTDTag() {
  return (
    <View style={styles.sotdTag}>
      <Text style={styles.sotdTagText}>SOTD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sotdButton: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  sotdLocked: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sotdLockedText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  currentSotd: { alignItems: 'center', padding: 16 },
  currentSotdName: { color: Colors.white, marginTop: 8 },
  currentSotdLabel: { color: Colors.gold, marginTop: 2 },
  introSheet: { padding: 24, alignItems: 'center' },
  introEmoji: { fontSize: 48, marginBottom: 16, color: Colors.gold },
  introTitle: { color: Colors.white, marginBottom: 8 },
  introDesc: { color: Colors.gray6, textAlign: 'center', marginBottom: 24 },
  introButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, backgroundColor: Colors.purple1 },
  introButtonText: { color: Colors.gray1, fontWeight: '600', fontSize: 15 },
  selectSheet: { padding: 16 },
  selectTitle: { color: Colors.white, marginBottom: 16 },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  selectName: { color: Colors.white, flex: 1 },
  sotdTag: { backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  sotdTagText: { color: Colors.gray1, fontSize: 8, fontWeight: '800' },
});
