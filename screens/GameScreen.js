import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Card from '../components/Card';
import GlassPanel from '../components/GlassPanel';
import GlassButton from '../components/GlassButton';
import { ADMOB_BANNER_ID, COLORS } from '../game/constants';
import { MODES } from '../game/modes';

// Phase 6.1: GlassPanel header (mode chip + level + timer/mistakes).
// Phase 6.2: Pause icon (replaces Give Up button) — wired to onPause prop;
// the PauseOverlay modal renders separately from App.js.
//
// Phase 6 still pending: 6.3 level-up celebration, 6.5 card flip animation.
function GameScreen({
  darkMode,
  mode,
  level,
  timeLeft,
  hasTimer = true,
  mistakesLeft = null,
  cards,
  flippedCards,
  cardSize,
  cardBackColor,
  isPremium,
  onCardPress,
  onPause,
}) {
  const cfg = MODES[mode];
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? COLORS.bgNavy : COLORS.bgNavyLight }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../assets/banner.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />

            {/* Status row: GlassPanel info bar + Pause icon button. The
                panel surfaces mode label (in brand tint) and the two
                relevant numbers — level always, then either time or
                mistakes-left depending on the mode. */}
            <View style={styles.statusRow}>
              <GlassPanel style={styles.statusPanel}>
                <View style={styles.statusInner}>
                  <Text style={[styles.modeChip, { color: cfg.tint }]}>
                    {cfg.label.toUpperCase()}
                  </Text>
                  <Text style={styles.divider}>·</Text>
                  <Text
                    style={styles.statusItem}
                    accessibilityLabel={`Level ${level}`}
                  >
                    Level {level}
                  </Text>
                  {hasTimer && (
                    <>
                      <Text style={styles.divider}>·</Text>
                      <Text
                        style={styles.statusItem}
                        accessibilityLabel={`Time remaining: ${timeLeft} seconds`}
                        accessibilityLiveRegion="polite"
                      >
                        {timeLeft}s
                      </Text>
                    </>
                  )}
                  {!hasTimer && mistakesLeft !== null && (
                    <>
                      <Text style={styles.divider}>·</Text>
                      <Text
                        style={[styles.statusItem, styles.mistakesItem]}
                        accessibilityLabel={`${mistakesLeft} mistakes remaining`}
                        accessibilityLiveRegion="polite"
                      >
                        Misses left: {mistakesLeft}
                      </Text>
                    </>
                  )}
                </View>
              </GlassPanel>

              <GlassButton
                tintColor="rgba(255,255,255,0.18)"
                onPress={onPause}
                style={styles.pauseButton}
                accessibilityLabel="Pause the game"
              >
                <Text style={styles.pauseIcon}>⏸</Text>
              </GlassButton>
            </View>
          </View>

          <ScrollView>
            <View style={styles.gameGrid}>
              {cards.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  isFlipped={flippedCards.includes(card.id)}
                  cardSize={cardSize}
                  cardBackColor={cardBackColor}
                  onPress={() => onCardPress(card.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* AdMob Banner - Only show if not premium */}
        {!isPremium && (
          <View style={styles.adContainer}>
            <BannerAd
              unitId={ADMOB_BANNER_ID}
              size={BannerAdSize.BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              onAdFailedToLoad={(error) => {
                console.log('Ad failed to load:', error);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Phase 3: Android safe-area fix (BUILD_LOG known issues). iOS handles
    // this via SafeAreaView; Android's doesn't account for the status bar.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 60,
    marginBottom: 10,
    borderRadius: 8,
  },
  // Phase 6.1: GlassPanel-based status header.
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  statusPanel: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    flexWrap: 'wrap',
  },
  modeChip: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusItem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Light purple to tie the mistakes counter to the Challenge brand tint
  // at higher luminance for readable contrast against the panel surface.
  mistakesItem: {
    color: '#d8b4fe',
  },
  divider: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  adContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default GameScreen;
