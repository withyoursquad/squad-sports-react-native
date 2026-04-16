/**
 * Poll component system — barrel exports.
 *
 * New dedicated components (ported from squad-demo):
 */
export { default as AnimatedPollOptions } from './AnimatedPollOptions';
export { default as AnimatedPollResponses } from './AnimatedPollResponses';
export { default as NudgeButton } from './NudgeButton';
export { default as PollOption } from './PollOption';
export { default as PollQuestion } from './PollQuestion';
export { default as PollResponseCard } from './PollResponseCard';
export { default as PollTag } from './PollTag';
export { default as PollUserReaction } from './PollUserReaction';
export { default as PollUserReactionDetailed } from './PollUserReactionDetailed';
export { default as PollCollectionSection, CardStack } from './PollCollectionSection';
export { default as PollSummationHeader } from './PollSummationHeader';

// Bottom sheets
export { default as AddReactionSheet } from './bottom-sheets/AddReactionSheet';
export { default as ReactionListSheet } from './bottom-sheets/ReactionListSheet';

// Layouts
export { HomeActivePollCard } from './layouts/HomeActivePollCard';
export { SquaddyActivePollCard } from './layouts/SquaddyActivePollCard';

// Legacy combined component (kept for backward compatibility)
export {
  PollTag as PollTagLegacy,
  PollEmojiReactions,
  PollUserReaction as PollUserReactionLegacy,
  QuestionCardBlur,
  SquaddyActivePollCard as SquaddyActivePollCardLegacy,
  PollCollectionSection as PollCollectionSectionLegacy,
  PollCardStack,
  PollSummationSelector,
  PollReactionList,
} from './PollComponents';

// Re-export types
export type { PollOptionData } from './AnimatedPollOptions';
export type { PollData, PollResponseData } from './AnimatedPollResponses';
export type { PollQuestionData, PollRespondent } from './PollQuestion';
export type { PollResponseCardData, PollResponseUser, PollResponseOption } from './PollResponseCard';
export type { PollCollectionData } from './PollCollectionSection';
export type { ReactionItem } from './bottom-sheets/ReactionListSheet';
export type { EmojiReaction } from './layouts/SquaddyActivePollCard';
