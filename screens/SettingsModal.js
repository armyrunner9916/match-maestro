import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Phase 7.1 will replace the color-swatch grid with the 6-tile SVG card-back
// preview picker (Wave / Chevron / Vine / Sunburst / Deco / Labyrinth).
function SettingsModal({
  visible,
  onClose,
  darkMode,
  cardBackColor,
  setCardBackColor,
  hapticEnabled,
  setHapticEnabled,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
          <Text style={[styles.label, styles.title, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Settings
          </Text>

          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, styles.sectionLabel, { color: darkMode ? '#ffffff' : '#000000' }]}>
              Card Back Color
            </Text>
            <View style={styles.swatchRow}>
              {['black', 'red', 'green', 'blue', 'yellow', 'purple'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={{
                    backgroundColor:
                      color === 'black' ? '#000' :
                      color === 'red' ? '#dc2626' :
                      color === 'green' ? '#16a34a' :
                      color === 'blue' ? '#2563eb' :
                      color === 'yellow' ? '#eab308' : '#9333ea',
                    width: 80,
                    height: 40,
                    margin: 5,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: cardBackColor === color ? 3 : 0,
                    borderColor: '#3b82f6',
                  }}
                  onPress={() => setCardBackColor(color)}
                >
                  <Text style={{ color: color === 'yellow' ? '#000' : '#fff' }}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.hapticToggle, { backgroundColor: hapticEnabled ? '#10b981' : '#6b7280' }]}
            onPress={() => setHapticEnabled(!hapticEnabled)}
          >
            <Text style={styles.hapticLabel}>📳 Haptic Feedback</Text>
            <Text style={styles.hapticState}>{hapticEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hapticToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  hapticLabel: {
    color: '#fff',
    fontSize: 16,
  },
  hapticState: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsModal;
