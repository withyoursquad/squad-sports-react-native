import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular, BodySmall } from '../ux/text/Typography';

interface PollOption {
  id: string;
  text: string;
  percentage?: number;
}

interface PollCardProps {
  id: string;
  question: string;
  options: PollOption[];
  hasVoted: boolean;
  selectedOptionId?: string;
  totalVotes?: number;
  onPress?: () => void;
  primaryColor?: string;
  sponsorBrandName?: string;
  sponsorBrandImageUrl?: string;
  sponsorPlacementId?: string;
}

function PollCard({
  id,
  question,
  options,
  hasVoted,
  selectedOptionId,
  totalVotes,
  onPress,
  primaryColor = Colors.purple1,
  sponsorBrandName,
}: PollCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {sponsorBrandName && (
        <BodySmall style={styles.sponsorLabel}>
          Presented by {sponsorBrandName}
        </BodySmall>
      )}
      <TitleSmall style={styles.question}>{question}</TitleSmall>

      <View style={styles.options}>
        {options.slice(0, 4).map(option => {
          const isSelected = selectedOptionId === option.id;
          return (
            <View key={option.id} style={styles.option}>
              <View style={styles.optionHeader}>
                <BodyRegular
                  style={[styles.optionText, isSelected && { color: primaryColor }]}
                >
                  {option.text}
                </BodyRegular>
                {hasVoted && option.percentage !== undefined && (
                  <BodySmall style={styles.percentage}>
                    {Math.round(option.percentage)}%
                  </BodySmall>
                )}
              </View>
              {hasVoted && option.percentage !== undefined && (
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${option.percentage}%`,
                        backgroundColor: isSelected ? primaryColor : Colors.gray5,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {totalVotes !== undefined && (
        <BodySmall style={styles.totalVotes}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </BodySmall>
      )}

      {!hasVoted && (
        <View style={[styles.voteCta, { backgroundColor: primaryColor }]}>
          <Text style={styles.voteCtaText}>Vote</Text>
        </View>
      )}
    </Pressable>
  );
}

export default memo(PollCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sponsorLabel: {
    color: Colors.gray6,
    fontSize: 11,
    marginBottom: 8,
  },
  question: {
    color: Colors.white,
    marginBottom: 16,
  },
  options: {
    gap: 8,
  },
  option: {
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: {
    color: Colors.white,
    flex: 1,
  },
  percentage: {
    color: Colors.gray6,
    fontWeight: '600',
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.gray3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  totalVotes: {
    color: Colors.gray6,
    marginTop: 12,
    textAlign: 'center',
  },
  voteCta: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  voteCtaText: {
    color: Colors.gray1,
    fontWeight: '600',
    fontSize: 14,
  },
});
