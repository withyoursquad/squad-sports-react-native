/**
 * FreestyleCardButtonWrapper — Links freestyle card to creation screen if
 * the logged-in user owns the freestyle, otherwise a plain pressable card.
 * Ported from squad-demo/src/components/freestyle/card/ButtonWrapper.tsx.
 */
import React from 'react';
import { Pressable } from 'react-native';
import { useRecoilValue } from 'recoil';
import type { Freestyle } from '@squad-sports/core';
import { reUserCache } from '../../state/user';
import { FreestyleFeedItem as FreestyleCard } from '../freestyle/FreestyleComponents';

type FreestyleCardButtonWrapperProps = {
  freestyle: Freestyle;
  onPress: () => void;
  /** Optional callback when the owner taps their own card (navigates to edit). */
  onOwnerPress?: (freestyleId: string) => void;
};

export default function FreestyleCardButtonWrapper({
  freestyle,
  onPress,
  onOwnerPress,
}: FreestyleCardButtonWrapperProps) {
  const loggedInUser = useRecoilValue(reUserCache) as any;

  const isOwner =
    loggedInUser?.id &&
    freestyle?.creator &&
    (freestyle.creator as any)?.id === loggedInUser.id;

  if (isOwner && onOwnerPress) {
    return (
      <Pressable onPress={() => onOwnerPress(String((freestyle as any)?.id ?? ''))}>
        <FreestyleCard
          id={String((freestyle as any)?.id ?? '')}
          audioUrl={(freestyle as any)?.contentUrl}
          duration={(freestyle as any)?.metadata?.duration}
          creatorName={(freestyle.creator as any)?.displayName}
          creatorImageUrl={(freestyle.creator as any)?.imageUri}
          createdAt={(freestyle as any)?.createdAt?.toDate?.()?.toISOString?.()}
          promptText={(freestyle as any)?.prompt}
        />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <FreestyleCard
        id={String((freestyle as any)?.id ?? '')}
        audioUrl={(freestyle as any)?.contentUrl}
        duration={(freestyle as any)?.metadata?.duration}
        creatorName={(freestyle.creator as any)?.displayName}
        creatorImageUrl={(freestyle.creator as any)?.imageUri}
        createdAt={(freestyle as any)?.createdAt?.toDate?.()?.toISOString?.()}
        promptText={(freestyle as any)?.prompt}
      />
    </Pressable>
  );
}
