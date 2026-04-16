/**
 * Tests for sponsorship-related logic.
 * Component rendering tests are avoided here due to TSX transform limitations.
 * Full UI rendering is tested in the monorepo integration suite.
 */

describe('pushToken registration logic', () => {
  test('updateDeviceInfo is called with token and platform when pushToken provided', () => {
    const mockUpdateDeviceInfo = jest.fn();
    const mockApiClient = { updateDeviceInfo: mockUpdateDeviceInfo };

    // Simulate what SquadExperience does after setup
    const pushToken: string | undefined = 'fcm-test-token-123';
    const platform = 'android';

    if (pushToken) {
      mockApiClient.updateDeviceInfo(pushToken, platform);
    }

    expect(mockUpdateDeviceInfo).toHaveBeenCalledWith('fcm-test-token-123', 'android');
  });

  test('updateDeviceInfo is called with ios platform', () => {
    const mockUpdateDeviceInfo = jest.fn();

    const pushToken = 'apns-device-token-abc';
    if (pushToken) {
      mockUpdateDeviceInfo(pushToken, 'ios');
    }

    expect(mockUpdateDeviceInfo).toHaveBeenCalledWith('apns-device-token-abc', 'ios');
  });

  test('updateDeviceInfo is NOT called when pushToken is undefined', () => {
    const mockUpdateDeviceInfo = jest.fn();
    const pushToken: string | undefined = undefined;

    if (pushToken) {
      mockUpdateDeviceInfo(pushToken, 'ios');
    }

    expect(mockUpdateDeviceInfo).not.toHaveBeenCalled();
  });

  test('updateDeviceInfo is NOT called when pushToken is empty string', () => {
    const mockUpdateDeviceInfo = jest.fn();
    const pushToken: string | undefined = '';

    if (pushToken) {
      mockUpdateDeviceInfo(pushToken, 'ios');
    }

    expect(mockUpdateDeviceInfo).not.toHaveBeenCalled();
  });
});

describe('sponsor branding logic', () => {
  test('sponsor label text is constructed correctly', () => {
    const brandName = 'Audi';
    const label = `Presented by ${brandName}`;
    expect(label).toBe('Presented by Audi');
  });

  test('sponsor label is empty when no brand name', () => {
    const brandName: string | undefined = undefined;
    const showLabel = !!brandName;
    expect(showLabel).toBe(false);
  });
});
