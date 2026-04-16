/**
 * ShareCodeTab - Tab content for sharing invite code / QR.
 * Ported from squad-demo/src/screens/invite/ShareCodeTab.tsx.
 */
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Share,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular, ButtonSmall } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ShareCodeTabProps = {
  /** The shareable invite URL. Null/undefined when loading. */
  shareableUrl?: string | null;
  /** Whether the share URL is still loading. */
  isLoading?: boolean;
  /** Whether there was an error loading the URL. */
  hasError?: boolean;
  /** User's avatar URL for QR code logo. */
  userImageUrl?: string | null;
  /** Community image URI. */
  communityImageUri?: string | null;
  /** Called to retry loading the invite code. */
  onRetry?: () => void;
  /** Optional QR code render component. */
  QrCodeComponent?: React.ComponentType<{
    value: string;
    logo?: { uri: string };
    style?: object;
  }>;
};

export default function ShareCodeTab({
  shareableUrl,
  isLoading,
  hasError,
  userImageUrl,
  communityImageUri,
  onRetry,
  QrCodeComponent,
}: ShareCodeTabProps) {
  const { theme, baseThemeColors } = useTheme();
  const dark = theme.isDarkMode;

  const shareCode = useCallback(() => {
    if (!shareableUrl) return;

    const content = Platform.select({
      android: { message: shareableUrl },
      ios: {
        url: shareableUrl,
        message:
          "I'm in the 741 app \u2014 The Lab Jaylen Brown built for Shifters.\nNot just about the game, but where we build, connect, and move culture.\nJoin my circle.",
      },
      default: { message: shareableUrl },
    });

    if (!content) return;

    Share.share(content).catch((error: Error) => {
      if (error.message !== 'Share canceled') {
        console.error('[ShareCodeTab] Share failed:', error);
      }
    });
  }, [shareableUrl]);

  const renderQrCode = () => {
    if (isLoading) {
      return (
        <View style={[styles.qrCode, styles.qrCodeCentered]}>
          <ActivityIndicator size="large" color={Colors.white} />
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={[styles.qrCode, styles.qrCodeCentered]}>
          <BodyRegular style={styles.errorText}>
            Failed to load QR code
          </BodyRegular>
          {onRetry && (
            <ButtonSmall style={styles.retryText} onPress={onRetry}>
              Tap to retry
            </ButtonSmall>
          )}
        </View>
      );
    }

    if (shareableUrl && QrCodeComponent) {
      return (
        <QrCodeComponent
          value={shareableUrl}
          logo={userImageUrl ? { uri: userImageUrl } : undefined}
          style={styles.qrCode}
        />
      );
    }

    return (
      <View style={[styles.qrCode, styles.qrCodeCentered]}>
        <BodyRegular style={styles.noQrText}>
          No QR code available
        </BodyRegular>
        {onRetry && (
          <ButtonSmall style={styles.retryText} onPress={onRetry}>
            Tap to retry
          </ButtonSmall>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrCodeWrapper}>
        {renderQrCode()}
        {communityImageUri && (
          <View style={styles.logosContainer}>
            <View style={styles.communityLogoContainer}>
              <View style={styles.communityLogo}>
                <Image
                  source={{ uri: communityImageUri }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}
      </View>
      <BodyRegular style={styles.helpText}>
        Any friend who scans your QR code will be automatically in your 741
        circle.
      </BodyRegular>
      <Button
        style={[
          styles.shareButton,
          {
            backgroundColor: dark
              ? baseThemeColors.primaryWhiteColor
              : baseThemeColors.primaryTextColor,
          },
        ]}
        onPress={shareCode}
        disabled={isLoading || !shareableUrl}
      >
        <ButtonSmall
          style={[
            styles.shareButtonText,
            {
              color: dark
                ? baseThemeColors.primaryTextColor
                : baseThemeColors.primaryWhiteColor,
            },
          ]}
        >
          {isLoading ? 'Loading...' : 'Share QR Code'}
        </ButtonSmall>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  communityLogo: {
    alignItems: 'center',
    backgroundColor: Colors.gray11,
    borderColor: Colors.white,
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  communityLogoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: Colors.red,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    color: Colors.gray6,
    marginVertical: 24,
    textAlign: 'center',
  },
  image: {
    alignSelf: 'center',
    height: '90%',
    width: '90%',
  },
  logosContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noQrText: {
    color: Colors.gray6,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrCode: {
    borderRadius: 8,
    height: SCREEN_HEIGHT * 0.33,
    marginBottom: 16,
    overflow: 'hidden',
    width: SCREEN_WIDTH * 0.7,
  },
  qrCodeCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeWrapper: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    borderRadius: 24,
    paddingHorizontal: 36,
    paddingVertical: 16,
  },
  retryText: {
    color: Colors.purple1,
    textDecorationLine: 'underline',
  },
  shareButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: Colors.gray1,
    marginLeft: 8,
  },
});
