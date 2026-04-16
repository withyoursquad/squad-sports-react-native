import React from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';

export default function DismissKeyboardOnBlur({ children }: { children: React.ReactNode }) {
  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
