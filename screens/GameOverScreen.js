import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Share,
  useWindowDimensions,
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

  // Phase 10 polish: iPad portrait has so much vertical canvas that the
  // phone-sized panel reads as a small floating island. Tablet form
  // factors get larger panel dimensions, padding, fonts, and buttons so
  // the card feels appropriately substantial. Threshold matches the
  // Phase 3 mode-tile tablet check (width >= 768).
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
        <GlassPanel style={[styles.panel, isTablet && styles.panelTablet]}>
          {isNewHighScore && (
            <Text
              style={[
                styles.callout,
                isTablet && styles.calloutTablet,
                { color: cfg.tint },
              ]}
              accessibilityLabel="New high score"
            >
              🎉 New high score!
            </Text>
          )}

          <Text
            style={[
              styles.title,
              isTablet && styles.titleTablet,
              { color: variant.accentColor },
            ]}
            accessibilityRole="header"
          >
            {variant.title}
          </Text>

          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                isTablet && styles.subtitleTablet,
                { color: cfg.tint },
              ]}
            >
              {subtitle}
            </Text>
          )}

          <Text style={[styles.body, isTablet && styles.bodyTablet]}>
            {bodyText}
          </Text>

          {variant.showShare && (
            <GlassButton
              tintColor={cfg.tint}
              onPress={handleShare}
              style={[styles.button, isTablet && styles.buttonTablet]}
              accessibilityLabel="Share your result"
            >
              <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
                Share
              </Text>
            </GlassButton>
          )}

          <GlassButton
            tintColor="#06b6d4"
            onPress={onPlayAgain}
            style={[styles.button, isTablet && styles.buttonTablet]}
            accessibilityLabel={`Play ${cfg.label} mode again`}
          >
            <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
              Play Again
            </Text>
          </GlassButton>

          <GlassButton
            tintColor="#ef4444"
            onPress={onMainMenu}
            style={[styles.button, isTablet && styles.buttonTablet]}
            accessibilityLabel="Return to mode select"
          >
            <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
              Main Menu
            </Text>
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
    maxWidth: 480, // Phone cap. Tablet override below bumps to 600.
    alignItems: 'stretch',
  },
  panelTablet: {
    maxWidth: 600,
    padding: 32,
    borderRadius: 24,
  },
  callout: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  calloutTablet: {
    fontSize: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleTablet: {
    fontSize: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleTablet: {
    fontSize: 19,
    marginBottom: 12,
  },
  body: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  bodyTablet: {
    fontSize: 22,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonTablet: {
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextTablet: {
    fontSize: 18,
  },
});

export default GameOverScreen;
