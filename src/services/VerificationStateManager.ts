/**
 * VerificationStateManager — manages verification lock state to prevent
 * duplicate verification attempts.
 * Ported from squad-demo/src/services/VerificationStateManager.ts.
 */

let verificationInProgress = false;
let verificationLockHolder: string | null = null;

export function isVerificationInProgress(): boolean {
  return verificationInProgress;
}

export function acquireVerificationLock(holder: string): boolean {
  if (verificationInProgress) return false;
  verificationInProgress = true;
  verificationLockHolder = holder;
  return true;
}

export function releaseVerificationLock(holder: string): void {
  if (verificationLockHolder === holder) {
    verificationInProgress = false;
    verificationLockHolder = null;
  }
}

export function cleanupVerificationState(): void {
  verificationInProgress = false;
  verificationLockHolder = null;
}

export const verificationStateManager = {
  isVerificationInProgress,
  acquireVerificationLock,
  releaseVerificationLock,
  cleanupVerificationState,
  setVerificationInProgress: (value: boolean) => {
    verificationInProgress = value;
  },
};
