/**
 * Waveform — audio waveform visualization with progress tracking.
 * Ported from squad-demo/src/components/audio/Waveform.tsx.
 *
 * Renders a row of vertical bars whose heights are derived from audio level
 * data. Bars behind the current playback position use `filledColor`; the
 * rest use the base `color`.
 */
import React, { memo } from 'react';
import { ColorValue, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export interface WaveformProps {
  /** Base (unfilled) bar color. */
  color?: ColorValue;
  /** Total width of the waveform in px. */
  width: number;
  /** Total height of the waveform in px. */
  height: number;
  /** Raw audio level samples. */
  levels: number[];
  /** Duration of the clip in seconds. */
  duration: number;
  /** Current playback position in seconds (0 when idle). */
  position?: number;
  /** Color for bars that have already been played. */
  filledColor?: ColorValue;
}

const BAR_GAP = 3;
const BAR_WIDTH = 3;
const MIN_BAR_HEIGHT = 5;

/**
 * Returns the number of bars we should display for the given `width`.
 */
function calculateBarCount(width: number): number {
  return Math.floor((width + BAR_GAP) / (BAR_GAP + BAR_WIDTH));
}

/**
 * Normalizes all values in `levels` to [0, 1] using an in-out cubic easing
 * to accentuate peaks and troughs.
 */
function normalizeLevels(levels: number[]): number[] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  levels.forEach((level) => {
    if (level > max) max = level;
    if (level < min) min = level;
  });

  const breadth = max - min;
  if (breadth === 0) return levels.map(() => 0.5);

  return levels.map((level) =>
    Easing.inOut(Easing.cubic)((level - min) / breadth),
  );
}

/**
 * Returns the height contribution for one bar based on its position within
 * the normalized levels array. Takes the max of the sub-range it maps to.
 */
function calculateBarHeight(
  barIndex: number,
  barCount: number,
  levels: number[],
): number {
  if (levels.length === 0) return 0;
  if (levels.length === 1) return levels[0] ?? 0;

  const begindex = (barIndex / barCount) * (levels.length - 1);
  const endex = ((barIndex + 1) / barCount) * (levels.length - 1);

  const slice = levels.slice(Math.ceil(begindex), Math.floor(endex));
  return slice.reduce((m, level) => (m > level ? m : level), 0);
}

function WaveformBar({ color, height }: { color: ColorValue; height: number }) {
  return (
    <View
      style={{
        ...styles.bar,
        backgroundColor: color,
        height,
      }}
    />
  );
}

function Waveform({
  color = Colors.apricot,
  width,
  height,
  levels,
  duration,
  position = 0,
  filledColor = Colors.red,
}: WaveformProps) {
  const barCount = calculateBarCount(width);

  // How many bars should use the filled color based on playback position.
  const positionIndex =
    duration > 0 ? Math.ceil((position / duration) * barCount) : 0;

  // Skip the first level sample (can contain anomalously low values).
  const normalizedLevels = normalizeLevels(levels.slice(1));
  const barSpan = height - MIN_BAR_HEIGHT;

  const bars: React.ReactNode[] = [];

  for (let index = 0; index < barCount; index++) {
    bars.push(
      <WaveformBar
        key={index}
        color={index < positionIndex ? filledColor : color}
        height={
          calculateBarHeight(index, barCount, normalizedLevels) * barSpan +
          MIN_BAR_HEIGHT
        }
      />,
    );
  }

  return (
    <View style={[styles.waveform, { height, width }]}>
      {bars}
    </View>
  );
}

export default memo(Waveform);

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'center',
    borderRadius: BAR_WIDTH,
    width: BAR_WIDTH,
  },
  waveform: {
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
