/**
 * Chat bubble overlay — wave icon sized per member circle.
 * Ported from squad-demo/src/screens/home/ChatBubble.tsx
 *
 * Positioned over the squad member avatar to indicate unread messages.
 * Bubble and wave icon sizes scale with the member circle diameter.
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import type { SquadMemberCircleSize } from './circleDisplayConstants';

type Sizes = { width: number; height: number };

type SizeMap = Record<SquadMemberCircleSize, Sizes>;

const DEFAULT_BUBBLE_SIZE: Sizes = { width: 32, height: 20 };
const BUBBLE_SIZES: SizeMap = {
  88: { width: 36, height: 24 },
  80: { width: 35, height: 23 },
  72: { width: 34, height: 22 },
  64: { width: 33, height: 21 },
  56: DEFAULT_BUBBLE_SIZE,
};

const DEFAULT_WAVE_SIZE: Sizes = { width: 20, height: 14 };
const WAVE_SIZES: SizeMap = {
  88: { width: 24, height: 18 },
  80: { width: 23, height: 17 },
  72: { width: 22, height: 16 },
  64: { width: 21, height: 15 },
  56: DEFAULT_WAVE_SIZE,
};

export interface ChatBubbleProps {
  circleSize: SquadMemberCircleSize;
}

export default function ChatBubble({ circleSize }: ChatBubbleProps) {
  const waveSizes = WAVE_SIZES[circleSize] || DEFAULT_WAVE_SIZE;
  const bubbleSizes = BUBBLE_SIZES[circleSize] || DEFAULT_BUBBLE_SIZE;

  return (
    <View style={[styles.bubble, bubbleSizes]}>
      {/* Wave icon — rendered as a "~" text glyph matching the demo's
          ChatBubbleWaveSvg visual. Replace with an actual SVG asset
          if one is added to the SDK. */}
      <Text
        style={[
          styles.waveText,
          { fontSize: waveSizes.height * 0.8 },
        ]}
      >
        ~
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    backgroundColor: Colors.orange1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
  },
  waveText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
