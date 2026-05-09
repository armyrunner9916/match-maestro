import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// Phase 8 will redesign this as a <GlassCard> with: per-mode-aware Game Over /
// Easy-completion variants, "🎉 New high score!" callout, share button (Normal/
// Hard/Challenge only), Play Again primary, Back to Menu tertiary.
function GameOverScreen({
  darkMode,
  completedLevel,
  onNewGame,
  onViewHighScores,
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
      <View style={[styles.content, { justifyContent: 'center' }]}>
        <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
          <Text style={[styles.title, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Game Over!
          </Text>
          <Text style={[styles.label, styles.levelReached, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Level Reached: {completedLevel}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onNewGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#9333ea' }]}
            onPress={onViewHighScores}
          >
            <Text style={styles.buttonText}>View High Scores</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  levelReached: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
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
});

export default GameOverScreen;
