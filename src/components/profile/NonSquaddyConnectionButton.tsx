/**
 * NonSquaddyConnectionButton - "Add to Squad" / Accept / Cancel button for non-connected profiles.
 * Ported from squad-demo/src/screens/profile/NonSquaddyConnectionButton.tsx.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import Button from '../ux/buttons/Button';

export type ConnectionStatus = 'none' | 'invited' | 'accepted';

export type NonSquaddyUser = {
  id: string;
  displayName: string;
};

export type NonSquaddyConnectionButtonProps = {
  user: NonSquaddyUser;
  connectionStatus?: ConnectionStatus;
  /** True if the logged-in user created the invitation. */
  isInviteCreator?: boolean;
  onAddToSquad: (userId: string) => Promise<void>;
  onAcceptInvite: (userId: string) => Promise<void>;
  onCancelRequest: (userId: string) => Promise<void>;
};

export default function NonSquaddyConnectionButton({
  user,
  connectionStatus = 'none',
  isInviteCreator = false,
  onAddToSquad,
  onAcceptInvite,
  onCancelRequest,
}: NonSquaddyConnectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAddToSquad(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [onAddToSquad, user.id]);

  const handleAccept = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAcceptInvite(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [onAcceptInvite, user.id]);

  const handleCancel = useCallback(async () => {
    setIsLoading(true);
    try {
      await onCancelRequest(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [onCancelRequest, user.id]);

  if (connectionStatus === 'invited' && isInviteCreator) {
    return (
      <Button
        style={[styles.button, styles.buttonBlack]}
        onPress={handleCancel}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, styles.buttonTextLight]}>
          Cancel Request
        </Text>
      </Button>
    );
  }

  if (connectionStatus === 'invited' && !isInviteCreator) {
    return (
      <Button
        style={[styles.button, styles.buttonPurple]}
        onPress={handleAccept}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Accept</Text>
      </Button>
    );
  }

  return (
    <Button
      style={[styles.button, styles.buttonPurple]}
      onPress={handleAdd}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>Join {user.displayName}'s Circle</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginBottom: 24,
    marginHorizontal: 16,
    paddingHorizontal: 16,
  },
  buttonBlack: {
    backgroundColor: Colors.gray1,
  },
  buttonPurple: {
    backgroundColor: Colors.white,
  },
  buttonText: {
    color: Colors.gray1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonTextLight: {
    color: Colors.gray8,
  },
});
