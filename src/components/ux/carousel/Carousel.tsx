/**
 * Carousel components.
 * Ported from squad-demo/src/components/ux/carousel/.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View, FlatList, StyleSheet, Dimensions, Pressable, Text,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { Colors } from '../../../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Pagination Dot ---

export function PaginationDot({ active, color = Colors.white }: { active: boolean; color?: string }) {
  return (
    <View style={[styles.dot, active ? { backgroundColor: color } : styles.dotInactive]} />
  );
}

// --- Carousel Pagination ---

export function CarouselPagination({ count, activeIndex, color }: { count: number; activeIndex: number; color?: string }) {
  return (
    <View style={styles.pagination} accessibilityRole="tablist">
      {Array.from({ length: count }, (_, i) => (
        <PaginationDot key={i} active={i === activeIndex} color={color} />
      ))}
    </View>
  );
}

// --- Carousel Button ---

export function CarouselButton({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.navButton, direction === 'left' ? styles.navLeft : styles.navRight]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={direction === 'left' ? 'Previous' : 'Next'}
    >
      <Text style={styles.navText}>{direction === 'left' ? '<' : '>'}</Text>
    </Pressable>
  );
}

// --- Carousel Item ---

export function CarouselItem({ children, width }: { children: React.ReactNode; width?: number }) {
  return <View style={[styles.item, { width: width ?? SCREEN_WIDTH - 48 }]}>{children}</View>;
}

// --- Main Carousel ---

interface CarouselProps {
  data: unknown[];
  renderItem: (item: unknown, index: number) => React.ReactNode;
  itemWidth?: number;
  showPagination?: boolean;
  showNavButtons?: boolean;
  paginationColor?: string;
}

export default function Carousel({
  data,
  renderItem,
  itemWidth = SCREEN_WIDTH - 48,
  showPagination = true,
  showNavButtons = false,
  paginationColor,
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / itemWidth);
      setActiveIndex(index);
    },
    [itemWidth],
  );

  const scrollTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      flatListRef.current?.scrollToOffset({ offset: clamped * itemWidth, animated: true });
      setActiveIndex(clamped);
    },
    [data.length, itemWidth],
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth }}>{renderItem(item, index)}</View>
        )}
      />
      {showNavButtons && data.length > 1 && (
        <>
          <CarouselButton direction="left" onPress={() => scrollTo(activeIndex - 1)} />
          <CarouselButton direction="right" onPress={() => scrollTo(activeIndex + 1)} />
        </>
      )}
      {showPagination && data.length > 1 && (
        <CarouselPagination count={data.length} activeIndex={activeIndex} color={paginationColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  pagination: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12 },
  navButton: { position: 'absolute', top: '40%', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  navLeft: { left: 4 },
  navRight: { right: 4 },
  navText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  item: { justifyContent: 'center', alignItems: 'center' },
});
