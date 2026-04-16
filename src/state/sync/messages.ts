/**
 * Message sync atoms.
 * Ported from squad-demo/src/atoms/sync/messages.ts + message-prompts.ts.
 */
import { atom, atomFamily } from 'recoil';
import type { Conversation, Message, MessageReaction } from '@squad-sports/core';

// Conversation per connection (initial from API)
export const reInitialConversationState = atomFamily<Conversation | null, string>({
  key: 'squad-sdk:connection:messages:initial',
  default: null,
});

// Messages per connection (compiled with real-time updates)
export const reConnectionMessages = atomFamily<Message[], string>({
  key: 'squad-sdk:connection:messages',
  default: [],
});

// Message reactions
export const reMessageReaction = atomFamily<MessageReaction | null, string>({
  key: 'squad-sdk:message-reaction',
  default: null,
});

// Failed message tracking
export interface FailedMessageInfo {
  messageId: string;
  connectionId: string;
  error: string;
  timestamp: number;
  retryCount: number;
}

export const reMessageSendStatus = atom<Map<string, FailedMessageInfo>>({
  key: 'squad-sdk:messages:send-status',
  default: new Map(),
});

// Message prompts
export const reMessagePrompts = atom<unknown[]>({
  key: 'squad-sdk:messages:prompts',
  default: [],
});
