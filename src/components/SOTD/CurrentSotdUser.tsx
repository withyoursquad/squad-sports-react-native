/**
 * CurrentSotdUser.tsx
 * Display current SOTD user with avatar, name, and crown/star badge.
 * Ported from squad-demo/src/components/SOTD/CurrentSotdUser.tsx
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodySmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import UserImage from '../ux/user-image/UserImage';
import SOTDTag from './SOTDTag';

export type CurrentSotdUserProps = {
  onPress: () => void;
  style?: ViewStyle;
  displayName: string;
  imageUrl?: string;
};

export default function CurrentSotdUser({
  onPress,
  style,
  displayName,
  imageUrl,
}: CurrentSotdUserProps) {
  return (
    <Button style={style} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View style={styles.hexagonFrame}>
          <UserImage
            imageUrl={imageUrl}
            displayName={displayName}
            size={40}
          />
        </View>
        <SOTDTag size={48} />
      </View>

      <BodySmall style={styles.text}>
        {displayName} is your Squaddie of the Day
      </BodySmall>
    </Button>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  hexagonFrame: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: 24,
    overflow: 'hidden',
  },
  text: {
    color: Colors.gray6,
    marginTop: 8,
    textAlign: 'center',
  },
});
