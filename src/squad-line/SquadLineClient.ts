import EventEmitter from 'eventemitter3';
import type { SquadApiClient } from '@squad-sports/core';

export type CallState = 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'failed';

export interface CallInfo {
  connectionId: string;
  title: string;
  remoteCaller?: {
    id: string;
    displayName: string;
    imageUrl?: string;
  };
  startTime?: number;
  duration?: number;
}

export interface SquadLineEvents {
  callStateChanged: (state: CallState) => void;
  ringing: (info: CallInfo) => void;
  connected: (info: CallInfo) => void;
  disconnected: (info: CallInfo) => void;
  failed: (error: Error) => void;
  incomingCall: (info: CallInfo) => void;
  muteChanged: (muted: boolean) => void;
  speakerChanged: (speaker: boolean) => void;
}

/**
 * Squad Line client for voice calling via Twilio Voice SDK.
 * Replaces the old Daily.co-based SquadLine from squad-demo.
 *
 * Call flow:
 * 1. Caller taps connection -> AddCallTitle -> enters title
 * 2. SDK calls POST /v2/connections/:id/create-connections-line-room
 * 3. SDK calls POST /v2/voice/token -> gets Twilio JWT
 * 4. SDK calls TwilioVoice.connect(token, { To: calleeIdentity })
 * 5. Twilio routes to POST /v2/connections/voice-webhook
 * 6. API returns TwiML: <Dial><Client>calleeIdentity</Client></Dial>
 * 7. Callee receives push -> incoming call UI -> accept
 * 8. Voice connected P2P via Twilio
 */
export class SquadLineClient extends EventEmitter {
  private static instance: SquadLineClient | null = null;

  private callState: CallState = 'idle';
  private currentCall: CallInfo | null = null;
  private isMuted = false;
  private isSpeakerOn = false;
  private twilioVoice: unknown = null; // @twilio/voice-react-native-sdk instance
  private activeCall: unknown = null; // Twilio Call instance

  private constructor(private apiClient: SquadApiClient) {
    super();
  }

  static getInstance(apiClient: SquadApiClient): SquadLineClient {
    if (!SquadLineClient.instance) {
      SquadLineClient.instance = new SquadLineClient(apiClient);
    }
    return SquadLineClient.instance;
  }

  static reset(): void {
    SquadLineClient.instance?.endCall();
    SquadLineClient.instance = null;
  }

  /**
   * Register for incoming calls. Call this after authentication.
   */
  async register(): Promise<void> {
    try {
      // Get voice token from API
      const token = await this.apiClient.getVoiceToken();
      if (!token) {
        throw new Error('Failed to get voice token');
      }

      // Dynamically import Twilio SDK (optional peer dep)
      try {
        const { Voice } = await import('@twilio/voice-react-native-sdk');
        this.twilioVoice = new Voice();

        // Register for incoming calls
        await (this.twilioVoice as any).register(token);

        // Listen for incoming call invites
        (this.twilioVoice as any).on('callInvite', (callInvite: any) => {
          this.handleIncomingCall(callInvite);
        });
      } catch (importError) {
        console.warn(
          '[SquadLine] @twilio/voice-react-native-sdk not available. Voice calling disabled.',
          importError,
        );
      }
    } catch (error) {
      console.error('[SquadLine] Registration failed:', error);
    }
  }

  /**
   * Make an outgoing call to a squad connection.
   */
  async makeCall(connectionId: string, title: string, calleeIdentity?: string): Promise<boolean> {
    if (this.callState !== 'idle') {
      console.warn('[SquadLine] Already in a call');
      return false;
    }

    this.setCallState('connecting');

    try {
      // Step 1: Create line room via API
      await this.apiClient.createConnectionsLineRoom(connectionId);

      // Step 2: Get voice token
      const token = await this.apiClient.getVoiceToken();
      if (!token) {
        throw new Error('Failed to get voice token');
      }

      this.currentCall = { connectionId, title };

      // Step 3: Connect via Twilio
      if (this.twilioVoice) {
        const connectParams: Record<string, string> = {};
        if (calleeIdentity) {
          connectParams.To = calleeIdentity;
        }

        this.activeCall = await (this.twilioVoice as any).connect(token, {
          params: connectParams,
        });

        // Bind call event listeners
        this.bindCallEvents(this.activeCall);
        this.setCallState('ringing');
        return true;
      } else {
        throw new Error('Twilio Voice SDK not initialized');
      }
    } catch (error) {
      this.setCallState('failed');
      this.emit('failed', error instanceof Error ? error : new Error(String(error)));
      this.cleanup();
      return false;
    }
  }

