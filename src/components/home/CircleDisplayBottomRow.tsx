/**
 * Bottom row of the squad circle display (2 members, conditional).
 * Ported from squad-demo/src/screens/home/CircleDisplayBottomRow.tsx
 *
 * Only renders members that are present. When both are present they are
 * spaced-around; when only one is present it is centered with extra
 * top padding.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SquaddyImage from './SquaddyImage';
import type { SquadMemberCircleSize } from './circleDisplayConstants';

export interface BottomRowMember {
  displayName?: string;
  imageUrl?: string;
  hasUnreadMessage?: boolean;
  onPress?: () => void;
}

export interface CircleDisplayBottomRowProps {
  leftSquaddie?: BottomRowMember | null;
  leftSquaddieSize: SquadMemberCircleSize;
  rightSquaddie?: BottomRowMember | null;
  rightSquaddieSize: SquadMemberCircleSize;
}

export default function CircleDisplayBottomRow({
  leftSquaddie,
  leftSquaddieSize,
  rightSquaddie,
  rightSquaddieSize,
}: CircleDisplayBottomRowProps) {
  const hasBoth = !!leftSquaddie && !!rightSquaddie;
  const dynamicStyles = createStyles(
    leftSquaddieSize,
    rightSquaddieSize,
    hasBoth,
  );

  return (
    <View style={dynamicStyles.rowContainer}>
      <View style={dynamicStyles.squaddieContainer}>
        {leftSquaddie ? (
          <SquaddyImage
            displayName={leftSquaddie.displayName}
            imageUrl={leftSquaddie.imageUrl}
            size={leftSquaddieSize}
            hasUnreadMessage={leftSquaddie.hasUnreadMessage}
            onPress={leftSquaddie.onPress}
          />
        ) : null}
        {rightSquaddie ? (
          <SquaddyImage
            displayName={rightSquaddie.displayName}
            imageUrl={rightSquaddie.imageUrl}
            size={rightSquaddieSize}
            hasUnreadMessage={rightSquaddie.hasUnreadMessage}
            onPress={rightSquaddie.onPress}
          />
        ) : null}
      </View>
    </View>
  );
}

function createStyles(
  leftSize: number,
  rightSize: number,
  shouldRenderBoth: boolean,
) {
  return StyleSheet.create({
    rowContainer: {
      flex: 1,
    },
    squaddieContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: shouldRenderBoth ? 'space-around' : 'center',
      paddingLeft: leftSize ? leftSize / 5 : 0,
      paddingRight: rightSize ? rightSize / 5 : 0,
      paddingTop: !shouldRenderBoth ? leftSize / 2 : 0,
    },
  });
}
