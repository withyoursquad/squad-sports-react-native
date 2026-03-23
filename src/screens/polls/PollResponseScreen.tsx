import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/SquadNavigator';
import { useApiClient } from '../../SquadProvider';
import { useTheme, Colors } from '../../theme/ThemeContext';
import ScreenHeader from '../../components/ux/layout/ScreenHeader';
import Button from '../../components/ux/buttons/Button';
import { TitleMedium, BodyRegular, BodySmall } from '../../components/ux/text/Typography';

type Route = RouteProp<RootStackParamList, 'PollResponse'>;

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export function PollResponseScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const apiClient = useApiClient();
  const { theme } = useTheme();

  const { pollId } = route.params;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const polls = await apiClient.getActivePolls();
        const poll = polls?.polls?.find((p: any) => p.id === pollId);
        if (poll) {
          setQuestion((poll as any).question ?? '');
          setOptions(
            (poll.options ?? []).map((o: any, i: number) => ({
              id: o.id ?? String(i),
              text: o.text ?? '',
              voteCount: o.voteCount ?? 0,
              percentage: o.percentage ?? 0,
            })),
          );
        }
      } catch (err) {
        console.error('[PollResponse] Error loading poll:', err);
      }
    };
    loadPoll();
  }, [pollId, apiClient]);

  const handleVote = useCallback(async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { PollResponse } = await import('@squad-sports/core');
      const response = new PollResponse({
        optionId: selectedOption,
      } as any);
      await apiClient.createOrUpdatePollResponse(pollId, response);
      setHasVoted(true);
    } catch (err) {
      console.error('[PollResponse] Error voting:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOption, pollId, apiClient, isSubmitting]);

  const renderOption = useCallback(
    ({ item }: { item: PollOption }) => {
      const isSelected = selectedOption === item.id;

      return (
        <Pressable
          style={[
            styles.option,
            isSelected && [styles.optionSelected, { borderColor: theme.buttonColor }],
          ]}
          onPress={() => !hasVoted && setSelectedOption(item.id)}
          disabled={hasVoted}
        >
          <View style={styles.optionContent}>
            <BodyRegular style={styles.optionText}>{item.text}</BodyRegular>
            {hasVoted && (
              <BodySmall style={styles.optionPercent}>
                {Math.round(item.percentage)}%
              </BodySmall>
            )}
          </View>
          {hasVoted && (
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: isSelected ? theme.buttonColor : Colors.gray5,
                  },
                ]}
              />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedOption, hasVoted, theme.buttonColor],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      <ScreenHeader title="Poll" />

      <View style={styles.content}>
        <TitleMedium style={styles.question}>{question}</TitleMedium>

        <FlatList
          data={options}
          keyExtractor={item => item.id}
          renderItem={renderOption}
          contentContainerStyle={styles.optionsList}
          scrollEnabled={false}
        />
      </View>

      {!hasVoted && (
        <View style={styles.footer}>
          <Button
            style={[
              styles.voteButton,
              { backgroundColor: selectedOption ? theme.buttonColor : Colors.gray2 },
            ]}
            onPress={handleVote}
            disabled={!selectedOption || isSubmitting}
          >
            <Text
              style={[
                styles.voteButtonText,
                { color: selectedOption ? theme.buttonText : Colors.gray6 },
              ]}
            >
              {isSubmitting ? 'Submitting...' : 'Vote'}
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  question: {
    color: Colors.white,
    marginBottom: 24,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  optionSelected: {
    backgroundColor: 'rgba(110, 130, 231, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    color: Colors.white,
    flex: 1,
  },
  optionPercent: {
    color: Colors.gray6,
    marginLeft: 8,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.gray3,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  voteButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
