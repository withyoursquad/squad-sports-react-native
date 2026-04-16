/**
 * HomeActivePollCard — Poll card variant for the home feed.
 * Switches between PollQuestion (unanswered) and AnimatedPollResponses (answered).
 * Ported from squad-demo layouts/HomeActivePollCard.tsx.
 */
import React, { useCallback } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import AnimatedPollResponses, { PollData, PollResponseData } from '../AnimatedPollResponses';
import PollQuestion from '../PollQuestion';

interface HomeActivePollCardProps {
  poll: PollData;
  /** Existing responses from other users */
  responses: PollResponseData[];
  /** Whether the current user has already responded */
  hasUserResponded: boolean;
  /** Current user ID for highlighting "You" labels */
  currentUserId?: string;
  /** Style applied to the outer wrapper */
  style?: StyleProp<ViewStyle>;
  /** Called when the user submits a poll response */
  onSubmitResponse: (pollId: string, selectedOptionId: number) => void;
  /** Called when the user taps "View Results" */
  onViewResults?: (pollId: string) => void;
}

export function HomeActivePollCard({
  poll,
  responses,
  hasUserResponded,
  currentUserId,
  style,
  onSubmitResponse,
  onViewResults,
}: HomeActivePollCardProps) {
  const handleSubmit = useCallback(
    (selectedOptionId: number) => {
      onSubmitResponse(poll.id, selectedOptionId);
    },
    [onSubmitResponse, poll.id],
  );

  const handleViewResults = useCallback(() => {
    onViewResults?.(poll.id);
  }, [onViewResults, poll.id]);

  // Map responses to respondent format for PollQuestion
  const respondents = responses.slice(0, 3).map(r => ({
    id: r.creator?.id ?? '',
    displayName: r.creator?.displayName,
    imageUrl: r.creator?.imageUrl,
  }));

  return (
    <View style={style}>
      {hasUserResponded ? (
        <AnimatedPollResponses
          poll={poll}
          responses={responses}
          currentUserId={currentUserId}
          onViewResults={handleViewResults}
        />
      ) : (
        <PollQuestion
          poll={poll}
          respondents={respondents}
          currentUserId={currentUserId}
          onSubmit={handleSubmit}
        />
      )}
    </View>
  );
}
