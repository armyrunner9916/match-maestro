import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { COLORS } from '../game/constants';

// Interim 3-button layout. Phase 8 will redesign this as a <GlassCard> with:
// per-mode-aware Game Over / Easy-completion variants, "🎉 New high score!"
// callout, share button (Normal/Hard/Challenge only), and Phase 6.4's
// "Reached Level X (Y/Z pairs matched)" detail.
//
// For now: New Game (restarts same mode), Main Menu (back to mode select),
// High Scores. Same .button style, distinct semantic colors.
function GameOverScreen({
  darkMode,
  completedLevel,
  onNewGame,
  onMainMenu,
  onViewHighScores,
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? COLORS.bgNavy : COLORS.bgNavyLight }]}>
      <View style={[styles.content, { justifyContent: 'center' }]}>
        <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
          <Text style={[styles.title, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Game Over!
          </Text>
          <Text style={[styles.label, styles.levelReached, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Level Reached: {completedLevel}
          </Text>

          {/* Cyan: positive primary "try again" action */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#06b6d4' }]}
            onPress={onNewGame}
            accessibilityRole="button"
            accessibilityLabel="New game in the same mode"
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>

          {/* Default blue: neutral navigation back to menu */}
          <TouchableOpacity
            style={styles.button}
            onPress={onMainMenu}
            accessibilityRole="button"
            accessibilityLabel="Back to main menu"
          >
            <Text style={styles.buttonText}>Main Menu</Text>
          </TouchableOpacity>

          {/* Purple: high scores, matches the landing screen color */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#9333ea' }]}
            onPress={onViewHighScores}
            accessibilityRole="button"
            accessibilityLabel="View high scores"
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
    // Phase 3: Android safe-area fix (BUILD_LOG known issues).
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
