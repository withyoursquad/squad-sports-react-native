/**
 * Top row of the squad circle display (1 member, centered).
 * Ported from squad-demo/src/screens/home/CircleDisplayTopRow.tsx
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall } from '../ux/text/Typography';
import SquaddyImage from './SquaddyImage';
import type { SquadMemberCircleSize } from './circleDisplayConstants';

export interface CircleDisplayTopRowProps {
  /** The squad member to render, or null for an empty "+" placeholder */
  displayName?: string;
  imageUrl?: string;
  hasUnreadMessage?: boolean;
  size: SquadMemberCircleSize;
  /** Whether a member is present in the slot */
  hasSquaddie: boolean;
  /** Called when the member avatar is pressed */
  onPress?: () => void;
  /** Primary color for the "+" placeholder */
  primaryColor?: string;
}

export default function CircleDisplayTopRow({
  displayName,
  imageUrl,
  hasUnreadMessage = false,
  size,
  hasSquaddie,
  onPress,
  primaryColor = Colors.purple1,
}: CircleDisplayTopRowProps) {
  const dynamicStyles = createStyles(size);

  return (
    <View style={dynamicStyles.rowContainer}>
      <View style={dynamicStyles.squaddieContainer}>
        {hasSquaddie ? (
          <SquaddyImage
            displayName={displayName}
            imageUrl={imageUrl}
            size={size}
            hasUnreadMessage={hasUnreadMessage}
            onPress={onPress}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
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

function createStyles(size: number) {
  return StyleSheet.create({
    rowContainer: {
      flex: 1,
    },
    squaddieContainer: {
      alignSelf: 'center',
      paddingTop: size / 5,
    },
  });
}

const styles = StyleSheet.create({
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
