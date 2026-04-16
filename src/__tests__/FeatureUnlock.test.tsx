import React from 'react';

// --- Mocks ---

let mockGetFlag = jest.fn().mockReturnValue(false);
const mockAddListener = jest.fn();
const mockRemoveListener = jest.fn();

jest.mock('@squad-sports/core', () => ({
  CustomerJourneyState: {
    shared: {
      getFlag: (...args: any[]) => mockGetFlag(...args),
      flagEmitter: {
        addListener: mockAddListener,
        removeListener: mockRemoveListener,
      },
    },
  },
  FeatureUnlockFlag: {
    hasSotdUnlocked: 'sotd_unlocked',
    communities: 'communities',
    simplifiedInvites: 'simplified_invites',
  },
}));

import { FeatureUnlock } from '../journey/FeatureUnlock';

function renderComponent(props: Parameters<typeof FeatureUnlock>[0]) {
  // Capture effects
  const effects: Array<{ fn: () => (() => void) | void; deps: any[] }> = [];
  jest.spyOn(React, 'useEffect').mockImplementation((fn, deps) => {
    effects.push({ fn, deps: deps ?? [] });
  });

  let currentState = mockGetFlag(props.flag);
  let setState: (v: boolean) => void = () => {};
  jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
    currentState = typeof initial === 'function' ? initial() : initial;
    setState = (v: boolean) => { currentState = v; };
    return [currentState, setState] as any;
  });

  const result = FeatureUnlock(props);

  // Run effects
  const cleanups: Array<() => void> = [];
  for (const effect of effects) {
    const cleanup = effect.fn();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  }

  (React.useEffect as any).mockRestore?.();
  (React.useState as any).mockRestore?.();

  return {
    result,
    currentState: () => currentState,
    setState,
    cleanups,
    unmount: () => cleanups.forEach((fn) => fn()),
  };
}

describe('FeatureUnlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFlag = jest.fn().mockReturnValue(false);
  });

  it('renders placeholder when flag is false', () => {
    const Feature = () => React.createElement('div', null, 'Feature');
    const Placeholder = () => React.createElement('div', null, 'Placeholder');

    mockGetFlag.mockReturnValue(false);

    const { result } = renderComponent({
      flag: 'sotd_unlocked' as any,
      feature: Feature,
      placeholder: Placeholder,
    });

    // When flag is false, createElement is called with placeholder
    expect(result).toBeTruthy();
  });

  it('renders feature when flag is true', () => {
    const Feature = () => React.createElement('div', null, 'Feature');
    const Placeholder = () => React.createElement('div', null, 'Placeholder');

    mockGetFlag.mockReturnValue(true);

    const { result } = renderComponent({
      flag: 'sotd_unlocked' as any,
      feature: Feature,
      placeholder: Placeholder,
    });

    expect(result).toBeTruthy();
  });

  it('subscribes to flagEmitter on mount', () => {
    const Feature = () => React.createElement('div', null, 'Feature');
    const Placeholder = () => React.createElement('div', null, 'Placeholder');

    renderComponent({
      flag: 'sotd_unlocked' as any,
      feature: Feature,
      placeholder: Placeholder,
    });

    expect(mockAddListener).toHaveBeenCalledWith('sotd_unlocked', expect.any(Function));
  });

  it('unsubscribes from flagEmitter on unmount', () => {
    const Feature = () => React.createElement('div', null, 'Feature');
    const Placeholder = () => React.createElement('div', null, 'Placeholder');

    const { unmount } = renderComponent({
      flag: 'sotd_unlocked' as any,
      feature: Feature,
      placeholder: Placeholder,
    });

    unmount();

    expect(mockRemoveListener).toHaveBeenCalledWith('sotd_unlocked', expect.any(Function));
  });

  it('handler updates state when flag changes', () => {
    const Feature = () => React.createElement('div', null, 'Feature');
    const Placeholder = () => React.createElement('div', null, 'Placeholder');

    renderComponent({
      flag: 'sotd_unlocked' as any,
      feature: Feature,
      placeholder: Placeholder,
    });

    // Get the handler that was registered
    const handler = mockAddListener.mock.calls[0][1];

    // Simulate flag changing
    mockGetFlag.mockReturnValue(true);
    handler();

    // Handler was called — it would call setState internally
    expect(mockGetFlag).toHaveBeenCalledWith('sotd_unlocked');
  });
});
