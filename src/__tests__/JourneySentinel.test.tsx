import React from 'react';

// --- Mocks ---

const mockRegisterCallout = jest.fn();
const mockPush = jest.fn();

jest.mock('@squad-sports/core', () => ({
  CustomerJourneyState: {
    shared: {
      registerCallout: mockRegisterCallout,
    },
  },
  CalloutMilestone: {
    tutorialForSotd: 'seen_sotd_introduction',
    congratsForFirstSquaddie: 'congrats_first_squaddie_added',
    congratsForFirstFriendInvite: 'congrats_first_friend_invite',
    congratsForFirstMessage: 'congrats_first_message_sent',
    congratsForFirstPoll: 'congrats_first-poll_response',
    tutorialForSophia: 'seen_sophia_introduction',
    tutorialForInvitation: 'seen_invite_feature_intro',
    quickTipFirstInviteShare: 'quick_tip_first_invite_share',
  },
}));

jest.mock('../state/modal-queue', () => ({
  __esModule: true,
  default: { push: mockPush },
}));

jest.mock('../state/modal-keys', () => ({
  DialogKey: {
    SOTDIntroduction: 'sotd-introduction',
    progressCongratulation: 'progress-congratulation',
  },
  BottomSheetKey: {
    sophiaIntroduction: 'sophia-introduction',
    inviteFeatureIntroduction: 'invite-feature-introduction',
    quickTip: 'quick-tip',
  },
}));

// Must import after mocks are set up
import { JourneySentinel } from '../journey/JourneySentinel';

// Minimal React render helper (avoids react-test-renderer dependency issues)
function renderNull(Component: React.FC) {
  const { useEffect } = React;

  // Collect effects
  const effects: Array<() => (() => void) | void> = [];
  const origUseEffect = useEffect;

  // We need to actually invoke the component to capture hooks
  jest.spyOn(React, 'useEffect').mockImplementation((fn) => {
    effects.push(fn);
  });

  Component({});

  // Restore
  (React.useEffect as any).mockRestore?.();

  // Run all effects and collect cleanup functions
  const cleanups: Array<() => void> = [];
  for (const effect of effects) {
    const cleanup = effect();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  }

  return {
    unmount: () => cleanups.forEach((fn) => fn()),
  };
}

describe('JourneySentinel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Each registerCallout returns an unsubscribe function
    mockRegisterCallout.mockReturnValue(jest.fn());
  });

  it('registers 8 milestone handlers on mount', () => {
    renderNull(JourneySentinel);
    expect(mockRegisterCallout).toHaveBeenCalledTimes(8);
  });

  it('registers tutorialForSotd that pushes SOTDIntroduction dialog', () => {
    renderNull(JourneySentinel);

    const sotdCall = mockRegisterCallout.mock.calls.find(
      ([milestone]: [string]) => milestone === 'seen_sotd_introduction',
    );
    expect(sotdCall).toBeDefined();

    // Invoke the handler
    const handler = sotdCall![1];
    const metadata = { source: 'test' };
    handler(metadata);

    expect(mockPush).toHaveBeenCalledWith('sotd-introduction', metadata);
  });

  it('registers congratsForFirstSquaddie that pushes progressCongratulation', () => {
    renderNull(JourneySentinel);

    const call = mockRegisterCallout.mock.calls.find(
      ([milestone]: [string]) => milestone === 'congrats_first_squaddie_added',
    );
    expect(call).toBeDefined();

    call![1]({});
    expect(mockPush).toHaveBeenCalledWith(
      'progress-congratulation',
      expect.objectContaining({ title: 'You added your first Squaddie!' }),
    );
  });

  it('registers tutorialForSophia that pushes sophiaIntroduction bottom sheet', () => {
    renderNull(JourneySentinel);

    const call = mockRegisterCallout.mock.calls.find(
      ([milestone]: [string]) => milestone === 'seen_sophia_introduction',
    );
    expect(call).toBeDefined();

    call![1]({});
    expect(mockPush).toHaveBeenCalledWith('sophia-introduction');
  });

  it('registers quickTipFirstInviteShare with default text', () => {
    renderNull(JourneySentinel);

    const call = mockRegisterCallout.mock.calls.find(
      ([milestone]: [string]) => milestone === 'quick_tip_first_invite_share',
    );
    expect(call).toBeDefined();

    call![1]({});
    expect(mockPush).toHaveBeenCalledWith(
      'quick-tip',
      expect.objectContaining({
        title: 'Your QR Code link expires in 1 hr. ',
        message: 'Anyone who joins within 1 hr will be in your circle.',
      }),
    );
  });

  it('unsubscribes all handlers on unmount', () => {
    const unsubFns = Array.from({ length: 8 }, () => jest.fn());
    let callIndex = 0;
    mockRegisterCallout.mockImplementation(() => {
      return unsubFns[callIndex++];
    });

    const { unmount } = renderNull(JourneySentinel);
    unmount();

    for (const unsub of unsubFns) {
      expect(unsub).toHaveBeenCalledTimes(1);
    }
  });
});
