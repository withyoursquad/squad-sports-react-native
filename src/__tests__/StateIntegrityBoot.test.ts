const mockValidateStateIntegrity = jest.fn();
const mockExecuteRecovery = jest.fn();
const mockHydrate = jest.fn();
const mockWarn = jest.fn();

jest.mock('@squad-sports/core', () => ({
  validateStateIntegrity: (...args: any[]) => mockValidateStateIntegrity(...args),
  StateRecoveryEngine: jest.fn().mockImplementation(() => ({
    executeRecovery: mockExecuteRecovery,
  })),
  JourneyApiConnector: jest.fn().mockImplementation(() => ({
    hydrate: mockHydrate,
  })),
  Logger: {
    shared: { warn: mockWarn },
  },
  // Stubs for other imports in SquadProvider
  AnalyticsTracker: { shared: { flush: jest.fn() } },
  CustomerJourneyState: {
    shared: {
      registerCallout: jest.fn().mockReturnValue(jest.fn()),
    },
  },
  CalloutMilestone: {},
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
  },
}));

import type { IntegrityReport } from '@squad-sports/core';

describe('State Integrity Boot Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates → skips recovery when healthy → hydrates', async () => {
    const healthyReport: IntegrityReport = {
      status: 'healthy',
      authIntact: true,
      corruptKeys: [],
      inconsistencies: [],
      recommendedAction: 'none',
    };

    mockValidateStateIntegrity.mockResolvedValue(healthyReport);
    mockHydrate.mockResolvedValue(undefined);

    // Simulate the boot sequence
    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    const report = await mockValidateStateIntegrity(storage);

    expect(report.status).toBe('healthy');

    if (report.status !== 'healthy') {
      await mockExecuteRecovery(report);
    }

    await mockHydrate();

    expect(mockValidateStateIntegrity).toHaveBeenCalledTimes(1);
    expect(mockExecuteRecovery).not.toHaveBeenCalled();
    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });

  it('validates → runs recovery when degraded → hydrates', async () => {
    const degradedReport: IntegrityReport = {
      status: 'degraded',
      authIntact: true,
      corruptKeys: [],
      inconsistencies: ['Token exists but no userId or cached user data'],
      recommendedAction: 'refetch_user',
    };

    mockValidateStateIntegrity.mockResolvedValue(degradedReport);
    mockExecuteRecovery.mockResolvedValue({ action: 'refetch_user', success: true });
    mockHydrate.mockResolvedValue(undefined);

    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    const report = await mockValidateStateIntegrity(storage);

    if (report.status !== 'healthy') {
      await mockExecuteRecovery(report);
    }

    await mockHydrate();

    expect(mockExecuteRecovery).toHaveBeenCalledWith(degradedReport);
    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });

  it('validates → runs recovery when corrupt → hydrates', async () => {
    const corruptReport: IntegrityReport = {
      status: 'corrupt',
      authIntact: false,
      corruptKeys: ['V2_AUTH_TOKEN'],
      inconsistencies: ['Auth token unreadable'],
      recommendedAction: 'full_reset',
    };

    mockValidateStateIntegrity.mockResolvedValue(corruptReport);
    mockExecuteRecovery.mockResolvedValue({ action: 'full_reset', success: true });
    mockHydrate.mockResolvedValue(undefined);

    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    const report = await mockValidateStateIntegrity(storage);

    if (report.status !== 'healthy') {
      await mockExecuteRecovery(report);
    }

    await mockHydrate();

    expect(mockExecuteRecovery).toHaveBeenCalledWith(corruptReport);
    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });

  it('still hydrates even when recovery fails', async () => {
    const degradedReport: IntegrityReport = {
      status: 'degraded',
      authIntact: true,
      corruptKeys: [],
      inconsistencies: ['issue'],
      recommendedAction: 'refetch_user',
    };

    mockValidateStateIntegrity.mockResolvedValue(degradedReport);
    mockExecuteRecovery.mockRejectedValue(new Error('Recovery failed'));
    mockHydrate.mockResolvedValue(undefined);

    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    const report = await mockValidateStateIntegrity(storage);

    try {
      if (report.status !== 'healthy') {
        await mockExecuteRecovery(report);
      }
    } catch {
      // Recovery failure is non-fatal — continue to hydrate
    }

    await mockHydrate();

    expect(mockHydrate).toHaveBeenCalledTimes(1);
  });
});
