import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

function PremiumModal({
  visible,
  onClose,
  isLoadingPremium,
  onPurchase,
  onRestore,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => { if (!isLoadingPremium) onClose(); }}
    >
      {/* Backdrop tap closes (unless a purchase/restore is in flight); the
          inner Pressable swallows taps on the card. onRequestClose handles
          the Android hardware back button. */}
      <Pressable
        style={styles.overlay}
        onPress={() => { if (!isLoadingPremium) onClose(); }}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={[styles.title, { color: '#d4af37' }]}>💎 Go Premium!</Text>
          <Text style={[styles.label, styles.subtitle]}>
            Remove all ads and enjoy Match Maestro uninterrupted
          </Text>

          <View style={styles.benefitsBox}>
            <Text style={[styles.label, styles.benefitsTitle]}>
              ✨ Premium Benefits:
            </Text>
            <Text style={[styles.label, styles.benefitsItem]}>
              🎮 Ad-free gameplay
            </Text>
            <Text style={[styles.label, styles.benefitsItem]}>
              ⚡ Unlock full experience
            </Text>
            <Text style={styles.label}>
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
            <Text style={styles.secondaryButtonText}>🔄 Restore Purchases</Text>
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
        </Pressable>
      </Pressable>
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
    backgroundColor: '#16213e', // Phase 10: dark-only
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
    color: '#cccccc',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  benefitsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
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
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default PremiumModal;
