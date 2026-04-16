/**
 * Squad Circle Display — circular arrangement of squad members.
 * Ported from squad-demo/src/screens/home/CircleDisplay.tsx.
 *
 * Displays up to 5 squad members in a circle layout:
 *   Top row: 1 member (88px)
 *   Center row: 2 members (80px, 64px)
 *   Bottom row: 2 members (72px, 64px)
 *
 * Empty slots show "+" placeholders.
 */
import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodyMedium, TitleSmall } from '../ux/text/Typography';
import type { Connection } from '@squad-sports/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_PADDING = 56;

type CircleSize = 56 | 64 | 72 | 80 | 88;
const diameters: CircleSize[] = [88, 80, 72, 64, 56];

function getOtherUser(connection: Connection, loggedInUserId?: string) {
  if ((connection as any).recipient?.id === loggedInUserId) {
    return (connection as any).creator;
  }
  return (connection as any).recipient ?? (connection as any).creator;
}

function MemberCircle({
  connection,
  size,
  loggedInUserId,
  primaryColor,
}: {
  connection: Connection | null;
  size: CircleSize;
  loggedInUserId?: string;
  primaryColor: string;
}) {
  const navigation = useNavigation();

  if (!connection) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: Colors.gray5,
          },
        ]}
      >
        <TitleSmall style={[styles.placeholderText, { color: primaryColor }]}>+</TitleSmall>
      </View>
    );
  }

  const other = getOtherUser(connection, loggedInUserId);
  const hasUnread = ((connection as any).unreadMessages ?? 0) > 0;

  return (
    <Pressable
      onPress={() =>
        (navigation as any).navigate('Profile', { userId: other?.id ?? '' })
      }
    >
      <View style={[styles.memberContainer, hasUnread && styles.memberContainerWithBubble]}>
        <UserImage
          imageUrl={other?.imageUrl}
          displayName={other?.displayName}
          size={size}
          borderColor={Colors.black}
        />
        {hasUnread && (
          <View style={[styles.chatBubble, { backgroundColor: Colors.orange1 }]}>
            <BodyMedium style={styles.chatBubbleText}>{'~'}</BodyMedium>
          </View>
        )}
      </View>
    </Pressable>
  );
}

interface SquadCircleDisplayProps {
  connections: Connection[];
  loggedInUserId?: string;
  isLoading?: boolean;
  primaryColor?: string;
}

function SquadCircleDisplay({
  connections,
  loggedInUserId,
  isLoading = false,
  primaryColor = Colors.purple1,
}: SquadCircleDisplayProps) {
  const { theme, baseThemeColors } = useTheme();
  const circleSize = SCREEN_WIDTH - CIRCLE_PADDING * 2;
  const mainSquad = connections.slice(0, 5);

  // Pad with nulls for open slots
  const slots: Array<Connection | null> = [...mainSquad];
  while (slots.length < 5) slots.push(null);

  // Row arrangement matches squad-demo exactly
  const topMember = slots[0] ?? null;
  const centerLeft = slots[1] ?? null;
  const centerRight: Connection | null =
    mainSquad.length === 3 || mainSquad.length === 4 ? (slots[2] ?? null) : (slots[4] ?? null);
  const centerRightSize: CircleSize =
    mainSquad.length === 3 || mainSquad.length === 4 ? (diameters[2] as CircleSize) : (diameters[4] as CircleSize);
  const bottomLeft: Connection | null =
    mainSquad.length === 3 || mainSquad.length === 4 ? null : (slots[2] ?? null);
  const bottomRight: Connection | null = slots[3] ?? null;
  const bottomRightSize: CircleSize =
    mainSquad.length === 3 || mainSquad.length === 4 ? (diameters[2] as CircleSize) : (diameters[3] as CircleSize);

  return (
    <View style={styles.container}>
      {/* Outer circle border */}
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: Colors.squadCircle,
          },
        ]}
      />

      {/* Member rows */}
      <View style={styles.rowsContainer}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={[styles.topRowCenter, { paddingTop: (diameters[0] as number) / 5 }]}>
            <MemberCircle
              connection={topMember}
              size={diameters[0] as CircleSize}
              loggedInUserId={loggedInUserId}
              primaryColor={primaryColor}
            />
          </View>
        </View>

        {/* Center row */}
        <View style={styles.centerRow}>
          <View style={styles.centerRowInner}>
            <MemberCircle
              connection={centerLeft}
              size={diameters[1] as CircleSize}
              loggedInUserId={loggedInUserId}
              primaryColor={primaryColor}
            />
            <MemberCircle
              connection={centerRight}
              size={centerRightSize}
              loggedInUserId={loggedInUserId}
              primaryColor={primaryColor}
            />
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomRowInner}>
            {bottomLeft && (
              <MemberCircle
                connection={bottomLeft}
                size={diameters[2] as CircleSize}
                loggedInUserId={loggedInUserId}
                primaryColor={primaryColor}
              />
            )}
            {bottomRight && (
              <MemberCircle
                connection={bottomRight}
                size={bottomRightSize}
                loggedInUserId={loggedInUserId}
                primaryColor={primaryColor}
              />
            )}
          </View>
        </View>
      </View>

      {/* Loading indicator */}
      {isLoading && mainSquad.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.white} />
        </View>
      )}

      {/* "Get 3 Shifters" message */}
      {mainSquad.length < 3 && (
        <BodyMedium
          style={[
            styles.shiftMessage,
            {
              color: theme.isDarkMode
                ? baseThemeColors.primaryGreyColor
                : baseThemeColors.primaryTextColor,
            },
          ]}
        >
          Get 3 Shifters to join your circle
        </BodyMedium>
      )}
    </View>
  );
}

export default memo(SquadCircleDisplay, (prev, next) => {
  return (
    prev.isLoading === next.isLoading &&
    prev.connections === next.connections &&
    prev.loggedInUserId === next.loggedInUserId
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: SCREEN_WIDTH,
    justifyContent: 'center',
    width: '100%',
  },
  circle: {
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
  },
  rowsContainer: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  topRow: {
    flex: 1,
  },
  topRowCenter: {
    alignSelf: 'center',
  },
  centerRow: {
    flex: 1,
    justifyContent: 'center',
  },
  centerRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CIRCLE_PADDING,
  },
  bottomRow: {
    flex: 1,
  },
  bottomRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: CIRCLE_PADDING,
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '300',
  },
  memberContainer: {
    backgroundColor: Colors.black,
    borderRadius: 999,
  },
  memberContainerWithBubble: {
    marginHorizontal: 5,
  },
  chatBubble: {
    position: 'absolute',
    bottom: '0%',
    left: '60%',
    right: '0%',
    top: '-5%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 20,
  },
  chatBubbleText: {
    color: Colors.white,
    fontSize: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  shiftMessage: {
    width: '35%',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
