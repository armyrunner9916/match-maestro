import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import GlassPanel from '../components/GlassPanel';
import GlassButton from '../components/GlassButton';
import CardBack from '../components/CardBack';

// Phase 7: Settings modal redesigned with Liquid Glass + SVG card-back
// preview picker. The previous color-swatch grid is replaced with six
// 76px <CardBack> previews labeled by design name (Wave / Chevron / Vine /
// Sunburst / Deco / Labyrinth) — names matter, they signal a *collection*,
// not a color preference, and set up future IAP theme packs.

// Single source of truth for the design lineup. Order matches the plan's
// design assignment table.
const DESIGNS = [
  { color: 'blue',   name: 'Wave' },
  { color: 'red',    name: 'Chevron' },
  { color: 'green',  name: 'Vine' },
  { color: 'yellow', name: 'Sunburst' },
  { color: 'purple', name: 'Deco' },
  { color: 'black',  name: 'Labyrinth' },
];

const TILE_SIZE = 76;

function SettingsModal({
  visible,
  onClose,
  cardBackColor,
  setCardBackColor,
  hapticEnabled,
  setHapticEnabled,
  onOpenMoreGames,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop tap closes; the inner Pressable swallows taps so taps on the
          panel don't bubble up and dismiss. onRequestClose handles the
          Android hardware back button. */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Outer container constrains modal width. GlassPanel inside renders
            a BlurView with a built-in dark overlay on iOS (and a solid
            translucent fallback on Android). We wrap rather than passing
            maxWidth directly because GlassPanel's splitStyle only routes
            `width` (not `maxWidth`) to its outer BlurView wrapper. */}
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          <GlassPanel intensity={60} style={styles.modalPanel}>
            <View style={styles.content}>
              <Text style={styles.title}>Settings</Text>

            {/* Card back picker --------------------------------------- */}
            <Text style={styles.sectionLabel}>Card Back Design</Text>
            <View style={styles.tileRow}>
              {DESIGNS.map((design) => {
                const isSelected = design.color === cardBackColor;
                return (
                  <TouchableOpacity
                    key={design.color}
                    onPress={() => setCardBackColor(design.color)}
                    style={styles.tile}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${design.name} card back`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.tilePreviewWrapper,
                        isSelected && styles.tilePreviewSelected,
                      ]}
                    >
                      <CardBack size={TILE_SIZE} color={design.color} />
                    </View>
                    <Text
                      style={[
                        styles.tileLabel,
                        isSelected && styles.tileLabelSelected,
                      ]}
                    >
                      {design.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Haptic toggle ------------------------------------------ */}
            <Text style={styles.sectionLabel}>Feedback</Text>
            <GlassButton
              tintColor={
                hapticEnabled
                  ? 'rgba(16, 185, 129, 0.85)'   // green when on
                  : 'rgba(107, 114, 128, 0.85)'  // gray when off
              }
              onPress={() => setHapticEnabled(!hapticEnabled)}
              accessibilityLabel="Haptic feedback"
              accessibilityState={{ checked: hapticEnabled }}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>📳 Haptic Feedback</Text>
              <Text style={styles.toggleState}>{hapticEnabled ? 'ON' : 'OFF'}</Text>
            </GlassButton>

            {/* More Games --------------------------------------------- */}
            {onOpenMoreGames && (
              <>
                <Text style={styles.sectionLabel}>Discover</Text>
                <GlassButton
                  tintColor="rgba(255,255,255,0.14)"
                  onPress={onOpenMoreGames}
                  accessibilityLabel="More games from this studio"
                  style={styles.moreGamesButton}
                >
                  <Text style={styles.moreGamesText}>🎮 More Games</Text>
                  <Text style={styles.moreGamesChevron}>›</Text>
                </GlassButton>
              </>
            )}

            {/* Close --------------------------------------------------- */}
              <GlassButton
                tintColor="rgba(37, 99, 235, 0.85)"
                onPress={onClose}
                accessibilityLabel="Close settings"
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </GlassButton>
            </View>
          </GlassPanel>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
  },
  modalPanel: {
    // borderRadius is the one style splitStyle applies to both outer (BlurView
    // clip) and inner (View bg) — keeps the rounded corners crisp.
    borderRadius: 20,
  },
  content: {
    padding: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: 10,
  },

  // Card-back picker
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tile: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 14,
  },
  tilePreviewWrapper: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tilePreviewSelected: {
    borderColor: 'rgba(255,255,255,0.4)', // white-alpha-40 ring per plan
    transform: [{ scale: 1.05 }],
  },
  tileLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    fontWeight: '500',
  },
  tileLabelSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Haptic toggle
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleState: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // More Games row
  moreGamesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  moreGamesText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  moreGamesChevron: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 22,
    fontWeight: '600',
  },

  // Close
  closeButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsModal;
