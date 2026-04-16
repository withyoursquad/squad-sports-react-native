/**
 * Squad Circle — the circular arrangement of squad members on the home screen.
 * Ported from squad-demo/src/screens/home/slivers/SquadCircle.tsx + CircleDisplay.tsx.
 */
import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserImage from '../../../components/ux/user-image/UserImage';
import { BodySmall } from '../../../components/ux/text/Typography';
import { Colors } from '../../../theme/ThemeContext';
import type { Connection } from '@squad-sports/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.7;

interface SquadCircleProps {
  connections: Connection[];
  primaryColor?: string;
}

function SquadCircle({ connections, primaryColor = Colors.purple1 }: SquadCircleProps) {
  const navigation = useNavigation();
  const members = connections.slice(0, 8);
  const count = members.length;

  if (count === 0) return null;

  const radius = CIRCLE_SIZE / 2 - 32;
  const centerX = CIRCLE_SIZE / 2;
  const centerY = CIRCLE_SIZE / 2;

  return (
    <View style={[styles.container, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
      {/* Circle outline */}
      <View style={[styles.circleOutline, { borderColor: 'rgba(255,255,255,0.05)' }]} />

      {members.map((conn, index) => {
        const other = conn.recipient ?? conn.creator;
        const angle = (2 * Math.PI * index) / count - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 28;
        const y = centerY + radius * Math.sin(angle) - 28;

        return (
          <Pressable
            key={conn.id}
            style={[styles.member, { left: x, top: y }]}
            onPress={() => (navigation as any).navigate('Profile', { userId: other?.id ?? conn.id })}
            accessibilityLabel={`${other?.displayName}'s profile`}
          >
            <UserImage
              imageUrl={other?.imageUrl}
              displayName={other?.displayName}
              size={56}
              borderColor={primaryColor}
            />
            <BodySmall style={styles.memberName} numberOfLines={1}>
              {other?.displayName?.split(' ')[0] ?? ''}
            </BodySmall>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(SquadCircle);

const styles = StyleSheet.create({
  container: { alignSelf: 'center', position: 'relative', marginVertical: 16 },
  circleOutline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1,
  },
  member: { position: 'absolute', alignItems: 'center', width: 64 },
  memberName: { color: Colors.white, marginTop: 4, textAlign: 'center' },
});
