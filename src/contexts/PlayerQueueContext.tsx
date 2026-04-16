/**
 * PlayerQueueContext — manages a queue of audio players so only one plays at a time.
 * Ported from squad-demo/src/contexts/player-queue.tsx + player-index.tsx.
 */
import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

interface PlayerQueueItem {
  id: string;
  sound: Audio.Sound;
}

interface PlayerQueueContextValue {
  /** Register a player and get its ID */
  register: (id: string, sound: Audio.Sound) => void;
  /** Unregister a player */
  unregister: (id: string) => void;
  /** Play a specific player (pauses all others) */
  play: (id: string) => void;
  /** Pause the currently playing player */
  pause: () => void;
  /** Stop all players */
  stopAll: () => void;
  /** Currently playing player ID */
  activeId: string | null;
}

const PlayerQueueCtx = createContext<PlayerQueueContextValue>({
  register: () => {},
  unregister: () => {},
  play: () => {},
  pause: () => {},
  stopAll: () => {},
  activeId: null,
});

export function usePlayerQueue() {
  return useContext(PlayerQueueCtx);
}

export function PlayerQueueProvider({ children }: { children: React.ReactNode }) {
  const players = useRef(new Map<string, Audio.Sound>());
  const [activeId, setActiveId] = useState<string | null>(null);

  const register = useCallback((id: string, sound: Audio.Sound) => {
    players.current.set(id, sound);
  }, []);

  const unregister = useCallback((id: string) => {
    players.current.delete(id);
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const play = useCallback(async (id: string) => {
    // Pause all others
    for (const [playerId, sound] of players.current) {
      if (playerId !== id) {
        try { await sound.pauseAsync(); } catch {}
      }
    }

    // Play target
    const sound = players.current.get(id);
    if (sound) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        await sound.playAsync();
        setActiveId(id);
      } catch {}
    }
  }, []);

  const pause = useCallback(async () => {
    if (activeId) {
      const sound = players.current.get(activeId);
      if (sound) {
        try { await sound.pauseAsync(); } catch {}
      }
      setActiveId(null);
    }
  }, [activeId]);

  const stopAll = useCallback(async () => {
    for (const sound of players.current.values()) {
      try { await sound.stopAsync(); } catch {}
    }
    setActiveId(null);
  }, []);

  return (
    <PlayerQueueCtx.Provider value={{ register, unregister, play, pause, stopAll, activeId }}>
      {children}
    </PlayerQueueCtx.Provider>
  );
}
