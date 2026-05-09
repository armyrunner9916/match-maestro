import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

function HighScoresModal({ visible, onClose, darkMode, highScores }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
          <Text style={[styles.label, styles.title, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Top 10 High Scores
          </Text>
          <ScrollView>
            {highScores.length === 0 ? (
              <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666' }]}>
                No scores yet. Be the first!
              </Text>
            ) : (
              highScores.map((score, i) => (
                <View
                  key={i}
                  style={[styles.row, { borderBottomColor: darkMode ? '#4b5563' : '#e5e7eb' }]}
                >
                  <Text style={[styles.cell, styles.rank, { color: darkMode ? '#ffffff' : '#000000' }]}>
                    {i + 1}
                  </Text>
                  <Text style={[styles.cell, styles.name, { color: darkMode ? '#ffffff' : '#000000' }]}>
                    {score.name}
                  </Text>
                  <Text style={[styles.cell, styles.level, { color: darkMode ? '#ffffff' : '#000000' }]}>
                    {score.level}
                  </Text>
                  <Text style={[styles.cell, styles.date, { color: darkMode ? '#ffffff' : '#000000' }]}>
                    {new Date(score.date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close high scores"
          >
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
    maxHeight: '80%',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cell: {
    fontSize: 16,
    marginVertical: 8,
  },
  rank: { flex: 1 },
  name: { flex: 3 },
  level: { flex: 1 },
  date: { flex: 2 },
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

export default HighScoresModal;
