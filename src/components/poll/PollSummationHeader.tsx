/**
 * PollSummationHeader — Header bar for the poll results / summation screen.
 * Shows a back button, a title, and an optional filter button.
 * Ported from squad-demo poll-summation/PollSummationHeader.tsx.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import BackButton from '../ux/navigation/BackButton';

interface PollSummationHeaderProps {
  /** Title to display (e.g. "Your Shifter Results" or community name) */
  title: string;
  /** Whether to show the filter/sort button */
  showFilter?: boolean;
  /** Called when the filter button is pressed */
  onFilterPress?: () => void;
}

export default function PollSummationHeader({
  title,
  showFilter = false,
  onFilterPress,
}: PollSummationHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <BackButton />

      <BodyRegular style={styles.title}>{title}</BodyRegular>

      {showFilter ? (
        <Button onPress={onFilterPress} style={styles.filterButton}>
          <BodyRegular style={styles.filterIcon}>{'\u{2195}'}</BodyRegular>
        </Button>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    alignSelf: 'center',
    color: Colors.gray6,
    flex: 1,
    marginVertical: 8,
    textAlign: 'center',
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    color: Colors.white,
    fontSize: 18,
  },
  placeholder: {
    width: 36,
  },
});
