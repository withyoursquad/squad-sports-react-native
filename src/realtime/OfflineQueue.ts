import type { StorageAdapter } from '@squad-sports/core';

export type OfflineActionType =
  | 'message:create'
  | 'freestyle:create'
  | 'poll:response'
  | 'connection:invite'
  | 'message:reaction'
  | 'freestyle:reaction'
  | 'user:update';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: unknown;
  createdAt: number;
  attempts: number;
}

const STORAGE_KEY = 'SQUAD_SDK_OFFLINE_QUEUE';

/**
 * Queues mutations when offline and replays them when connectivity returns.
 * Ported from squad-demo/src/atoms/sync/offline-support.ts.
 */
export class OfflineQueue {
  private queue: OfflineAction[] = [];
  private isProcessing = false;
  private storage: StorageAdapter | null = null;

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? null;
    this.loadFromStorage();
  }

  /**
   * Add an action to the offline queue.
   */
  enqueue(type: OfflineActionType, payload: unknown): void {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      createdAt: Date.now(),
      attempts: 0,
    };

    this.queue.push(action);
    this.persistToStorage();
  }

  /**
   * Process all queued actions.
   * Call this when connectivity is restored.
   */
  async processQueue(
    executor: (action: OfflineAction) => Promise<boolean>,
  ): Promise<{ succeeded: number; failed: number }> {
    if (this.isProcessing || this.queue.length === 0) {
      return { succeeded: 0, failed: 0 };
    }

    this.isProcessing = true;
    let succeeded = 0;
    let failed = 0;

    const pending = [...this.queue];
    this.queue = [];

    for (const action of pending) {
      try {
        action.attempts++;
        const success = await executor(action);

        if (success) {
          succeeded++;
        } else {
          // Re-queue if under max attempts
          if (action.attempts < 3) {
            this.queue.push(action);
          } else {
            failed++;
          }
        }
      } catch {
        if (action.attempts < 3) {
          this.queue.push(action);
        } else {
          failed++;
        }
      }
    }

    this.isProcessing = false;
    this.persistToStorage();

    return { succeeded, failed };
  }

  /**
   * Get the number of pending actions.
   */
  get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Clear all queued actions.
   */
  clear(): void {
    this.queue = [];
    this.persistToStorage();
  }

  // --- Persistence ---

  private async loadFromStorage(): Promise<void> {
    if (!this.storage) return;
    try {
      const raw = await this.storage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {}
  }

  private async persistToStorage(): Promise<void> {
    if (!this.storage) return;
    try {
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {}
  }
}
