/**
 * Freestyle prompt selection carousel.
 * Ported from squad-demo/src/screens/freestyle-creation/Carousel.tsx.
 *
 * Displays pages of prompts that the user can select before recording.
 * Uses a horizontal ScrollView with pagination dots (no external carousel dep).
 */
import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { TitleMedium, TitleSmall, BodySmall } from '../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_WIDTH = SCREEN_WIDTH - 32;

export interface PromptOption {
  id: string;
  body: string;
  emoji?: string;
  emojiType?: 'emoji' | 'svgUri' | 'imageUri';
}

export interface PromptPage {
  title: string;
  options: PromptOption[];
}

export interface SelectedPrompt {
  option: PromptOption;
  promptTitle: string;
}

interface PromptCarouselProps {
  prompts: PromptPage[];
  selected: SelectedPrompt | null;
  onSelect: (option: PromptOption, title: string) => void;
  loading?: boolean;
}

function PromptItem({
  option,
  isSelected,
  onPress,
}: {
  option: PromptOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme, baseThemeColors } = useTheme();

  const selectedBg = theme.isDarkMode
    ? baseThemeColors.primaryWhiteColor
    : baseThemeColors.primaryTextColor;
  const selectedText = theme.isDarkMode
    ? baseThemeColors.primaryTextColor
    : baseThemeColors.primaryWhiteColor;
  const unselectedBorder = theme.isDarkMode
    ? baseThemeColors.secondaryGrey
    : baseThemeColors.disabledGrey;
  const unselectedText = theme.isDarkMode
    ? baseThemeColors.primaryWhiteColor
    : baseThemeColors.primaryTextColor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.promptItem,
        { borderColor: unselectedBorder },
        isSelected && {
          backgroundColor: selectedBg,
          borderColor: selectedBg,
        },
      ]}
    >
      {option.emoji && (
        <Text style={styles.promptEmoji}>{option.emoji}</Text>
      )}
      <TitleSmall
        style={[
          styles.promptText,
          { color: isSelected ? selectedText : unselectedText },
        ]}
        numberOfLines={2}
      >
        {option.body}
      </TitleSmall>
    </Pressable>
  );
}

export default function PromptCarousel({
  prompts,
  selected,
  onSelect,
  loading = false,
}: PromptCarouselProps) {
  const { theme, baseThemeColors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / PAGE_WIDTH);
    setActiveIndex(page);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  if (prompts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <BodySmall style={styles.emptyText}>No prompts available</BodySmall>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((page, pageIndex) => (
          <View key={`page-${pageIndex}`} style={styles.page}>
            <TitleMedium
              style={[
                styles.pageTitle,
                {
                  color: theme.isDarkMode
                    ? baseThemeColors.primaryWhiteColor
                    : baseThemeColors.primaryTextColor,
                },
              ]}
            >
              {page.title}
            </TitleMedium>

            <View style={styles.optionsGrid}>
              {page.options.map((option) => {
                if (!option.emoji && !option.body) return null;
                const isSelected = selected?.option.body === option.body;
                return (
                  <PromptItem
                    key={`prompt-${option.id || option.body}`}
                    option={option}
                    isSelected={isSelected}
                    onPress={() => onSelect(option, page.title)}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {prompts.length > 1 && (
        <View style={styles.pagination}>
          {prompts.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  scrollContent: {},
  page: {
    width: PAGE_WIDTH,
    alignSelf: 'flex-start',
  },
  pageTitle: {
    color: Colors.white,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginVertical: 8,
    paddingVertical: 16,
    width: '30%',
    minHeight: 130,
  },
  promptEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  promptText: {
    textAlign: 'center',
    flexShrink: 1,
    width: '90%',
    alignSelf: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.white,
  },
  dotInactive: {
    backgroundColor: Colors.gray5,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 36,
  },
  emptyText: {
    color: Colors.gray6,
  },
});
