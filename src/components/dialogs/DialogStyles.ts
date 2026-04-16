/**
 * Shared dialog styling constants.
 * Ported from squad-demo/src/components/dialogs/styles.ts
 */
import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/ThemeContext';

export const dialogStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  backdrop: {
    backgroundColor: Colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.8,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  modal: {
    backgroundColor: Colors.gray1,
    borderRadius: 8,
    margin: 16,
    padding: 24,
  },

  title: {
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },

  body: {
    color: Colors.white,
    marginBottom: 16,
    marginHorizontal: 16,
    textAlign: 'center',
  },

  icon: {
    alignSelf: 'center',
    marginBottom: 16,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  button: {
    borderRadius: 8,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },

  buttonLeft: {
    backgroundColor: Colors.gray2,
  },

  buttonLeftDisabled: {
    backgroundColor: Colors.gray1,
  },

  buttonLeftText: {
    color: Colors.gray8,
    fontSize: 15,
    fontWeight: '600',
  },

  buttonRight: {
    backgroundColor: Colors.white,
  },

  buttonRightDisabled: {
    backgroundColor: Colors.purple3,
  },

  buttonRightText: {
    color: Colors.gray1,
    fontSize: 15,
    fontWeight: '600',
  },

  onlyButton: {
    width: '100%',
  },

  onlyButtonText: {
    textAlign: 'center',
  },
});
