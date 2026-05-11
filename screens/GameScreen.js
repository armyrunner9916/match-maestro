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
function GameScreen({
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
  onGiveUp,
}) {
  const cfg = MODES[mode];
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bgNavy }]}>
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
                    LVL {level}
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
                        Misses: {mistakesLeft}
                      </Text>
                    </>
                  )}
                </View>
              </GlassPanel>

              <GlassButton
                tintColor="rgba(255,255,255,0.18)"
                onPress={onPause}
                style={styles.iconButton}
                accessibilityLabel="Pause the game"
              >
                <Text style={styles.iconText}>⏸</Text>
              </GlassButton>

              <GlassButton
                tintColor="rgba(239,68,68,0.55)"
                onPress={onGiveUp}
                style={styles.iconButton}
                accessibilityLabel="Give up and end this run"
                accessibilityHint="Ends the current run immediately"
              >
                <Text style={styles.iconText}>🛑</Text>
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
  // Phase 6.1: GlassPanel-based status header. Layout: panel (flex 1)
  // + 8px gap + Pause icon (44) + 8px gap + Give Up icon (44).
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  statusPanel: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  // Centered inner row — items stack centrally rather than left-aligned,
  // which feels balanced under the centered banner image. No flexWrap so
  // content stays on one line; abbreviated labels ("LVL N" / "Misses: N")
  // keep even Challenge's longest case in-bounds on iPhone SE-class
  // displays. Panel's `overflow: hidden` clips any future overflow.
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
  },
  modeChip: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Light purple to tie the mistakes counter to the Challenge brand tint
  // at higher luminance for readable contrast against the panel surface.
  mistakesItem: {
    color: '#d8b4fe',
  },
  divider: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
  },
  // Phase 6.1 + give-up addition: square icon buttons in the header row.
  // Same dimensions for Pause and Give Up so they read as a paired
  // toolbar; tint colors differentiate (neutral glass vs red).
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
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
