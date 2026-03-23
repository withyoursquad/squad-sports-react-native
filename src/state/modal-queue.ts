/**
 * Modal queue system for managing dialog/toast/bottom sheet display.
 * Ported from squad-demo/src/atoms/modal-queue.ts.
 */
import EventEmitter from 'eventemitter3';
import { atomFamily } from 'recoil';
import { type ModalKey, type DialogProps, DialogKey, ToastKey, BottomSheetKey } from './modal-keys';

export const enum ModalType {
  Dialog = 'dialog',
  Toast = 'toast',
  BottomSheet = 'bottomSheet',
}

export type ModalQueueOptions = Partial<{
  animationType: 'none' | 'slide' | 'fade';
  dismissable: boolean;
}>;

export class ModalQueueItem {
  key: ModalKey;
  keyType: ModalType;
  options: ModalQueueOptions;
  private props?: DialogProps;

  constructor(key: ModalKey, props?: DialogProps, options: ModalQueueOptions = {}) {
    this.key = key;
    this.options = options;
    this.props = props;
    this.keyType = ModalQueueItem.getTypeForKey(key);
  }

  get isDismissable(): boolean {
    if (typeof this.options.dismissable === 'boolean') return this.options.dismissable;
    return this.keyType === ModalType.BottomSheet;
  }

  getProps<T extends DialogProps>(): T {
    return (this.props ?? {}) as T;
  }

  static getTypeForKey(key: ModalKey): ModalType {
    if (Object.values(DialogKey).includes(key as DialogKey)) return ModalType.Dialog;
    if (Object.values(ToastKey).includes(key as ToastKey)) return ModalType.Toast;
    return ModalType.BottomSheet;
  }
}

class ModalQueue {
  private queue: ModalQueueItem[] = [];
  private emitter = new EventEmitter();

  push(key: ModalKey, props?: DialogProps, options?: ModalQueueOptions): void {
    const item = new ModalQueueItem(key, props, options);
    this.queue.push(item);
    this.emitter.emit('change', this.queue);
  }

  pop(): ModalQueueItem | undefined {
    const item = this.queue.shift();
    this.emitter.emit('change', this.queue);
    return item;
  }

  peek(): ModalQueueItem | undefined {
    return this.queue[0];
  }

  dismiss(key?: ModalKey): void {
    if (key) {
      this.queue = this.queue.filter(item => item.key !== key);
    } else {
      this.queue.shift();
    }
    this.emitter.emit('change', this.queue);
  }

  clear(): void {
    this.queue = [];
    this.emitter.emit('change', this.queue);
  }

  get length(): number {
    return this.queue.length;
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  onChange(callback: (queue: ModalQueueItem[]) => void): () => void {
    this.emitter.on('change', callback);
    return () => this.emitter.off('change', callback);
  }
}

const modalQueue = new ModalQueue();
export default modalQueue;

// Recoil atom for top modal (used by renderers)
export const topModalAtom = atomFamily<ModalQueueItem | null, string>({
  key: 'squad-sdk:modal:top',
  default: null,
});
