// AsyncStorage is already mocked by jest.setup.js — get a reference to it
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

// Cast to access mock functions set up by jest.setup.js
const mockStorage = AsyncStorage as unknown as Record<string, jest.Mock>;

describe('AsyncStorageAdapter', () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AsyncStorageAdapter();
  });

  it('delegates getItem to AsyncStorage', async () => {
    mockStorage.getItem.mockResolvedValue('stored-value');
    const result = await adapter.getItem('key1');

    expect(mockStorage.getItem).toHaveBeenCalledWith('key1');
    expect(result).toBe('stored-value');
  });

  it('delegates setItem to AsyncStorage', async () => {
    await adapter.setItem('key1', 'value1');
    expect(mockStorage.setItem).toHaveBeenCalledWith('key1', 'value1');
  });

  it('delegates removeItem to AsyncStorage', async () => {
    await adapter.removeItem('key1');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('key1');
  });

  it('delegates multiSet to AsyncStorage', async () => {
    const entries: [string, string][] = [
      ['a', '1'],
      ['b', '2'],
    ];
    await adapter.multiSet(entries);
    expect(mockStorage.multiSet).toHaveBeenCalledWith(entries);
  });

  it('delegates multiRemove to AsyncStorage', async () => {
    await adapter.multiRemove(['a', 'b']);
    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['a', 'b']);
  });

  it('delegates getAllKeys to AsyncStorage', async () => {
    mockStorage.getAllKeys.mockResolvedValue(['key1', 'key2']);
    const keys = await adapter.getAllKeys();

    expect(mockStorage.getAllKeys).toHaveBeenCalled();
    expect(keys).toEqual(['key1', 'key2']);
  });

  it('returns null from getItem when no value stored', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    const result = await adapter.getItem('empty');
    expect(result).toBeNull();
  });
});
