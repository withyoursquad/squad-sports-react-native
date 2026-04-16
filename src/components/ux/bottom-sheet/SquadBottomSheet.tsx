import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Colors } from '../../../theme/ThemeContext';

export interface SquadBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface SquadBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  title?: string;
  onClose?: () => void;
  enableDynamicSizing?: boolean;
}

/**
 * Themed bottom sheet wrapper around @gorhom/bottom-sheet.
 * Provides consistent styling, backdrop, and handle across the SDK.
 */
export const SquadBottomSheet = forwardRef<SquadBottomSheetRef, SquadBottomSheetProps>(
  function SquadBottomSheet({ children, snapPoints: customSnapPoints, title, onClose, enableDynamicSizing }, ref) {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(
      () => customSnapPoints ?? ['50%', '80%'],
      [customSnapPoints],
    );

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={enableDynamicSizing}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={() => bottomSheetRef.current?.close()} hitSlop={8}>
              <Text style={styles.closeButton}>x</Text>
            </Pressable>
          </View>
        )}
        <BottomSheetView style={styles.content}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.gray2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray3,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: Colors.gray6,
    fontSize: 22,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
