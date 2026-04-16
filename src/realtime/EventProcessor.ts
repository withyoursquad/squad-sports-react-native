import EventEmitter from 'eventemitter3';
import type { SquadApiClient } from '@squad-sports/core';

/* eslint-disable */
// Ambient declaration for EventSource in React Native environments
interface IEventSource {
  readyState: number;
  close(): void;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
}
declare var EventSource: { new(url: string, options?: any): IEventSource; OPEN: number };
/* eslint-enable */

export type ConnectionQuality = 'good' | 'poor' | 'disconnected';

interface QueuedEvent {
  type: string;
  data: unknown;
  attempts: number;
  timestamp: number;
}

/**
 * EventProcessor manages the real-time SSE connection and forwards
 * server events to the rest of the app via an EventEmitter.
 *
 * Ported from squad-demo/src/clients/EventProcessor.ts (1119 lines),
 * simplified for SDK use.
 *
 * Event types emitted:
 * - `connection:quality` — connection state changes
 * - `squad:member:add` / `squad:member:remove` — squad membership changes
 * - `squad:invite:sent` / `squad:invite:accepted` — invite lifecycle
 * - `connection:{id}:message:create` — new message in a connection
 * - `message:create` — global new message (for badge counts)
 * - `user:{id}:update` — user profile updated
 * - `feed:update` — freestyle feed changed
 * - `poll:update` — poll data changed
 * - `attendee:update` — event attendance changed
 * - `auth:invalid` — session expired
 */
export class EventProcessor {
  private static instance: EventProcessor | null = null;

  readonly emitter = new EventEmitter();

  private eventSource: IEventSource | null = null;
  private apiClient: SquadApiClient | null = null;
  private allowEvents = false;
  private connectionQuality: ConnectionQuality = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventBuffer: QueuedEvent[] = [];
  private processedEventIds = new Map<string, number>();
  private insertionCount = 0;

  // Backoff config
  private readonly INITIAL_BACKOFF = 1000;
  private readonly MAX_BACKOFF = 30000;
  private readonly BACKOFF_MULTIPLIER = 2;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly MAX_BUFFER_SIZE = 500;

  private constructor() {}

  static get shared(): EventProcessor {
    if (!EventProcessor.instance) {
      EventProcessor.instance = new EventProcessor();
    }
    return EventProcessor.instance;
  }

  static reset(): void {
    EventProcessor.instance?.disconnect();
    EventProcessor.instance = null;
  }

  // --- Configuration ---

  setApiClient(client: SquadApiClient): void {
    this.apiClient = client;
  }

  setShouldAllowEvents(allow: boolean): void {
    this.allowEvents = allow;
    if (!allow) {
      this.disconnect();
    }
  }

  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  // --- Connection lifecycle ---

