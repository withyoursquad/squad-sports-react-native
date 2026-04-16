/**
 * Type declarations for optional peer dependencies.
 * These modules are dynamically imported and may not be installed in all environments.
 */

declare module 'expo-image-manipulator' {
  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
    WEBP = 'webp',
  }

  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export interface Action {
    resize?: { width?: number; height?: number };
    rotate?: number;
    flip?: { vertical?: boolean; horizontal?: boolean };
    crop?: { originX: number; originY: number; width: number; height: number };
  }

  export interface SaveOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export function manipulateAsync(
    uri: string,
    actions: Action[],
    saveOptions?: SaveOptions,
  ): Promise<ImageResult>;
}

declare module 'expo-notifications' {
  export interface PermissionResponse {
    status: string;
    granted: boolean;
    expires: string;
    canAskAgain: boolean;
    ios?: Record<string, unknown>;
  }

  export interface ExpoPushToken {
    type: string;
    data: string;
  }

  export function getPermissionsAsync(): Promise<PermissionResponse>;
  export function requestPermissionsAsync(): Promise<PermissionResponse>;
  export function getExpoPushTokenAsync(options?: { projectId?: string }): Promise<ExpoPushToken>;
  export function addNotificationResponseReceivedListener(
    listener: (response: any) => void,
  ): { remove: () => void };
  export function addNotificationReceivedListener(
    listener: (notification: any) => void,
  ): { remove: () => void };
}

declare module 'expo-camera' {
  export class Camera {
    static requestCameraPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
    static getCameraPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  }

  export interface CameraProps {
    type?: any;
    onBarCodeScanned?: (data: { type: string; data: string }) => void;
    style?: any;
    children?: any;
  }

  export default class CameraComponent extends React.Component<CameraProps> {}
}

declare module 'expo-clipboard' {
  export function setStringAsync(text: string): Promise<void>;
  export function getStringAsync(): Promise<string>;
  export function hasStringAsync(): Promise<boolean>;
}

declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: Record<string, unknown> | null;
  }

  export type NetInfoChangeHandler = (state: NetInfoState) => void;

  interface NetInfoStatic {
    addEventListener(listener: NetInfoChangeHandler): () => void;
    fetch(): Promise<NetInfoState>;
  }

  const NetInfo: NetInfoStatic;
  export default NetInfo;
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module '@twilio/voice-react-native-sdk' {
  export class Voice {
    register(token: string): Promise<void>;
    connect(token: string, options?: Record<string, unknown>): Promise<any>;
    on(event: string, handler: (...args: any[]) => void): this;
    off(event: string, handler: (...args: any[]) => void): this;
  }
}

declare module 'react-native-date-picker' {
  import type { ComponentType } from 'react';

  interface DatePickerProps {
    date: Date;
    onDateChange: (date: Date) => void;
    mode?: 'date' | 'time' | 'datetime';
    open?: boolean;
    onConfirm?: (date: Date) => void;
    onCancel?: () => void;
    [key: string]: any;
  }

  const DatePicker: ComponentType<DatePickerProps>;
  export default DatePicker;
}

declare module 'react-native-sse' {
  interface EventSourceOptions {
    headers?: Record<string, string>;
    method?: string;
    body?: string;
    pollingInterval?: number;
  }

  type EventSourceListener = (event: { type: string; data?: string; lastEventId?: string }) => void;

  class EventSource {
    constructor(url: string, options?: EventSourceOptions);
    addEventListener(type: string, listener: EventSourceListener): void;
    removeEventListener(type: string, listener: EventSourceListener): void;
    close(): void;
    readonly readyState: number;
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSED: number;
  }

  export default EventSource;
}

// Augment Blob to include arrayBuffer (available in newer environments)
interface Blob {
  arrayBuffer(): Promise<ArrayBuffer>;
}
