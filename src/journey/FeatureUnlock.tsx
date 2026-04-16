import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { CustomerJourneyState, FeatureUnlockFlag } from '@squad-sports/core';

type Props = {
  /** The feature flag to observe. */
  flag: FeatureUnlockFlag;
  /** Rendered when the flag is enabled. */
  feature: () => ReactElement;
  /** Rendered when the flag is disabled. */
  placeholder: () => ReactElement;
};

/**
 * Conditionally renders either `feature` or `placeholder` based on
 * the live value of a `FeatureUnlockFlag`.
 *
 * Subscribes to the flag emitter so re-renders happen automatically
 * when the flag changes at runtime (e.g. after journey hydration).
 */
export function FeatureUnlock({ flag, feature, placeholder }: Props) {
  const [isEnabled, setIsEnabled] = useState(
    CustomerJourneyState.shared.getFlag(flag),
  );

  useEffect(() => {
    const handler = () => {
      setIsEnabled(CustomerJourneyState.shared.getFlag(flag));
    };
    CustomerJourneyState.shared.flagEmitter.addListener(flag, handler);
    return () => {
      CustomerJourneyState.shared.flagEmitter.removeListener(flag, handler);
    };
  }, [flag]);

  return React.createElement(isEnabled ? feature : placeholder);
}
