import { useEffect } from 'react';
import {
  CustomerJourneyState,
  CalloutMilestone,
} from '@squad-sports/core';
import type { MilestoneMetadata } from '@squad-sports/core';
import modalQueue from '../state/modal-queue';
import { DialogKey, BottomSheetKey } from '../state/modal-keys';

/**
 * Non-rendering component that registers milestone-to-modal handlers.
 *
 * Each handler maps a journey milestone to a modal push so that the
 * correct dialog or bottom sheet is presented when the milestone fires.
 *
 * Mount this once inside SquadProvider — it returns null.
 */
export function JourneySentinel() {
  useEffect(() => {
    const state = CustomerJourneyState.shared;

    const unsubs: Array<() => void> = [
      // 1. SOTD Introduction tutorial
      state.registerCallout(
        CalloutMilestone.tutorialForSotd,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(DialogKey.SOTDIntroduction, metadata);
        },
      ),

      // 2. First squaddie added congratulation
      state.registerCallout(
        CalloutMilestone.congratsForFirstSquaddie,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(DialogKey.progressCongratulation, {
            title: 'You added your first Squaddie!',
            ...metadata,
          });
        },
      ),

      // 3. First friend invite congratulation
      state.registerCallout(
        CalloutMilestone.congratsForFirstFriendInvite,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(DialogKey.progressCongratulation, {
            title: 'You invited your first friend!',
            ...metadata,
          });
        },
      ),

      // 4. First message sent congratulation
      state.registerCallout(
        CalloutMilestone.congratsForFirstMessage,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(DialogKey.progressCongratulation, {
            title: 'You sent your first message!',
            ...metadata,
          });
        },
      ),

      // 5. First poll response congratulation
      state.registerCallout(
        CalloutMilestone.congratsForFirstPoll,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(DialogKey.progressCongratulation, {
            title: 'You answered your first poll!',
            ...metadata,
          });
        },
      ),

      // 6. Sophia introduction tutorial
      state.registerCallout(
        CalloutMilestone.tutorialForSophia,
        () => {
          modalQueue.push(BottomSheetKey.sophiaIntroduction);
        },
      ),

      // 7. Invite feature introduction tutorial
      state.registerCallout(
        CalloutMilestone.tutorialForInvitation,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(BottomSheetKey.inviteFeatureIntroduction, metadata);
        },
      ),

      // 8. Quick tip: first invite share
      state.registerCallout(
        CalloutMilestone.quickTipFirstInviteShare,
        (metadata: MilestoneMetadata) => {
          modalQueue.push(BottomSheetKey.quickTip, {
            title: 'Your QR Code link expires in 1 hr. ',
            message: 'Anyone who joins within 1 hr will be in your circle.',
            ...metadata,
          });
        },
      ),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  return null;
}
