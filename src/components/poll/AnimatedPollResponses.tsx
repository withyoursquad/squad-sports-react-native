/**
 * AnimatedPollResponses — Shows poll results with animated option bars,
 * respondent avatars, and a "View Results" CTA.
 * Ported from squad-demo.
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodySmall, BodyMedium, BodyRegular, TitleMedium } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';
import UserImage from '../ux/user-image/UserImage';
import AnimatedPollOptions, { PollOptionData } from './AnimatedPollOptions';
import PollTag from './PollTag';

export interface PollResponseData {
  id: string;
  pollOptionId: number;
  creator?: {
    id: string;
    displayName?: string;
    imageUrl?: string;
  };
}

export interface PollData {
  id: string;
  prompt: string;
  theme?: string;
  communityTag?: string;
  endingAt?: Date;
  options?: PollOptionData[];
}

interface AnimatedPollResponsesProps {
  poll: PollData;
  responses: PollResponseData[];
  currentUserId?: string;
  onViewResults?: () => void;
}

/**
 * Compute what percentage of responses chose a given option.
 */
function getPollResponsePercentage(
  optionId: number,
  responses: PollResponseData[],
): number {
  if (!responses || responses.length === 0) return 0;
  const count = responses.filter(r => r.pollOptionId === optionId).length;
  return Math.round((count / responses.length) * 100);
}

function getEndTimeString(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  if (diff <= 0) return 'Expires soon';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `Ends in ${days}d`;
  }
  if (hours > 0) return `Ends in ${hours}h`;
  const mins = Math.floor(diff / (1000 * 60));
  return mins > 0 ? `Ends in ${mins}m` : 'Expires soon';
}

export default function AnimatedPollResponses({
  poll,
  responses,
  currentUserId,
  onViewResults,
}: AnimatedPollResponsesProps) {
  const { theme } = useTheme();

  const filteredResponses = responses.slice(0, 3);
  const creatorNames = filteredResponses.map(r => {
    if (r.creator?.id === currentUserId) return 'You';
    return r.creator?.displayName ?? 'Someone';
  });

  const formattedNames = creatorNames
    .map((r, i, arr) => (i === arr.length - 1 && arr.length > 1 ? `and ${r}` : r))
    .join(creatorNames.length > 2 ? ', ' : ' ');

  const handleViewResults = useCallback(() => {
    onViewResults?.();
  }, [onViewResults]);

  return (
    <View style={styles.responseCard}>
      <PollTag label={poll.theme ?? 'Daily Poll'} communityTag={poll.communityTag} />

      {poll.endingAt && (
        <BodySmall style={styles.expiresAtText}>
          {getEndTimeString(poll.endingAt)}
        </BodySmall>
      )}

      <TitleMedium style={styles.promptText}>{poll.prompt}</TitleMedium>

      <View style={styles.options}>
        {poll.options?.map(option => {
          const pct = getPollResponsePercentage(
            option.id ?? -1,
            responses,
          );
          return (
            <AnimatedPollOptions
              option={option}
              key={`${option.id}-${poll.id}`}
              completedPercentage={pct}
              fillColor={theme.primaryColor}
            />
          );
        })}
      </View>

      {filteredResponses.length > 0 && (
        <View style={styles.responsesContainer}>
          <View style={styles.avatarContainer}>
            {filteredResponses.map(response => (
              <View style={styles.avatarImageContainer} key={`poll-avatar-${response.creator?.id}`}>
                <UserImage
                  size={40}
                  imageUrl={response.creator?.imageUrl}
                  displayName={response.creator?.displayName}
                />
              </View>
            ))}
          </View>
          <BodyMedium style={styles.responsesText}>
            {`${formattedNames} answered the poll`}
          </BodyMedium>
        </View>
      )}

      <Button
        onPress={handleViewResults}
        style={[styles.resultsButton, !responses.length && styles.buttonDisabled]}
        disabled={!responses.length}
      >
        <BodyRegular style={responses.length ? styles.buttonText : styles.buttonDisabledText}>
          View Results
        </BodyRegular>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: Colors.gray2,
  },
  buttonDisabledText: {
    color: Colors.gray6,
  },
  buttonText: {
    color: Colors.gray1,
  },
  expiresAtText: {
    alignSelf: 'center',
    color: Colors.gray7,
    marginVertical: 8,
    textAlign: 'center',
  },
  options: {
    marginTop: 16,
  },
  promptText: {
    alignSelf: 'center',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
  },
  responseCard: {
    alignSelf: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    width: '100%',
  },
  resultsButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 24,
    minWidth: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  responsesContainer: {
    marginTop: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarImageContainer: {
    marginLeft: -10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.gray1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  responsesText: {
    color: Colors.gray6,
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%',
  },
});
