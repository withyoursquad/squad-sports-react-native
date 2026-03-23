/**
 * Tests for the verification code resend cooldown logic.
 * This tests the pure timing logic extracted from EnterCodeScreen
 * without requiring a full React Native rendering environment.
 */

describe('Verification Cooldown Logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const COOLDOWN_SECONDS = 60;

  /**
   * Simulates the cooldown logic from EnterCodeScreen:
   * - startCooldown sets countdown to 60
   * - An interval decrements every second
   * - At 0, the interval is cleared
   */
  function createCooldownController() {
    let resendCooldown = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startCooldown() {
      resendCooldown = COOLDOWN_SECONDS;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        resendCooldown -= 1;
        if (resendCooldown <= 0) {
          resendCooldown = 0;
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
        }
      }, 1000);
    }

    function cleanup() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }

    return {
      startCooldown,
      cleanup,
      getCooldown: () => resendCooldown,
      isIntervalActive: () => intervalId !== null,
    };
  }

  test('cooldown starts at 60 seconds', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();
    expect(ctrl.getCooldown()).toBe(60);
    ctrl.cleanup();
  });

  test('cooldown decrements each second', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    jest.advanceTimersByTime(1000);
    expect(ctrl.getCooldown()).toBe(59);

    jest.advanceTimersByTime(1000);
    expect(ctrl.getCooldown()).toBe(58);

    ctrl.cleanup();
  });

  test('cooldown reaches 0 and stops', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    jest.advanceTimersByTime(60 * 1000);
    expect(ctrl.getCooldown()).toBe(0);
    expect(ctrl.isIntervalActive()).toBe(false);
  });

  test('button is disabled while cooldown > 0', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    const isDisabled = () => ctrl.getCooldown() > 0;

    expect(isDisabled()).toBe(true);

    jest.advanceTimersByTime(30_000);
    expect(isDisabled()).toBe(true);
    expect(ctrl.getCooldown()).toBe(30);

    jest.advanceTimersByTime(30_000);
    expect(isDisabled()).toBe(false);

    ctrl.cleanup();
  });

  test('cleanup stops the interval', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    jest.advanceTimersByTime(5000);
    expect(ctrl.getCooldown()).toBe(55);

    ctrl.cleanup();

    // After cleanup, advancing time should not change the cooldown
    const cooldownAtCleanup = ctrl.getCooldown();
    jest.advanceTimersByTime(10_000);
    expect(ctrl.getCooldown()).toBe(cooldownAtCleanup);
  });

  test('restarting cooldown resets to 60', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    jest.advanceTimersByTime(20_000);
    expect(ctrl.getCooldown()).toBe(40);

    // Restart
    ctrl.startCooldown();
    expect(ctrl.getCooldown()).toBe(60);

    jest.advanceTimersByTime(1000);
    expect(ctrl.getCooldown()).toBe(59);

    ctrl.cleanup();
  });

  test('countdown display format', () => {
    const ctrl = createCooldownController();
    ctrl.startCooldown();

    // Mimics the display logic from EnterCodeScreen
    const getDisplayText = () => {
      const cd = ctrl.getCooldown();
      return cd > 0 ? ` Resend (${cd}s)` : ' Resend';
    };

    expect(getDisplayText()).toBe(' Resend (60s)');

    jest.advanceTimersByTime(45_000);
    expect(getDisplayText()).toBe(' Resend (15s)');

    jest.advanceTimersByTime(15_000);
    expect(getDisplayText()).toBe(' Resend');

    ctrl.cleanup();
  });
});
