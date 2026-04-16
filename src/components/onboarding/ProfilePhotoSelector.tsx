/**
 * ProfilePhotoSelector - Photo preview with retry logic.
 * Ported from squad-demo/src/screens/onboarding/ProfilePhotoSelector.tsx.
 */
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type PhotoAsset = {
  uri: string;
  width?: number;
  height?: number;
};

export type ProfilePhotoSelectorProps = {
  photo: PhotoAsset | undefined;
  showWarning: boolean;
  onAddPhoto: () => void;
};

export default function ProfilePhotoSelector({
  photo,
  showWarning,
  onAddPhoto,
}: ProfilePhotoSelectorProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (photo?.uri) {
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(0);
      setImageUri(photo.uri);
    }
  }, [photo]);

  const handleImageError = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      setTimeout(() => {
        setImageError(false);
        setImageLoaded(false);
      }, 1000);
    } else {
      setImageError(true);
      setImageLoaded(false);
    }
  };

  return (
    <>
      {imageUri && !imageError ? (
        <Button onPress={onAddPhoto} style={styles.addPhotoButton}>
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.addPhotoCircle,
              !imageLoaded && styles.addPhotoLoading,
            ]}
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={handleImageError}
          />
          <BodyRegular style={styles.addPhotoLabel}>Edit photo</BodyRegular>
        </Button>
      ) : (
        <Button onPress={onAddPhoto} style={styles.addPhotoButton}>
          <View
            style={[
              styles.addPhotoCircle,
              styles.addPhotoPlaceholder,
              showWarning && styles.addPhotoCircleWarning,
            ]}
          >
            <BodyRegular style={styles.plusIcon}>+</BodyRegular>
          </View>
          <BodyRegular
            style={[
              styles.addPhotoLabel,
              showWarning && styles.addPhotoLabelWarning,
            ]}
          >
            Tap to add photo
          </BodyRegular>
        </Button>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  addPhotoButton: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  addPhotoCircle: {
    borderRadius: 92,
    height: 184,
    marginBottom: 16,
    width: 184,
  },
  addPhotoCircleWarning: {
    borderColor: Colors.orange2,
    borderWidth: 1,
  },
  addPhotoLabel: {
    color: Colors.white,
    marginTop: 5,
  },
  addPhotoLabelWarning: {
    color: Colors.orange2,
  },
  addPhotoLoading: {
    backgroundColor: Colors.gray1,
  },
  addPhotoPlaceholder: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    justifyContent: 'center',
  },
  plusIcon: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: '300',
  },
});
