// AsyncStorage is already mocked by jest.setup.js — get a reference to it
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BatchedStorageWriter } from '@squad-sports/core';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

const mockStorage = AsyncStorage as unknown as Record<string, jest.Mock>;

describe('BatchedStorageWriter + AsyncStorageAdapter integration', () => {
  let adapter: AsyncStorageAdapter;
  let writer: BatchedStorageWriter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AsyncStorageAdapter();
    writer = new BatchedStorageWriter(adapter);
  });

  it('batches multiple enqueue calls into a single multiSet', async () => {
    writer.enqueue('key1', 'value1');
    writer.enqueue('key2', 'value2');
    writer.enqueue('key3', 'value3');

    // Wait for microtask flush
    await new Promise((resolve) => queueMicrotask(resolve));
    // Allow the flush promise to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiSet).toHaveBeenCalledTimes(1);
    expect(mockStorage.multiSet).toHaveBeenCalledWith([
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ]);
  });

  it('batches remove operations into a single multiRemove', async () => {
    writer.enqueue('key1', null);
    writer.enqueue('key2', null);

    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiRemove).toHaveBeenCalledTimes(1);
    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['key1', 'key2']);
  });

  it('handles mixed set and remove in the same batch', async () => {
    writer.enqueue('key1', 'value1');
    writer.enqueue('key2', null);
    writer.enqueue('key3', 'value3');

    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiSet).toHaveBeenCalledWith([
      ['key1', 'value1'],
      ['key3', 'value3'],
    ]);
    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['key2']);
  });

  it('remove overwrites a previous set for the same key', async () => {
    writer.enqueue('key1', 'value1');
    writer.enqueue('key1', null); // remove overwrites

    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiSet).not.toHaveBeenCalled();
    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['key1']);
  });

  it('set overwrites a previous remove for the same key', async () => {
    writer.enqueue('key1', null);
    writer.enqueue('key1', 'final-value'); // set overwrites remove

    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiRemove).not.toHaveBeenCalled();
    expect(mockStorage.multiSet).toHaveBeenCalledWith([
      ['key1', 'final-value'],
    ]);
  });

  it('suppresses writes when suppressWrites is true', async () => {
    writer.suppressWrites = true;

    writer.enqueue('key1', 'value1');
    writer.enqueue('key2', null);

    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiSet).not.toHaveBeenCalled();
    expect(mockStorage.multiRemove).not.toHaveBeenCalled();
  });

  it('processes separate batches for calls across microtask boundaries', async () => {
    writer.enqueue('batch1-key', 'batch1-value');

    // Flush first batch
    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    writer.enqueue('batch2-key', 'batch2-value');

    // Flush second batch
    await new Promise((resolve) => queueMicrotask(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorage.multiSet).toHaveBeenCalledTimes(2);
    expect(mockStorage.multiSet).toHaveBeenNthCalledWith(1, [
      ['batch1-key', 'batch1-value'],
    ]);
    expect(mockStorage.multiSet).toHaveBeenNthCalledWith(2, [
      ['batch2-key', 'batch2-value'],
    ]);
  });
});
