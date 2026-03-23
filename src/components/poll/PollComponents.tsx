/**
 * Full poll component system.
 * Ported from squad-demo/src/components/poll/*.
 * Components: Tag, EmojiReactions, QuestionCardBlur, UserReaction, UserReactionDetailed,
 *             PollSummationSelector, ReactionList, SquaddyActivePollCard, CardStack, PollCollectionSection.
 */
import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import UserImage from '../ux/user-image/UserImage';
import { BodySmall, BodyRegular, TitleSmall, SubtitleSmall } from '../ux/text/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- PollTag ---
export function PollTag({ label, color = Colors.purple1 }: { label: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

// --- PollEmojiReactions ---
export function PollEmojiReactions({
  reactions, onReact,
}: { reactions: Array<{ emoji: string; count: number }>; onReact?: (emoji: string) => void }) {
  return (
    <View style={styles.emojiRow}>
      {reactions.map((r, i) => (
        <Pressable key={i} style={styles.emojiItem} onPress={() => onReact?.(r.emoji)}>
          <Text style={styles.emojiText}>{r.emoji}</Text>
          <BodySmall style={styles.emojiCount}>{r.count}</BodySmall>
        </Pressable>
      ))}
    </View>
  );
}

// --- UserReaction ---
export function PollUserReaction({ userName, userImageUrl, emoji, responseText }: {
  userName: string; userImageUrl?: string; emoji?: string; responseText?: string;
}) {
  return (
    <View style={styles.userRow}>
      <UserImage imageUrl={userImageUrl} displayName={userName} size={36} />
      <View style={styles.userRowText}>
        <BodyRegular style={styles.userName}>{userName}</BodyRegular>
        {responseText && <BodySmall style={styles.responseText}>{responseText}</BodySmall>}
      </View>
      {emoji && <Text style={styles.userEmoji}>{emoji}</Text>}
    </View>
  );
}

// --- QuestionCardBlur (preview card that's blurred until answered) ---
export function QuestionCardBlur({ question, isAnswered, children }: {
  question: string; isAnswered: boolean; children: React.ReactNode;
}) {
  return (
    <View style={styles.questionCard}>
      <TitleSmall style={styles.questionText}>{question}</TitleSmall>
      <View style={[styles.questionContent, !isAnswered && styles.questionBlur]}>
        {children}
      </View>
      {!isAnswered && (
        <View style={styles.blurOverlay}>
          <BodyRegular style={styles.blurText}>Answer to see results</BodyRegular>
        </View>
      )}
    </View>
  );
}

// --- SquaddyActivePollCard ---
export interface SquaddyActivePollCardProps {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; percentage?: number }>;
  hasVoted: boolean;
  selectedOptionId?: string;
  totalVotes?: number;
  primaryColor?: string;
  onVote?: (optionId: string) => void;
  onPress?: () => void;
}

export const SquaddyActivePollCard = memo(function SquaddyActivePollCard({
  question, options, hasVoted, selectedOptionId, totalVotes, primaryColor = Colors.purple1, onVote, onPress,
}: SquaddyActivePollCardProps) {
  return (
    <Pressable style={styles.pollCard} onPress={onPress}>
      <TitleSmall style={styles.pollQuestion}>{question}</TitleSmall>
      <View style={styles.pollOptions}>
        {options.map(opt => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={[styles.pollOption, isSelected && { borderColor: primaryColor }, hasVoted && styles.pollOptionVoted]}
              onPress={() => !hasVoted && onVote?.(opt.id)}
              disabled={hasVoted}
            >
              <BodyRegular style={[styles.pollOptionText, isSelected && { color: primaryColor }]}>{opt.text}</BodyRegular>
              {hasVoted && opt.percentage !== undefined && (
                <>
                  <BodySmall style={styles.pollPercentage}>{Math.round(opt.percentage)}%</BodySmall>
                  <View style={styles.pollProgressBg}>
                    <View style={[styles.pollProgressFill, { width: `${opt.percentage}%`, backgroundColor: isSelected ? primaryColor : Colors.gray5 }]} />
                  </View>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
      {totalVotes !== undefined && (
        <BodySmall style={styles.pollTotal}>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</BodySmall>
      )}
    </Pressable>
  );
});

// --- PollCollectionSection (group of poll cards) ---
export function PollCollectionSection({
  title, polls, primaryColor, onPollPress,
}: { title?: string; polls: SquaddyActivePollCardProps[]; primaryColor?: string; onPollPress?: (pollId: string) => void }) {
  if (polls.length === 0) return null;

  return (
    <View>
      {title && <TitleSmall style={styles.collectionTitle}>{title}</TitleSmall>}
      {polls.map(poll => (
        <SquaddyActivePollCard
          key={poll.id}
          {...poll}
          primaryColor={primaryColor}
          onPress={() => onPollPress?.(poll.id)}
        />
      ))}
    </View>
  );
}

// --- CardStack (stacked poll cards with peek) ---
export function PollCardStack({ polls, primaryColor }: { polls: SquaddyActivePollCardProps[]; primaryColor?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (polls.length === 0) return null;
  const current = polls[currentIndex];
  if (!current) return null;

  return (
    <View style={styles.stack}>
      <SquaddyActivePollCard {...current} primaryColor={primaryColor} />
      {polls.length > 1 && (
        <BodySmall style={styles.stackCount}>{currentIndex + 1} / {polls.length}</BodySmall>
      )}
    </View>
  );
}

// --- PollSummationSelector ---
export function PollSummationSelector({
  communities, selectedCommunity, onSelect,
}: { communities: string[]; selectedCommunity: string; onSelect: (community: string) => void }) {
  return (
    <View style={styles.summationSelector}>
      {communities.map(c => (
        <Pressable key={c} style={[styles.summationItem, c === selectedCommunity && styles.summationItemActive]} onPress={() => onSelect(c)}>
          <BodySmall style={[styles.summationText, c === selectedCommunity && styles.summationTextActive]}>{c}</BodySmall>
        </Pressable>
      ))}
    </View>
  );
}

// --- ReactionList ---
export function PollReactionList({
  reactions,
}: { reactions: Array<{ userName: string; userImageUrl?: string; emoji: string; responseText?: string }> }) {
  return (
    <FlatList
      data={reactions}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => <PollUserReaction {...item} />}
    />
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  emojiRow: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  emojiItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gray3, borderRadius: 16, paddingVertical: 4, paddingHorizontal: 8 },
  emojiText: { fontSize: 16 },
  emojiCount: { color: Colors.gray6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.gray3 },
  userRowText: { flex: 1 },
  userName: { color: Colors.white },
  responseText: { color: Colors.gray6 },
  userEmoji: { fontSize: 20 },
  questionCard: { backgroundColor: Colors.gray2, borderRadius: 16, padding: 16, marginBottom: 12, overflow: 'hidden' },
  questionText: { color: Colors.white, marginBottom: 12 },
  questionContent: {},
  questionBlur: { opacity: 0.15 },
  blurOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  blurText: { color: Colors.white, fontWeight: '600' },
  pollCard: { backgroundColor: Colors.gray2, borderRadius: 16, padding: 16, marginBottom: 12 },
  pollQuestion: { color: Colors.white, marginBottom: 12 },
  pollOptions: { gap: 8 },
  pollOption: { padding: 14, backgroundColor: Colors.gray3, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  pollOptionVoted: {},
  pollOptionText: { color: Colors.white },
  pollPercentage: { color: Colors.gray6, marginTop: 4, fontWeight: '600' },
  pollProgressBg: { height: 4, backgroundColor: Colors.gray5, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  pollProgressFill: { height: '100%', borderRadius: 2 },
  pollTotal: { color: Colors.gray6, textAlign: 'center', marginTop: 12 },
  collectionTitle: { color: Colors.white, paddingHorizontal: 24, marginBottom: 8 },
  stack: { alignItems: 'center' },
  stackCount: { color: Colors.gray6, marginTop: 8 },
  summationSelector: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  summationItem: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: Colors.gray3 },
  summationItemActive: { backgroundColor: Colors.purple1 },
  summationText: { color: Colors.gray6, fontSize: 13 },
  summationTextActive: { color: Colors.gray1, fontWeight: '500' },
});
