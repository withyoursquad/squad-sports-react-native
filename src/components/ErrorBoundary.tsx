import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../theme/ThemeContext';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  screenName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches React rendering errors and shows a recovery UI.
 * Wrap individual screens so one crash doesn't kill the whole app.
 *
 * Usage:
 * ```tsx
 * <ScreenErrorBoundary screenName="Home">
 *   <HomeScreen />
 * </ScreenErrorBoundary>
 * ```
 */
export class ScreenErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.screenName ?? 'unknown'}]`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container} accessibilityRole="alert">
          <View style={styles.content}>
            <Text style={styles.icon} accessibilityLabel="Error icon">!</Text>
            <Text style={styles.title} accessibilityRole="header">
              Something went wrong
            </Text>
            <Text style={styles.message}>
              {this.props.screenName
                ? `There was a problem loading ${this.props.screenName}.`
                : 'An unexpected error occurred.'}
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.orange1,
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
    backgroundColor: 'rgba(233, 120, 92, 0.14)',
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.gray6,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    backgroundColor: Colors.purple1,
  },
  retryText: {
    color: Colors.gray1,
    fontWeight: '600',
    fontSize: 15,
  },
});
