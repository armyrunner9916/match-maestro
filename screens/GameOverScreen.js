import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Share,
} from 'react-native';

import GlassPanel from '../components/GlassPanel';
import GlassButton from '../components/GlassButton';
import { COLORS } from '../game/constants';
import { MODES } from '../game/modes';

// Phase 8: per-mode-aware Game Over redesign.
//
// Outcomes the engine produces (from gameOutcome state, set in endGame):
//   - 'timeout'   timer hit zero
//   - 'mistakes'  Challenge mode mistake budget exhausted
//   - 'gaveUp'    user tapped Quit in the Pause overlay
//   - 'completed' Easy mode levelCap (10) cleared
//
// Each outcome gets its own title + accent color. Easy 'completed' is the
// celebration variant — title in green with the trophy emoji, subtitle
// "Easy Mode Complete", body shows mismatch count for tie-breaker bragging.
// All others share the "You reached Level N" body.
//
// 'gaveUp' suppresses the Share button; sharing a give-up reads weird.
const VARIANTS = {
  timeout: {
    title: "Time's Up!",
    accentColor: '#ef4444',
    showShare: true,
  },
  mistakes: {
    title: 'Out of Guesses',
    accentColor: '#ef4444',
    showShare: true,
  },
  gaveUp: {
    title: 'See You Next Time',
    accentColor: '#9ca3af',
    showShare: false,
  },
  completed: {
    title: '🎉 You Did It!',
    accentColor: '#10b981',
    showShare: true,
  },
};

const formatMisses = (n) => `${n} miss${n === 1 ? '' : 'es'}`;

function GameOverScreen({
  mode,
  outcome = 'timeout',
  level,
  totalMismatches = 0,
  isNewHighScore = false,
  onPlayAgain,
  onMainMenu,
}) {
  const cfg = MODES[mode];
  const variant = VARIANTS[outcome] || VARIANTS.timeout;
  const isEasyCompletion = outcome === 'completed';

  // Body line:
  //   Easy completion: "Cleared in 4 misses" — celebrates the tie-breaker
  //   stat that drives Easy high scores.
  //   Everything else: "You reached Level N".
  const bodyText = isEasyCompletion
    ? `Cleared in ${formatMisses(totalMismatches)}`
    : `You reached Level ${level}`;

  // Subtitle only shown for Easy completion to label the achievement.
  const subtitle = isEasyCompletion ? `${cfg.label} Mode Complete` : null;

  const handleShare = async () => {
    try {
      const message = isEasyCompletion
        ? `I cleared Easy mode in ${formatMisses(totalMismatches)} on Match Maestro! 🎴 https://matchmaestro.app`
        : `I reached Level ${level} in ${cfg.label} mode on Match Maestro! 🎴 https://matchmaestro.app`;
      await Share.share({ message });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bgNavy }]}>
      <View style={styles.center}>
        <GlassPanel style={styles.panel}>
          {isNewHighScore && (
            <Text
              style={[styles.callout, { color: cfg.tint }]}
              accessibilityLabel="New high score"
            >
              🎉 New high score!
            </Text>
          )}

          <Text
            style={[styles.title, { color: variant.accentColor }]}
            accessibilityRole="header"
          >
            {variant.title}
          </Text>

          {subtitle && (
            <Text style={[styles.subtitle, { color: cfg.tint }]}>
              {subtitle}
            </Text>
          )}

          <Text style={styles.body}>{bodyText}</Text>

          {variant.showShare && (
            <GlassButton
              tintColor={cfg.tint}
              onPress={handleShare}
              style={styles.button}
              accessibilityLabel="Share your result"
            >
              <Text style={styles.buttonText}>Share</Text>
            </GlassButton>
          )}

          <GlassButton
            tintColor="#06b6d4"
            onPress={onPlayAgain}
            style={styles.button}
            accessibilityLabel={`Play ${cfg.label} mode again`}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </GlassButton>

          <GlassButton
            tintColor="#ef4444"
            onPress={onMainMenu}
            style={styles.button}
            accessibilityLabel="Return to mode select"
          >
            <Text style={styles.buttonText}>Main Menu</Text>
          </GlassButton>
        </GlassPanel>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  panel: {
    borderRadius: 20,
    padding: 24,
    alignSelf: 'stretch',
    maxWidth: 480, // Tablet cap so the panel doesn't sprawl on iPad.
    alignItems: 'stretch',
  },
  callout: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
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

export default GameOverScreen;
