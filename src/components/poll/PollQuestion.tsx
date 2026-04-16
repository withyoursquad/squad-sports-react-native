/**
 * PollQuestion — Displays a poll prompt with selectable options and submit CTA.
 * Shows respondent avatars if others have already answered.
 * Ported from squad-demo Question.tsx.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';
import UserImage from '../ux/user-image/UserImage';
import { BodySmall, BodyMedium, BodyRegular, TitleMedium } from '../ux/text/Typography';
import PollOption from './PollOption';
import PollTag from './PollTag';

export interface PollOptionData {
  id: number;
  label: string;
  imageUrl?: string;
}

export interface PollRespondent {
  id: string;
  displayName?: string;
  imageUrl?: string;
}

export interface PollQuestionData {
  id: string;
  prompt: string;
  theme?: string;
  communityTag?: string;
  endingAt?: Date;
  options?: PollOptionData[];
}

interface PollQuestionProps {
  poll: PollQuestionData;
  /** Respondents who have already answered (show up to 3 avatars) */
  respondents?: PollRespondent[];
  currentUserId?: string;
  onSubmit: (selectedOptionId: number) => void;
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

export default function PollQuestion({
  poll,
  respondents = [],
  currentUserId,
  onSubmit,
}: PollQuestionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [buttonText, setButtonText] = useState('Submit');

  const handleOptionSelect = useCallback(
    (id: number) => {
      setSelectedOptionId(prev => (prev === id ? null : id));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (typeof selectedOptionId === 'number') {
      setButtonText('View Results');
      onSubmit(selectedOptionId);
    }
  }, [onSubmit, selectedOptionId]);

  const filteredRespondents = respondents.slice(0, 3);
  const creatorNames = filteredRespondents.map(r => {
    if (r.id === currentUserId) return 'You';
    return r.displayName ?? 'Someone';
  });
  const formattedNames = creatorNames
    .map((r, i, arr) => (i === arr.length - 1 && arr.length > 1 ? `and ${r}` : r))
    .join(creatorNames.length > 2 ? ', ' : ' ');

  const isSubmitted = buttonText === 'View Results';
  const showCTA = selectedOptionId !== null;

  return (
    <View style={styles.questionCard}>
      <PollTag label={poll.theme ?? 'Daily Poll'} communityTag={poll.communityTag} />

      {poll.endingAt && (
        <BodySmall style={styles.expiresAtText}>
          {getEndTimeString(poll.endingAt)}
        </BodySmall>
      )}

      <TitleMedium style={styles.promptText}>{poll.prompt}</TitleMedium>

      <View style={styles.options}>
        {poll.options?.map(option => (
          <PollOption
            key={`poll-option-${poll.id}-${option.id}`}
            option={option}
            isSelected={selectedOptionId === option.id}
            selectedOptionId={selectedOptionId}
            onPress={handleOptionSelect}
          />
        ))}
      </View>

      {filteredRespondents.length > 0 && (
        <View style={styles.responsesContainer}>
          <View style={styles.avatarContainer}>
            {filteredRespondents.map(respondent => (
              <View style={styles.avatarImageContainer} key={`poll-respondent-${respondent.id}`}>
                <UserImage
                  size={40}
                  imageUrl={respondent.imageUrl}
                  displayName={respondent.displayName}
                />
              </View>
            ))}
          </View>
          <BodyMedium style={styles.responsesText}>
            {`${formattedNames} answered the poll`}
          </BodyMedium>
        </View>
      )}

      {showCTA && (
        <Button
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitted && styles.buttonDisabled]}
          disabled={isSubmitted}
        >
          <BodyRegular style={isSubmitted ? styles.disabledCTAButtonText : styles.buttonText}>
            {buttonText}
          </BodyRegular>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: Colors.gray2,
  },
  buttonText: {
    color: Colors.gray1,
  },
  disabledCTAButtonText: {
    color: Colors.gray6,
  },
  expiresAtText: {
    alignSelf: 'center',
    color: Colors.gray7,
    marginVertical: 8,
    textAlign: 'center',
  },
  options: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  promptText: {
    alignSelf: 'center',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
  },
  questionCard: {
    alignSelf: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    width: '100%',
  },
  submitButton: {
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
