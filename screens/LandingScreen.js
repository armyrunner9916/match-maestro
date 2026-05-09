import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// Phase 3 will replace this with the new ModeSelectScreen (mode tiles, daily
// challenge, header row with stats / logo / settings icons).
function LandingScreen({
  darkMode,
  setDarkMode,
  playerName,
  setPlayerName,
  onStartGame,
  onOpenSettings,
  onOpenHighScores,
  isPremium,
  onOpenPremium,
  onRestorePurchases,
  isLoadingPremium,
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={require('../assets/banner.png')}
          style={styles.banner}
          resizeMode="contain"
        />

        <TextInput
          style={[styles.input, {
            color: darkMode ? '#ffffff' : '#000000',
            borderColor: darkMode ? '#4b5563' : '#cccccc',
          }]}
          placeholder="Enter your name"
          placeholderTextColor={darkMode ? '#999999' : '#666666'}
          value={playerName}
          onChangeText={setPlayerName}
          accessibilityLabel="Player name"
        />

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setDarkMode(!darkMode)}
            accessibilityRole="button"
            accessibilityLabel={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Text>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onStartGame}
          accessibilityRole="button"
          accessibilityLabel="Start a new game"
        >
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#9333ea' }]}
          onPress={onOpenHighScores}
          accessibilityRole="button"
          accessibilityLabel="View high scores"
        >
          <Text style={styles.buttonText}>High Scores</Text>
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#d4af37', marginTop: 10 }]}
            onPress={onOpenPremium}
            accessibilityRole="button"
            accessibilityLabel="Remove ads, in-app purchase"
          >
            <Text style={[styles.buttonText, { color: '#000' }]}>💎 Remove Ads</Text>
          </TouchableOpacity>
        )}

        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>✨ Premium - No Ads</Text>
          </View>
        )}

        {/* Restore Purchases - always visible per App Store guidelines (Guideline 3.1.1) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={onRestorePurchases}
            disabled={isLoadingPremium}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
            accessibilityState={{ disabled: isLoadingPremium }}
          >
            {isLoadingPremium ? (
              <ActivityIndicator size="small" color={darkMode ? '#9ca3af' : '#6b7280'} />
            ) : (
              <Text style={[styles.restoreText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                🔄 Restore Purchases
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  banner: {
    width: '100%',
    height: 120,
    marginBottom: 30,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  secondaryButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
    flex: 1,
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
  premiumBadge: {
    backgroundColor: '#d4af37',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  restoreText: {
    fontSize: 14,
  },
});

export default LandingScreen;
