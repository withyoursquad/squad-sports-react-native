/**
 * QR Code Scanner — scans QR codes for invite links and profile sharing.
 * Ported from squad-demo's camera components.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { TitleSmall, BodyRegular } from '../ux/text/Typography';
import CameraPermissionsWrap from './CameraPermissionsWrap';

let BarCodeScanner: any;
try {
  BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
} catch {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_SIZE = SCREEN_WIDTH * 0.7;

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanned, setScanned] = useState(false);

  const handleScan = useCallback(({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  }, [scanned, onScan]);

  if (!BarCodeScanner) {
    return (
      <View style={styles.fallback}>
        <BodyRegular style={styles.fallbackText}>
          Camera not available. Install expo-barcode-scanner to enable QR scanning.
        </BodyRegular>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <TitleSmall style={styles.closeText}>Close</TitleSmall>
        </Pressable>
      </View>
    );
  }

  return (
    <CameraPermissionsWrap>
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleScan}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Scan frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <BodyRegular style={styles.hint}>
              Point your camera at a QR code
            </BodyRegular>
          </View>
        </View>

        <Pressable style={styles.closeButtonAbsolute} onPress={onClose}>
          <Text style={styles.closeIcon}>X</Text>
        </Pressable>

        {scanned && (
          <Pressable style={styles.rescanButton} onPress={() => setScanned(false)}>
            <TitleSmall style={styles.rescanText}>Scan Again</TitleSmall>
          </Pressable>
        )}
      </View>
    </CameraPermissionsWrap>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hint: {
    color: Colors.white,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.white,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: Colors.purple1,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  rescanText: {
    color: Colors.white,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray9,
    padding: 24,
  },
  fallbackText: {
    color: Colors.gray6,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: Colors.gray2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeText: {
    color: Colors.white,
  },
});
