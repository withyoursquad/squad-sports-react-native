/**
 * Center row of the squad circle display (2 members, spaced apart).
 * Ported from squad-demo/src/screens/home/CircleDisplayCenterRow.tsx
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall } from '../ux/text/Typography';
import SquaddyImage from './SquaddyImage';
import type { SquadMemberCircleSize } from './circleDisplayConstants';

export interface CenterRowMember {
  displayName?: string;
  imageUrl?: string;
  hasUnreadMessage?: boolean;
  onPress?: () => void;
}

export interface CircleDisplayCenterRowProps {
  leftSquaddie?: CenterRowMember | null;
  leftSquaddieSize: SquadMemberCircleSize;
  rightSquaddie?: CenterRowMember | null;
  rightSquaddieSize: SquadMemberCircleSize;
  /** Primary color for "+" placeholders */
  primaryColor?: string;
}

export default function CircleDisplayCenterRow({
  leftSquaddie,
  leftSquaddieSize,
  rightSquaddie,
  rightSquaddieSize,
  primaryColor = Colors.purple1,
}: CircleDisplayCenterRowProps) {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.squaddieContainer}>
        {leftSquaddie ? (
          <SquaddyImage
            displayName={leftSquaddie.displayName}
            imageUrl={leftSquaddie.imageUrl}
            size={leftSquaddieSize}
            hasUnreadMessage={leftSquaddie.hasUnreadMessage}
            onPress={leftSquaddie.onPress}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: leftSquaddieSize,
                height: leftSquaddieSize,
                borderRadius: leftSquaddieSize / 2,
              },
            ]}
          >
            <TitleSmall style={[styles.placeholderText, { color: primaryColor }]}>
              +
            </TitleSmall>
          </View>
        )}

        {rightSquaddie ? (
          <SquaddyImage
            displayName={rightSquaddie.displayName}
            imageUrl={rightSquaddie.imageUrl}
            size={rightSquaddieSize}
            hasUnreadMessage={rightSquaddie.hasUnreadMessage}
            onPress={rightSquaddie.onPress}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: rightSquaddieSize,
                height: rightSquaddieSize,
                borderRadius: rightSquaddieSize / 2,
              },
            ]}
          >
            <TitleSmall style={[styles.placeholderText, { color: primaryColor }]}>
              +
            </TitleSmall>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  squaddieContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.gray6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '300',
  },
});
