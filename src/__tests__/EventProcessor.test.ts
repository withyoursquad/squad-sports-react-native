import { EventProcessor } from '../realtime/EventProcessor';

// Mock the dynamic import for react-native-sse
jest.mock('react-native-sse', () => {
  throw new Error('not available');
});

describe('EventProcessor', () => {
  beforeEach(() => {
    EventProcessor.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    EventProcessor.reset();
    jest.useRealTimers();
  });

  // --- Singleton ---

  describe('singleton pattern', () => {
    test('shared returns the same instance', () => {
      const a = EventProcessor.shared;
      const b = EventProcessor.shared;
      expect(a).toBe(b);
    });

    test('reset clears the instance, next shared creates new one', () => {
      const a = EventProcessor.shared;
      EventProcessor.reset();
      const b = EventProcessor.shared;
      expect(a).not.toBe(b);
    });
  });

  // --- Connect / disconnect lifecycle ---

  describe('connect/disconnect lifecycle', () => {
    test('connect does nothing without apiClient', async () => {
      const ep = EventProcessor.shared;
      ep.setShouldAllowEvents(true);
      // No apiClient set, should not throw
      await ep.connect();
      expect(ep.getConnectionQuality()).toBe('disconnected');
    });

    test('connect does nothing when events not allowed', async () => {
      const ep = EventProcessor.shared;
      ep.setApiClient({ currentToken: 'tok', baseUrl: 'http://x' } as any);
      // allowEvents defaults to false
      await ep.connect();
      expect(ep.getConnectionQuality()).toBe('disconnected');
    });

    test('disconnect sets quality to disconnected', () => {
      const ep = EventProcessor.shared;
      ep.disconnect();
      expect(ep.getConnectionQuality()).toBe('disconnected');
    });

    test('setShouldAllowEvents(false) calls disconnect', () => {
      const ep = EventProcessor.shared;
      const spy = jest.spyOn(ep, 'disconnect');
      ep.setShouldAllowEvents(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  // --- Event deduplication ---

  describe('event deduplication', () => {
    test('same event key is ignored on second emit', () => {
      const ep = EventProcessor.shared;
      const handler = jest.fn();
      ep.emitter.on('test-event', handler);

      // Access private processEvent via bracket notation
      (ep as any).connectionQuality = 'good';
      (ep as any).processEvent('test-event', { id: 1 });
      (ep as any).processEvent('test-event', { id: 1 });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('different data for same type emits twice', () => {
      const ep = EventProcessor.shared;
      const handler = jest.fn();
      ep.emitter.on('test-event', handler);

      (ep as any).connectionQuality = 'good';
      (ep as any).processEvent('test-event', { id: 1 });
      (ep as any).processEvent('test-event', { id: 2 });

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  // --- Dedupe TTL pruning ---

  describe('dedupe TTL pruning', () => {
    test('entries older than 1 hour are pruned on 100th insertion', () => {
      const ep = EventProcessor.shared;
      (ep as any).connectionQuality = 'good';

      const realNow = Date.now;

      // Insert 99 events at "old" time (2 hours ago)
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      Date.now = jest.fn(() => twoHoursAgo);

      for (let i = 0; i < 99; i++) {
        (ep as any).processEvent('prune-test', { i });
      }
      expect((ep as any).processedEventIds.size).toBe(99);

      // 100th insertion at current time triggers pruning
      Date.now = jest.fn(() => realNow());
      (ep as any).processEvent('prune-test', { i: 99 });

      // All old entries should have been pruned, only the 100th remains
      expect((ep as any).processedEventIds.size).toBe(1);

      Date.now = realNow;
    });
  });

  // --- Dedupe hard cap ---

  describe('dedupe hard cap at 5000', () => {
    test('trims to 3000 entries when exceeding 5000', () => {
      const ep = EventProcessor.shared;
      (ep as any).connectionQuality = 'good';

      // Pre-fill the map with 5001 entries
      const map = (ep as any).processedEventIds as Map<string, number>;
      for (let i = 0; i < 5001; i++) {
        map.set(`key-${i}`, Date.now() + i);
      }
      // Set insertionCount to something that won't trigger the 100-modulo prune
      (ep as any).insertionCount = 50;

      // processEvent will check hard cap after inserting
      (ep as any).processEvent('cap-trigger', { cap: true });

      // Should have been trimmed: 5001 + 1 = 5002 > 5000, trim to 3000
      expect(map.size).toBeLessThanOrEqual(3001); // 3000 kept + 1 new
    });
  });

  // --- Event buffering when connection quality is 'poor' ---

  describe('event buffering', () => {
    test('buffers events when connection quality is poor', () => {
      const ep = EventProcessor.shared;
      const handler = jest.fn();
      ep.emitter.on('buffered-event', handler);

      (ep as any).connectionQuality = 'poor';
      (ep as any).processEvent('buffered-event', { msg: 'hello' });

      // Should NOT have been emitted directly
      expect(handler).not.toHaveBeenCalled();
      // Should be in the buffer
      expect((ep as any).eventBuffer.length).toBe(1);
      expect((ep as any).eventBuffer[0].type).toBe('buffered-event');
    });

    test('buffer flush emits all buffered events', () => {
      const ep = EventProcessor.shared;
      const handler = jest.fn();
      ep.emitter.on('buffered-event', handler);

      (ep as any).connectionQuality = 'poor';
      (ep as any).processEvent('buffered-event', { msg: 'a' });
      (ep as any).processEvent('buffered-event', { msg: 'b' });

      // Now flush
      (ep as any).flushEventBuffer();

      // Both should be emitted
      // Note: second event was deduplicated since data differs, so both are buffered
      expect(handler).toHaveBeenCalledTimes(2);
      expect((ep as any).eventBuffer.length).toBe(0);
    });
  });

  // --- Reconnect with exponential backoff ---

  describe('reconnection', () => {
    test('scheduleReconnect uses exponential backoff', () => {
      const ep = EventProcessor.shared;
      const connectSpy = jest.spyOn(ep, 'connect').mockResolvedValue();

      // First reconnect: ~1000ms (INITIAL_BACKOFF * 2^0)
      (ep as any).scheduleReconnect();
      expect((ep as any).reconnectAttempts).toBe(1);

      // Advance past the max possible delay (1000 + 10% jitter = 1100)
      jest.advanceTimersByTime(1200);
      expect(connectSpy).toHaveBeenCalledTimes(1);

      // Second reconnect: ~2000ms
      (ep as any).scheduleReconnect();
      expect((ep as any).reconnectAttempts).toBe(2);

      jest.advanceTimersByTime(2500);
      expect(connectSpy).toHaveBeenCalledTimes(2);

      connectSpy.mockRestore();
    });

    test('max reconnect attempts emits connection:maxRetriesReached', () => {
      const ep = EventProcessor.shared;
      const maxRetriesHandler = jest.fn();
      ep.emitter.on('connection:maxRetriesReached', maxRetriesHandler);

      // Set attempts to max
      (ep as any).reconnectAttempts = 10; // MAX_RECONNECT_ATTEMPTS

      (ep as any).scheduleReconnect();

      expect(maxRetriesHandler).toHaveBeenCalledTimes(1);
    });
  });

  // --- Connection-specific message forwarding ---

  describe('connection message forwarding', () => {
    test('connection:ID:message:create also emits message:create', () => {
      const ep = EventProcessor.shared;
      (ep as any).connectionQuality = 'good';

      const globalHandler = jest.fn();
      ep.emitter.on('message:create', globalHandler);

      (ep as any).processEvent('connection:abc:message:create', { text: 'hi' });

      expect(globalHandler).toHaveBeenCalledWith({ text: 'hi' });
    });
  });
});
