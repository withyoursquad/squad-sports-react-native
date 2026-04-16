const mockPreloadImage = jest.fn().mockResolvedValue(undefined);

jest.mock('react-native', () => ({
  Image: { prefetch: jest.fn().mockResolvedValue(true) },
}));

jest.mock('../utils/ImageOptimizationManager', () => ({
  ImageOptimizationManager: {
    shared: {
      preloadImage: mockPreloadImage,
    },
  },
}));

import React from 'react';
import { useImagePreloader } from '../hooks/useImagePreloader';

describe('useImagePreloader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPreloadImage.mockResolvedValue(undefined);
  });

  it('returns loaded: false initially and true after preload', async () => {
    let resolvePreload: () => void;
    mockPreloadImage.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePreload = resolve;
      }),
    );

    // Capture hook state
    const states: Array<{ loaded: boolean; error: string | null }> = [];
    const effects: Array<{ fn: () => (() => void) | void; deps: any[] }> = [];

    jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
      const val = typeof initial === 'function' ? initial() : initial;
      let current = val;
      const setter = jest.fn((v: any) => {
        current = typeof v === 'function' ? v(current) : v;
      });
      return [current, setter] as any;
    });

    jest.spyOn(React, 'useEffect').mockImplementation((fn, deps) => {
      effects.push({ fn, deps: deps ?? [] });
    });

    const result = useImagePreloader('https://example.com/test.png');

    expect(result.loaded).toBe(false);
    expect(result.error).toBeNull();

    // Run the effect
    effects[0]?.fn();

    expect(mockPreloadImage).toHaveBeenCalledWith('https://example.com/test.png');

    (React.useState as any).mockRestore?.();
    (React.useEffect as any).mockRestore?.();
  });

  it('returns loaded: false and no error when source is null', () => {
    const effects: Array<{ fn: () => (() => void) | void; deps: any[] }> = [];

    jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
      const val = typeof initial === 'function' ? initial() : initial;
      return [val, jest.fn()] as any;
    });

    jest.spyOn(React, 'useEffect').mockImplementation((fn, deps) => {
      effects.push({ fn, deps: deps ?? [] });
    });

    const result = useImagePreloader(null);

    expect(result.loaded).toBe(false);
    expect(result.error).toBeNull();

    // Run the effect — should not call preloadImage
    effects[0]?.fn();
    expect(mockPreloadImage).not.toHaveBeenCalled();

    (React.useState as any).mockRestore?.();
    (React.useEffect as any).mockRestore?.();
  });

  it('sets error when preload fails', async () => {
    mockPreloadImage.mockRejectedValue(new Error('Network error'));

    const effects: Array<{ fn: () => (() => void) | void; deps: any[] }> = [];
    const setters: jest.Mock[] = [];

    jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
      const val = typeof initial === 'function' ? initial() : initial;
      const setter = jest.fn();
      setters.push(setter);
      return [val, setter] as any;
    });

    jest.spyOn(React, 'useEffect').mockImplementation((fn, deps) => {
      effects.push({ fn, deps: deps ?? [] });
    });

    useImagePreloader('https://example.com/fail.png');

    // Run effect
    effects[0]?.fn();

    // Wait for promise rejection to propagate
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The error setter (second useState) should have been called with the error message
    const errorSetter = setters[1]; // error is second useState
    if (errorSetter) {
      expect(errorSetter).toHaveBeenCalledWith('Network error');
    }

    (React.useState as any).mockRestore?.();
    (React.useEffect as any).mockRestore?.();
  });
});