  /**
   * Establish the SSE connection to the server.
   * Called by the provider when a valid access token is available.
   */
  async connect(): Promise<void> {
    if (!this.apiClient || !this.allowEvents) {
      return;
    }

    const token = this.apiClient.currentToken;
    if (!token) {
      return;
    }

    // Disconnect existing connection
    this.closeEventSource();

    const baseUrl = this.apiClient.baseUrl;
    const url = `${baseUrl}/v2/events`;

    try {
      // Create EventSource with auth header
      // Note: In React Native, we use the vendor react-native-sse library
      // which supports custom headers. For the SDK, we use a dynamic import.
      let RNEventSource: any;
      try {
        RNEventSource = (await import('react-native-sse')).default;
      } catch {
        // react-native-sse not available — use native EventSource if available
        if (typeof EventSource !== 'undefined') {
          RNEventSource = EventSource;
        } else {
          console.warn('[EventProcessor] No EventSource implementation available');
          return;
        }
      }

      const es = new RNEventSource(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.eventSource = es;
      this.reconnectAttempts = 0;

      // Handle connection open
      es.addEventListener('open', () => {
        this.updateConnectionQuality('good');
        this.reconnectAttempts = 0;
        this.flushEventBuffer();
      });

      // Handle incoming messages
      es.addEventListener('message', (event: any) => {
        if (!event?.data) return;

        try {
          const parsed = JSON.parse(event.data);
          const type = parsed.type ?? event.type ?? 'unknown';
          const data = parsed.data ?? parsed;

          this.processEvent(type, data);
        } catch {
          // Non-JSON event — emit raw
          this.processEvent('raw', event.data);
        }
      });

      // Handle errors
      es.addEventListener('error', () => {
        this.updateConnectionQuality('disconnected');
        this.closeEventSource();
        this.scheduleReconnect();
      });

      // Handle specific event types the server sends
      const serverEventTypes = [
        'connected',
        'squad:member:add', 'squad:member:remove',
        'squad:invite:sent', 'squad:invite:accepted',
        'feed:update', 'poll:update',
        'attendee:update',
      ];

      for (const eventType of serverEventTypes) {
        es.addEventListener(eventType, (event: any) => {
          try {
            const data = event?.data ? JSON.parse(event.data) : {};
            this.processEvent(eventType, data);
          } catch {
            this.processEvent(eventType, {});
          }
        });
      }
    } catch (error) {
      console.error('[EventProcessor] Connection failed:', error);
      this.updateConnectionQuality('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect the SSE connection.
   */
  disconnect(): void {
    this.closeEventSource();
    this.clearReconnectTimer();
    this.updateConnectionQuality('disconnected');
  }

  // --- Event processing ---

  private processEvent(type: string, data: unknown): void {
    // Deduplication with TTL
    const eventKey = `${type}:${JSON.stringify(data)}`;
    const now = Date.now();
    if (this.processedEventIds.has(eventKey)) return;
    this.processedEventIds.set(eventKey, now);
    this.insertionCount++;

    // Prune stale entries every 100 insertions
    if (this.insertionCount % 100 === 0) {
      const oneHourAgo = now - 60 * 60 * 1000;
      for (const [key, ts] of this.processedEventIds) {
        if (ts < oneHourAgo) this.processedEventIds.delete(key);
      }
    }

    // Hard cap at 5000
    if (this.processedEventIds.size > 5000) {
      const entries = Array.from(this.processedEventIds.entries())
        .sort((a, b) => a[1] - b[1]);
      const toRemove = entries.slice(0, entries.length - 3000);
      for (const [key] of toRemove) this.processedEventIds.delete(key);
    }

    // Buffer if connection is poor
    if (this.connectionQuality === 'poor') {
      this.addToBuffer({ type, data, attempts: 0, timestamp: Date.now() });
      return;
    }

    // Emit the event
    this.emitter.emit(type, data);

    // Also emit global message event for connection-specific messages
    if (/^connection:.+:message:create$/.test(type)) {
      this.emitter.emit('message:create', data);
    }
  }

  // --- Buffer management ---

  private addToBuffer(event: QueuedEvent): void {
    if (this.eventBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.eventBuffer.shift(); // Drop oldest
    }
    this.eventBuffer.push(event);
  }

  private flushEventBuffer(): void {
    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    for (const event of events) {
      this.emitter.emit(event.type, event.data);
    }
  }

  // --- Reconnection ---

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.warn('[EventProcessor] Max reconnect attempts reached');
      this.emitter.emit('connection:maxRetriesReached');
      return;
    }

    this.clearReconnectTimer();
    this.reconnectAttempts++;

    const delay = Math.min(
      this.INITIAL_BACKOFF * Math.pow(this.BACKOFF_MULTIPLIER, this.reconnectAttempts - 1),
      this.MAX_BACKOFF,
    );
    const jitter = Math.random() * 0.1 * delay;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay + jitter);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // --- Helpers ---

  private closeEventSource(): void {
    if (this.eventSource) {
      try {
        (this.eventSource as any).close();
      } catch {}
      this.eventSource = null;
    }
  }

  private updateConnectionQuality(quality: ConnectionQuality): void {
    if (quality !== this.connectionQuality) {
      this.connectionQuality = quality;
      this.emitter.emit('connection:quality', quality);
    }
  }
}
