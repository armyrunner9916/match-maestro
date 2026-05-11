import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { MODE_IDS, MODES } from '../game/modes';
import { COLORS } from '../game/constants';

// Phase 3 mode-select screen. Replaces LandingScreen.
//
// Layout (top → bottom):
//   header row     : invisible spacer | banner | settings icon
//                    (Phase 10 dropped the dark/light toggle; spacer keeps
//                     the banner visually centered.)
//   name input
//   2x2 grid       : Easy / Normal | Hard / Challenge — each a GlassCard
//                    tinted with the mode's brand color. Tap = startGame.
//   premium block  : Remove Ads + Restore Purchases grouped together
//                    (Phase 8 removed the High Scores button — per-mode
//                     best stats live on the tiles above.)
//
// Android safe-area fix applied here per BUILD_LOG known issues — Phase 3
// is when the header rebuild made it the natural place to land. Same fix
// rolled into GameScreen and GameOverScreen at the same time.

const formatModeStat = (modeId, modeStats) => {
  const stats = modeStats?.[modeId];
  if (modeId === 'easy') {
    if (stats?.completed) {
      const m = stats.fewestMismatches;
      return m === null || m === undefined ? '✓ Completed' : `✓ Completed (${m} miss${m === 1 ? '' : 'es'})`;
    }
    return 'Not yet completed';
  }
  const best = stats?.bestLevel ?? 0;
  return best > 0 ? `Best: Level ${best}` : 'No runs yet';
};

// Tile = GlassCard wrapper + solid-color inner View at 92% alpha + white
// text. Matches the Numlok mode-card styling so the two apps share visual
// DNA. The 0.92 alpha lets the glass surface peek through subtly without
// muddying the brand color.
const ModeTile = ({ modeId, modeStats, onPress }) => {
  const cfg = MODES[modeId];
  return (
    <Pressable
      onPress={() => onPress(modeId)}
      style={({ pressed }) => [
        styles.tileOuter,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Start ${cfg.label} mode`}
      accessibilityHint={cfg.hint}
    >
      <GlassCard style={styles.tile}>
        <View style={[styles.tileFill, { backgroundColor: cfg.tileBg }]}>
          {/* Glossy gradient overlay: a bright sliver at the very top
              edge, strong sheen across the upper third, neutral mid, and
              a punchy shadow at the bottom. The four-stop curve reads as
              a real bevel rather than a soft wash, matching Numlok's
              tile depth. */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.55)', // top edge highlight (1-2px effect)
              'rgba(255,255,255,0.28)', // sheen across upper third
              'rgba(255,255,255,0.00)', // neutral
              'rgba(0,0,0,0.28)',       // bottom shadow
            ]}
            locations={[0, 0.05, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.tileTextStack}>
            <Text style={styles.tileLabel}>{cfg.label}</Text>
            <Text style={styles.tileHint}>{cfg.hint}</Text>
            <Text style={styles.tileStat}>{formatModeStat(modeId, modeStats)}</Text>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
};

function ModeSelectScreen({
  playerName,
  setPlayerName,
  modeStats,
  onSelectMode,
  onOpenSettings,
  isPremium,
  onOpenPremium,
  onRestorePurchases,
  isLoadingPremium,
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bgNavy }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Compact header row: invisible spacer + banner + settings icon.
            Phase 10 dropped the dark/light toggle entirely — the app is
            dark-only. The 44pt spacer on the left mirrors the gear
            button on the right so the banner stays visually centered. */}
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />

          <Image
            source={require('../assets/banner.png')}
            style={styles.banner}
            resizeMode="contain"
          />

          <Pressable
            onPress={onOpenSettings}
            style={({ pressed }) => [
              styles.headerIcon,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          value={playerName}
          onChangeText={setPlayerName}
          accessibilityLabel="Player name"
        />

        {/* 2x2 mode grid — two rows of `flex: 1` tiles is the canonical RN
            pattern; percentage widths plus margin would overflow. */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <ModeTile modeId="easy" modeStats={modeStats} onPress={onSelectMode} />
            <ModeTile modeId="normal" modeStats={modeStats} onPress={onSelectMode} />
          </View>
          <View style={styles.gridRow}>
            <ModeTile modeId="hard" modeStats={modeStats} onPress={onSelectMode} />
            <ModeTile modeId="challenge" modeStats={modeStats} onPress={onSelectMode} />
          </View>
        </View>

        {/* High Scores button removed in Phase 8 cleanup. Per-mode best
            stats live on the tiles above; a per-mode Stats modal is
            queued for post-2.0 (see BUILD_LOG open notes). */}
        <View style={styles.premiumBlock}>
          {!isPremium && (
            <GlassButton
              tintColor="#d4af37"
              onPress={onOpenPremium}
              style={styles.actionButton}
              accessibilityLabel="Remove ads, in-app purchase"
            >
              <Text style={[styles.actionButtonText, { color: '#1a1300' }]}>
                💎  Remove Ads
              </Text>
            </GlassButton>
          )}

          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>✨ Premium — No Ads</Text>
            </View>
          )}

          {/* Restore Purchases — always visible per App Store guideline 3.1.1 */}
          {!isPremium && (
            <Pressable
              onPress={onRestorePurchases}
              disabled={isLoadingPremium}
              style={styles.restoreButton}
              accessibilityRole="button"
              accessibilityLabel="Restore previous purchases"
              accessibilityState={{ disabled: isLoadingPremium }}
            >
              {isLoadingPremium ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Text style={[styles.restoreText, { color: '#9ca3af' }]}>
                  🔄  Restore Purchases
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GRID_GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Android safe-area fix (see BUILD_LOG known issues). iOS handles this
    // via SafeAreaView; Android's SafeAreaView doesn't account for the
    // status bar so we add the offset manually.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same width as headerIcon — invisible spacer on the left of the
  // headerRow so the banner image stays visually centered after the
  // dark/light toggle was removed in Phase 10.
  headerSpacer: {
    width: 44,
    height: 44,
  },
  headerIconText: {
    fontSize: 22,
  },
  banner: {
    flex: 1,
    height: 90, // 75% of pre-Phase-3 120px
    marginHorizontal: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#ffffff',
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gridContainer: {
    rowGap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    columnGap: GRID_GAP,
  },
  tileOuter: {
    // Pressable wraps GlassCard; GlassCard handles its own border-radius.
    flex: 1, // each tile takes equal share of the row
    borderRadius: 16,
    overflow: 'hidden',
    // Heavier drop shadow than typical — pairs with the inner gradient
    // bevel to make the tiles feel raised off the navy bg.
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  // Phase 8 cleanup: tile dimensions grew to absorb the vertical space
  // freed by removing the High Scores button (minHeight 140 → 180,
  // padding 16 → 20, label 20pt → 24pt). 2x2 grid now fills the bottom
  // half of the screen more comfortably on phones; iPad tiles read more
  // like cards than chips.
  tile: {
    borderRadius: 16,
    minHeight: 180,
  },
  tileFill: {
    flex: 1,
    overflow: 'hidden',
  },
  tileTextStack: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  tileLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  tileHint: {
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
  },
  tileStat: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 'auto',
  },
  // Bottom action area.
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 26, // +10 from prior 16 — gives the 2x2 grid breathing room
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumBlock: {
    marginTop: 24, // generous gap separating premium controls from the mode grid
  },
  premiumBadge: {
    backgroundColor: '#d4af37',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: '#1a1300',
    fontWeight: '700',
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

export default ModeSelectScreen;
