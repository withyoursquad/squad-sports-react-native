/**
 * PollOption — Individual selectable poll option with image and label.
 * Shows selected/unselected states. Ported from squad-demo Option.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import { BodyRegular, TitleTiny } from '../ux/text/Typography';

export interface PollOptionData {
  id: number;
  label: string;
  imageUrl?: string;
}

interface PollOptionProps {
  option: PollOptionData;
  onPress: (id: number) => void;
  isSelected: boolean;
  selectedOptionId: number | null;
}

export default function PollOption({
  option,
  onPress,
  isSelected,
  selectedOptionId,
}: PollOptionProps) {
  const handlePress = useCallback(
    () => onPress(option.id),
    [onPress, option.id],
  );

  const optionStyle = () => {
    if (selectedOptionId === null) return {};
    if (isSelected) return styles.selectedContainer;
    return styles.unselectedContainer;
  };

  return (
    <Button
      onPress={handlePress}
      style={[styles.container, optionStyle()]}
    >
      <View style={[styles.imageContainer, isSelected && styles.imageSelected]}>
        {option.imageUrl ? (
          <Image
            source={{ uri: option.imageUrl }}
            contentFit="contain"
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <View style={styles.textContainer}>
        {selectedOptionId !== null && isSelected ? (
          <TitleTiny style={styles.selectedLabel}>{option.label}</TitleTiny>
        ) : (
          <BodyRegular style={styles.label}>{option.label}</BodyRegular>
        )}
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    paddingHorizontal: 16,
    height: 64,
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray2,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  image: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  imagePlaceholder: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray3,
  },
  imageSelected: {
    backgroundColor: Colors.white,
  },
  label: {
    color: Colors.white,
    textAlign: 'left',
    marginHorizontal: 16,
  },
  selectedLabel: {
    color: Colors.gray1,
    textAlign: 'left',
    marginHorizontal: 16,
  },
  textContainer: {
    flexGrow: 1,
  },
  unselectedContainer: {
    opacity: 0.4,
  },
  selectedContainer: {
    backgroundColor: Colors.white,
  },
});
