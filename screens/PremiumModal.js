import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

function PremiumModal({
  visible,
  onClose,
  darkMode,
  isLoadingPremium,
  onPurchase,
  onRestore,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
          <Text style={[styles.title, { color: '#d4af37' }]}>💎 Go Premium!</Text>
          <Text style={[styles.label, styles.subtitle, { color: darkMode ? '#cccccc' : '#666666' }]}>
            Remove all ads and enjoy Match Maestro uninterrupted
          </Text>

          <View style={[styles.benefitsBox, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
            <Text style={[styles.label, styles.benefitsTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>
              ✨ Premium Benefits:
            </Text>
            <Text style={[styles.label, styles.benefitsItem, { color: darkMode ? '#cccccc' : '#666666' }]}>
              🎮 Ad-free gameplay
            </Text>
            <Text style={[styles.label, styles.benefitsItem, { color: darkMode ? '#cccccc' : '#666666' }]}>
              ⚡ Unlock full experience
            </Text>
            <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666' }]}>
              🎯 Support the developer
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#d4af37', marginBottom: 10 }]}
            onPress={onPurchase}
            disabled={isLoadingPremium}
            accessibilityRole="button"
            accessibilityLabel="Purchase ad-free for ninety-nine cents"
            accessibilityState={{ disabled: isLoadingPremium, busy: isLoadingPremium }}
          >
            {isLoadingPremium ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.buttonText, { color: '#000', fontWeight: 'bold' }]}>
                Purchase - $0.99
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { marginBottom: 10 }]}
            onPress={onRestore}
            disabled={isLoadingPremium}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
            accessibilityState={{ disabled: isLoadingPremium }}
          >
            <Text>🔄 Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            disabled={isLoadingPremium}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.buttonText}>Cancel</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitsItem: {
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
  },
});

export default PremiumModal;
