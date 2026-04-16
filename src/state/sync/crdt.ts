/**
 * CRDT (Conflict-free Replicated Data Type) implementation.
 * Ported from squad-demo/src/atoms/sync/crdt.ts.
 *
 * Merges initial server state with local real-time updates,
 * supporting insert, update, and delete operations.
 */

export type CrdtArrayOperation = 'insert' | 'update' | 'delete';

export type CrdtArrayItem<ValueType> = {
  operation: CrdtArrayOperation;
  value: ValueType;
};

export type CrdtArray<KeyType, ValueType> = Map<KeyType, CrdtArrayItem<ValueType>>;

/**
 * Compile a CRDT array by merging initial server data with local updates.
 * - 'update' operations replace the initial item
 * - 'delete' operations remove the item
 * - 'insert' operations add new items not in the initial set
 */
export function compileCrdt<KeyType, ValueType>(
  initial: Array<ValueType>,
  updates: CrdtArray<KeyType, ValueType>,
  keyFrom: (value: ValueType) => KeyType,
): Array<ValueType> {
  const existing = new Map<KeyType, boolean>();

  return [
    ...initial
      .map(item => {
        const key = keyFrom(item);
        const update = updates.get(key);
        existing.set(key, true);

        if (update?.operation === 'update') {
          return update.value;
        }
        return item;
      })
      .filter(item => {
        const key = keyFrom(item);
        const update = updates.get(key);
        existing.set(key, true);
        return update?.operation !== 'delete';
      }),
    ...Array.from(updates.entries())
      .filter(([key, { operation }]) => !existing.get(key) && operation !== 'delete')
      .map(([_, { value }]) => value),
  ];
}

/**
 * Compile a single CRDT value (for individual items, not arrays).
 */
export function compileCrdtSingle<ValueType>(
  initial: ValueType,
  update: CrdtArrayItem<ValueType> | null,
): ValueType | undefined {
  if (!update) return initial;

  switch (update.operation) {
    case 'update': return update.value;
    case 'delete': return undefined;
    case 'insert': return initial;
    default: return initial;
  }
}
