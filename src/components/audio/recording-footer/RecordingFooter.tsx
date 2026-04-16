/**
 * RecordingFooter — wrapper that manages the recording lifecycle.
 * Ported from squad-demo/src/components/audio/recording-footer/RecordingFooter.tsx.
 *
 * This is the public API surface. Drop this component into any screen that
 * needs audio recording. All internal state (recording, playback, permissions)
 * is handled by RecordingFooterState.
 */
import React from 'react';
import RecordingFooterState from './RecordingFooterState';

export interface RecordingFooterProps {
  /** Called with the local file URI when the user submits. */
  onSubmit: (filepath: string) => void;
  /** Disables the record button. */
  disabled?: boolean;
  /** Shows a loading indicator on the send button. */
  loading?: boolean;
  /** Bottom safe-area inset to offset the footer. */
  bottomInset?: number;
}

export default function RecordingFooter({
  onSubmit,
  disabled,
  loading,
  bottomInset,
}: RecordingFooterProps) {
  return (
    <RecordingFooterState
      onSubmit={onSubmit}
      disabled={disabled}
      loading={loading}
      bottomInset={bottomInset}
    />
  );
}