  /**
   * Handle an incoming call invite from Twilio.
   */
  private handleIncomingCall(callInvite: any): void {
    const info: CallInfo = {
      connectionId: callInvite.customParameters?.connectionId ?? '',
      title: callInvite.customParameters?.title ?? 'Incoming Call',
      remoteCaller: {
        id: callInvite.from ?? '',
        displayName: callInvite.customParameters?.callerName ?? 'Unknown',
        imageUrl: callInvite.customParameters?.callerImage,
      },
    };

    this.currentCall = info;
    this.emit('incomingCall', info);

    // Store invite for accept/reject
    (this as any)._pendingInvite = callInvite;
  }

  /**
   * Accept an incoming call.
   */
  async acceptCall(): Promise<void> {
    const invite = (this as any)._pendingInvite;
    if (!invite) {
      console.warn('[SquadLine] No pending call invite');
      return;
    }

    try {
      this.activeCall = await invite.accept();
      this.bindCallEvents(this.activeCall);
      this.setCallState('connected');
      if (this.currentCall) {
        this.currentCall.startTime = Date.now();
        this.emit('connected', this.currentCall);
      }
    } catch (error) {
      this.setCallState('failed');
      this.emit('failed', error instanceof Error ? error : new Error(String(error)));
      this.cleanup();
    } finally {
      (this as any)._pendingInvite = null;
    }
  }

  /**
   * Reject an incoming call.
   */
  rejectCall(): void {
    const invite = (this as any)._pendingInvite;
    if (invite) {
      invite.reject();
      (this as any)._pendingInvite = null;
    }
    this.cleanup();
  }

  /**
   * End the current call.
   */
  endCall(): void {
    if (this.activeCall) {
      (this.activeCall as any).disconnect();
    }
    this.cleanup();
  }

  /**
   * Toggle mute state.
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.activeCall) {
      (this.activeCall as any).mute(this.isMuted);
    }
    this.emit('muteChanged', this.isMuted);
    return this.isMuted;
  }

  /**
   * Toggle speaker state.
   */
  toggleSpeaker(): boolean {
    this.isSpeakerOn = !this.isSpeakerOn;
    // Speaker toggling is handled at the native audio level
    this.emit('speakerChanged', this.isSpeakerOn);
    return this.isSpeakerOn;
  }

  /**
   * Send a reaction during a call.
   */
  async sendReaction(emoji: string, imageUrl?: string): Promise<void> {
    if (!this.currentCall) return;

    const callId = (this.activeCall as any)?.getSid?.() ?? '';
    await this.apiClient.createConnectionsLineReaction(
      callId,
      this.currentCall.connectionId,
      emoji,
      imageUrl,
    );
  }

  // --- Getters ---

  getCallState(): CallState {
    return this.callState;
  }

  getCurrentCall(): CallInfo | null {
    return this.currentCall;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getSpeakerOn(): boolean {
    return this.isSpeakerOn;
  }

  // --- Private ---

  private setCallState(state: CallState): void {
    this.callState = state;
    this.emit('callStateChanged', state);
  }

  private bindCallEvents(call: any): void {
    if (!call) return;

    call.on('ringing', () => {
      this.setCallState('ringing');
      if (this.currentCall) this.emit('ringing', this.currentCall);
    });

    call.on('connected', () => {
      this.setCallState('connected');
      if (this.currentCall) {
        this.currentCall.startTime = Date.now();
        this.emit('connected', this.currentCall);
      }
    });

    call.on('reconnecting', () => {
      console.log('[SquadLine] Call reconnecting...');
    });

    call.on('disconnected', () => {
      if (this.currentCall?.startTime) {
        this.currentCall.duration = Date.now() - this.currentCall.startTime;
      }
      this.setCallState('disconnected');
      if (this.currentCall) this.emit('disconnected', this.currentCall);
      this.cleanup();
    });

    call.on('connectFailure', (error: any) => {
      this.setCallState('failed');
      this.emit('failed', new Error(error?.message ?? 'Call connection failed'));
      this.cleanup();
    });
  }

  private cleanup(): void {
    this.activeCall = null;
    this.currentCall = null;
    this.isMuted = false;
    this.isSpeakerOn = false;
    this.callState = 'idle';
  }
}
