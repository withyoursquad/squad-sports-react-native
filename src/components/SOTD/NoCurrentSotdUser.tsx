/**
 * NoCurrentSotdUser.tsx
 * Empty state when no SOTD selected yet.
 * Ported from squad-demo/src/components/SOTD/NoCurrentSotdUser.tsx
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type NoCurrentSotdUserProps = {
  onPress: () => void;
  style?: ViewStyle;
};

export default function NoCurrentSotdUser({ onPress, style }: NoCurrentSotdUserProps) {
  return (
    <Button style={style} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={styles.starIcon}>
          <View style={styles.starCenter} />
        </View>
      </View>

      <BodySmall style={styles.text}>Tap to reveal your Squaddie of the Day</BodySmall>
    </Button>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  starIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gray1,
  },
  text: {
    color: Colors.gray6,
    marginTop: 8,
    textAlign: 'center',
  },
});
