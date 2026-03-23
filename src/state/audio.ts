/**
 * Audio playback/recording atoms.
 * Ported from squad-demo/src/atoms/audio.ts.
 */
import { atom, atomFamily } from 'recoil';

export type AudioStatus = {
  isPlaying: boolean;
  isLoaded: boolean;
  durationMs: number;
  positionMs: number;
};

export const playerForRecorder = atomFamily<unknown | null, string>({
  key: 'squad-sdk:audio:recorder:player',
  default: null,
});

export const statusForAudioDevice = atomFamily<AudioStatus | null, string | null>({
  key: 'squad-sdk:audio:device:status',
  default: null,
});

export const positionForAudioPlayer = atomFamily<number, string | null>({
  key: 'squad-sdk:audio:device:progress',
  default: 0,
});

// Global audio state
export const isAudioRecording = atom<boolean>({
  key: 'squad-sdk:audio:isRecording',
  default: false,
});

export const activeAudioPlayerId = atom<string | null>({
  key: 'squad-sdk:audio:activePlayerId',
  default: null,
});
