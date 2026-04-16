/**
 * RequestItemMenu - Menu button on request item (block, cancel/ignore).
 * Ported from squad-demo/src/screens/invite/RequestItemMenuButton.tsx.
 */
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';
import Button from '../ux/buttons/Button';

export type RequestItemMenuProps = {
  isRequestSent: boolean;
  onBlock: () => void;
  onIgnore: () => void;
  style?: ViewStyle;
};

export default function RequestItemMenu({
  isRequestSent,
  onBlock,
  onIgnore,
  style,
}: RequestItemMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleShowMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleBlock = useCallback(() => {
    setMenuVisible(false);
    onBlock();
  }, [onBlock]);

  const handleIgnore = useCallback(() => {
    setMenuVisible(false);
    onIgnore();
  }, [onIgnore]);

  return (
    <>
      <Button onPress={handleShowMenu} style={style}>
        <Text style={styles.ellipsis}>...</Text>
      </Button>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.bottomSheetContainer}>
            <Button onPress={handleIgnore}>
              <BodyRegular style={styles.ignoreText}>
                {isRequestSent ? 'Cancel Request' : 'Ignore'}
              </BodyRegular>
            </Button>
            <View style={styles.line} />
            <Button onPress={handleBlock}>
              <BodyRegular style={styles.blockText}>Block</BodyRegular>
            </Button>
            <View style={styles.line} />
            <Button onPress={() => setMenuVisible(false)}>
              <BodyRegular style={styles.cancelText}>Cancel</BodyRegular>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  blockText: {
    color: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomSheetContainer: {
    backgroundColor: Colors.gray2,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 8,
    width: '90%',
  },
  cancelText: {
    color: Colors.gray6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ellipsis: {
    color: Colors.gray6,
    fontSize: 20,
    fontWeight: '700',
  },
  ignoreText: {
    color: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  line: {
    backgroundColor: Colors.gray2,
    height: 1,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
