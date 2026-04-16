import React from 'react';

// Mock react-native with proper function components
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    Pressable: (props: any) => React.createElement('Pressable', props),
    StyleSheet: {
      create: (styles: Record<string, any>) => styles,
    },
    Platform: { OS: 'ios' },
  };
});

// Mock the theme import
jest.mock('../theme/ThemeContext', () => ({
  Colors: {
    gray1: '#111',
    gray6: '#666',
    gray9: '#999',
    white: '#fff',
    orange1: '#e9785c',
    purple1: '#7c3aed',
  },
}));

import { create, act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { ScreenErrorBoundary } from '../components/ErrorBoundary';

// Suppress console.error noise from intentional errors
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// A component that throws on render
function ThrowingChild(): React.ReactElement {
  throw new Error('Test render crash');
}

describe('ScreenErrorBoundary', () => {
  test('renders children normally when no error', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        React.createElement(
          ScreenErrorBoundary,
          null,
          React.createElement('Text', null, 'Hello'),
        ),
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Hello');
  });

  test('catches render error and shows default fallback', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        React.createElement(
          ScreenErrorBoundary,
          null,
          React.createElement(ThrowingChild),
        ),
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Something went wrong');
    expect(json).toContain('Try Again');
  });

  test('screenName appears in error message', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        React.createElement(
          ScreenErrorBoundary,
          { screenName: 'Home' },
          React.createElement(ThrowingChild),
        ),
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Home');
  });

  test('onError callback fires', async () => {
    const onError = jest.fn();
    await act(async () => {
      create(
        React.createElement(
          ScreenErrorBoundary,
          { onError },
          React.createElement(ThrowingChild),
        ),
      );
    });
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  test('custom fallback prop is rendered', async () => {
    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        React.createElement(
          ScreenErrorBoundary,
          { fallback: React.createElement('Text', null, 'Custom Fallback') },
          React.createElement(ThrowingChild),
        ),
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Custom Fallback');
  });

  test('"Try Again" button resets error state', async () => {
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) throw new Error('boom');
      return React.createElement('Text', null, 'Recovered');
    }

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = create(
        React.createElement(
          ScreenErrorBoundary,
          null,
          React.createElement(ConditionalThrower),
        ),
      );
    });

    // Verify we're in error state
    const instance = tree!.root;
    const retryButton = instance.findByProps({ accessibilityLabel: 'Try again' });
    expect(retryButton).toBeTruthy();

    // Fix the child so it won't throw on re-render
    shouldThrow = false;

    // Press "Try Again"
    await act(async () => {
      retryButton.props.onPress();
    });

    // Should now show recovered content
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Recovered');
  });
});
