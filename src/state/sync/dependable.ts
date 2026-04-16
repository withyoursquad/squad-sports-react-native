/**
 * DependableAtom — wrapper for Recoil atoms that provides subscribable
 * change notifications outside of Recoil's update tree.
 *
 * Ported from squad-demo/src/atoms/sync/dependable.ts.
 *
 * Used sparingly for top-level state (API calls) that needs to be
 * refreshable with propagated changes.
 */

import {
  atom,
  AtomEffect,
  atomFamily,
  DefaultValue,
  type Loadable,
  type ReadWriteSelectorOptions,
  type RecoilState,
  type RecoilValue,
  selector,
  selectorFamily,
  type SerializableParam,
  type WrappedValue,
} from 'recoil';
import EventEmitter from 'eventemitter3';

type RecoilSetSelfFn<T> = (
  param:
    | T
    | DefaultValue
    | Promise<T | DefaultValue>
    | WrappedValue<T>
    | ((param: T | DefaultValue) => T | DefaultValue | WrappedValue<T>),
) => void;

export type AtomEffectParams<T> = {
  setSelf: RecoilSetSelfFn<T>;
  getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>;
  getLoadable: <S>(recoilValue: RecoilValue<S>) => Loadable<S>;
  onSet: (param: (newValue: T, oldValue: T | DefaultValue, isReset: boolean) => void) => void;
};

type DependableAtomEffect<T, ReturnType> = (
  param: {
    subscribeToLoadable: <S>(
      callback: ((value: T) => Loadable<void>) | ((value: T) => void),
    ) => void;
    subscribeToPromise: <S>(
      callback: ((value: T) => Promise<void>) | ((value: T) => void),
    ) => void;
  } & AtomEffectParams<ReturnType>,
) => void | (() => void);

// --- Base class ---

class Dependable<T> {
  private emitter: EventEmitter;
  protected state: RecoilState<T>;

  constructor(state: RecoilState<T>) {
    this.emitter = new EventEmitter();
    this.state = state;
  }

  getEffect<S>(createEffect: DependableAtomEffect<T, S>) {
    return (({ getPromise, getLoadable, ...atomTools }: any) =>
      createEffect({
        ...atomTools,
        getPromise,
        getLoadable,
        subscribeToLoadable: this.subscribeToLoadable(getLoadable),
        subscribeToPromise: this.subscribeToPromise(getPromise),
      })) as unknown as AtomEffect<S>;
  }

  protected addListener(callback: (_value: T) => void) {
    this.emitter.on('change', callback);
  }

  protected removeListener(callback: (_value: T) => void) {
    this.emitter.off('change', callback);
  }

  protected emitChange(newValue: T) {
    this.emitter.emit('change', newValue);
  }

  private subscribeToPromise(getPromise: (recoilValue: RecoilValue<T>) => Promise<T>) {
    return (callback: (_value: T) => void) => {
      getPromise(this.state).then(result => {
        callback(result);
        this.addListener(callback);
        return () => this.removeListener(callback);
      });
    };
  }

  private subscribeToLoadable(getLoadable: (recoilValue: RecoilValue<T>) => Loadable<T>) {
    return (callback: (_value: T) => void) => {
      const loadable = getLoadable(this.state);
      if (loadable.state === 'hasValue') {
        callback(loadable.contents);
      }
      this.addListener(callback);
      return () => this.removeListener(callback);
    };
  }
}

// --- Family base class ---

class DependableFamily<T, ParamType extends SerializableParam> {
  private emitter: EventEmitter;
  protected state: (param: ParamType) => RecoilState<T>;

  constructor(state: (param: ParamType) => RecoilState<T>) {
    this.emitter = new EventEmitter();
    this.state = state;
  }

  protected emitChange(param: ParamType, newValue: T) {
    this.emitter.emit(`change:${JSON.stringify(param)}`, newValue);
  }

  private addListener(param: ParamType, callback: (_value: T) => void) {
    this.emitter.on(`change:${JSON.stringify(param)}`, callback);
  }

  private removeListener(param: ParamType, callback: (_value: T) => void) {
    this.emitter.off(`change:${JSON.stringify(param)}`, callback);
  }
}

// --- Public classes ---

export class DependableAtom<T> extends Dependable<T> {
  constructor({
    key,
    effects,
    ...props
  }: {
    key: string;
    default?: T;
    effects: DependableAtomEffect<any, T>[];
  }) {
    super(
      atom<T>({
        key,
        ...props,
        effects: [
          ({ onSet }) => {
            onSet(newValue => {
              this.emitChange(newValue);
            });
          },
          ...effects,
        ] as AtomEffect<T>[],
      }),
    );
  }

  get atom() {
    return this.state;
  }
}

export class DependableSelector<T> extends Dependable<T> {
  constructor({ key, set, get }: ReadWriteSelectorOptions<T>) {
    super(
      selector<T>({
        key,
        get,
        set: (opts, newValue) => {
          if (newValue instanceof DefaultValue) return;
          this.emitChange(newValue);
          set(opts, newValue);
        },
      }),
    );
  }

  get selector() {
    return this.state;
  }
}

export class DependableAtomFamily<T, ParamType extends SerializableParam> extends DependableFamily<T, ParamType> {
  constructor(params: {
    key: string;
    default?: (param: ParamType) => T;
    effects: ((param: ParamType) => AtomEffect<T>)[];
  }) {
    super(
      atomFamily<T, ParamType>({
        key: params.key,
        default: params.default,
        effects: (param: ParamType) =>
          [
            ({ onSet }: any) => {
              onSet((newValue: T) => {
                this.emitChange(param, newValue);
              });
            },
            ...params.effects.map(effect => effect(param)),
          ] as AtomEffect<T>[],
      }),
    );
  }

  get atomFamily() {
    return this.state;
  }
}
