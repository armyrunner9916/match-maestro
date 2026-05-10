import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import GlassPanel from '../components/GlassPanel';
import GlassButton from '../components/GlassButton';

// Phase 6.2: Pause overlay. Replaces the Give Up button — players can pause
// (timer + card taps suspended) and either resume or quit the run. Quit
// fires the same gaveUp outcome the old Give Up button did, so high-score
// recording behavior is preserved.
//
// Tap outside the panel = resume (forgiving — accidental pauses don't
// require navigating the buttons).
function PauseOverlay({ visible, onResume, onQuit }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onResume}
    >
      <Pressable style={styles.backdrop} onPress={onResume}>
        {/* The inner Pressable swallows taps so taps inside the panel
            don't bubble up and trigger resume. */}
        <Pressable onPress={() => {}} style={styles.center}>
          <GlassPanel style={styles.panel}>
            <Text style={styles.title}>Paused</Text>

            <GlassButton
              tintColor="#06b6d4"
              onPress={onResume}
              style={styles.button}
              accessibilityLabel="Resume the game"
            >
              <Text style={styles.buttonText}>Resume</Text>
            </GlassButton>

            <GlassButton
              tintColor="#ef4444"
              onPress={onQuit}
              style={styles.button}
              accessibilityLabel="Quit this run and return to mode select"
              accessibilityHint="Your progress in this run will be lost"
            >
              <Text style={styles.buttonText}>Quit</Text>
            </GlassButton>
          </GlassPanel>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: '85%',
    maxWidth: 360,
  },
  panel: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PauseOverlay;
