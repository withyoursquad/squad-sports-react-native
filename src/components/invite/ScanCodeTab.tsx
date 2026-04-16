/**
 * ScanCodeTab - Tab content for scanning QR codes.
 * Ported from squad-demo/src/screens/invite/ScanCodeTab.tsx.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleMedium, BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type ScanCodeTabProps = {
  /** Called when a QR code is successfully scanned. */
  onCodeScanned: (code: string) => void;
  /** Called to request camera permission before scanning. */
  onRequestCameraPermission?: () => Promise<boolean>;
  /** Optional component to render the QR scanner view. */
  ScannerComponent?: React.ComponentType<{ onCodeFound: (code: string) => void }>;
};

export default function ScanCodeTab({
  onCodeScanned,
  onRequestCameraPermission,
  ScannerComponent,
}: ScanCodeTabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeFound = useCallback(
    async (code: string) => {
      try {
        setError(null);
        onCodeScanned(code);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to process invite code. Please try again.');
        }
      }
    },
    [onCodeScanned],
  );

  const handleStartScanning = useCallback(async () => {
    if (onRequestCameraPermission) {
      const granted = await onRequestCameraPermission();
      if (!granted) return;
    }
    setIsScanning(true);
  }, [onRequestCameraPermission]);

  return (
    <View style={styles.container}>
      {isScanning && ScannerComponent ? (
        <ScannerComponent onCodeFound={handleCodeFound} />
      ) : (
        <>
          <TitleMedium style={styles.title}>Scan QR Code</TitleMedium>
          <BodyRegular style={styles.description}>
            Scan your friends QR Code to join their 741 Squad
          </BodyRegular>
          {error && <BodyRegular style={styles.error}>{error}</BodyRegular>}
          <Button
            style={styles.button}
            onPress={handleStartScanning}
            disabled={isScanning}
          >
            <BodyRegular style={styles.buttonText}>
              {isScanning ? 'Scanning...' : 'Scan QR Code'}
            </BodyRegular>
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: Colors.gray1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.gray1,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 16,
  },
  description: {
    color: Colors.gray6,
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: Colors.red,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
});
