/**
 * PhotoActionSheet - Action sheet for selecting profile photo (take/choose).
 * Ported from squad-demo/src/screens/onboarding/PhotoActionSheet.tsx.
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type PhotoAsset = {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
};

export type PhotoActionSheetProps = {
  onSelectPhoto: () => Promise<PhotoAsset | null>;
  onTakePhoto: () => Promise<PhotoAsset | null>;
  onPhotoSelected: (asset: PhotoAsset) => void;
  onCancel: () => void;
};

export default function PhotoActionSheet({
  onSelectPhoto,
  onTakePhoto,
  onPhotoSelected,
  onCancel,
}: PhotoActionSheetProps) {
  const handleSelectPhoto = useCallback(async () => {
    try {
      const asset = await onSelectPhoto();
      if (asset) {
        onPhotoSelected(asset);
      }
    } catch (error) {
      console.error('[PhotoActionSheet] Error selecting photo:', error);
    }
  }, [onSelectPhoto, onPhotoSelected]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const asset = await onTakePhoto();
      if (asset) {
        onPhotoSelected(asset);
      }
    } catch (error) {
      console.error('[PhotoActionSheet] Error taking photo:', error);
    }
  }, [onTakePhoto, onPhotoSelected]);

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectPhoto} style={styles.actionButton}>
        <BodyRegular style={styles.actionText}>Select Photo</BodyRegular>
      </Button>
      <View style={styles.separator} />
      <Button onPress={handleTakePhoto} style={styles.actionButton}>
        <BodyRegular style={styles.actionText}>Take Photo</BodyRegular>
      </Button>
      <View style={styles.separator} />
      <Button onPress={onCancel} style={styles.actionButton}>
        <BodyRegular style={styles.cancelText}>Cancel</BodyRegular>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    color: Colors.white,
    fontSize: 16,
  },
  cancelText: {
    color: Colors.gray6,
    fontSize: 16,
  },
  container: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  separator: {
    backgroundColor: Colors.gray4,
    height: 1,
    width: '100%',
  },
});
