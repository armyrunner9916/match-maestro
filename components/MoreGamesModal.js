// ─────────────────────────────────────────────────────────────────────────────
// MoreGamesModal — cross-promo modal (Match Maestro copy)
//
// Lists the other titles in the studio and opens each game's redirect URL on
// tap. Adapted from the portable TapLight component:
//   - icons live in this app at `assets/app-icons/` (not `assets/images/...`)
//   - OWN_APP excludes Match Maestro from its own list
//   - card surface matches the app: GlassPanel (liquid glass) on iOS, a solid
//     dark card on Android, which is where GlassPanel falls back anyway
//
// When the studio ships a new game: add an entry to GAMES, drop its 256x256
// icon into assets/app-icons/, and release a small version bump in each app.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Linking,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

import GlassPanel from './GlassPanel';
import GlassButton from './GlassButton';

// This app — excluded from the list below. Must match a `name` in GAMES.
const OWN_APP = 'Match Maestro';

// Master cross-promo list. Keep identical across apps — only OWN_APP differs.
const GAMES = [
  {
    name: 'TapLight',
    tagline: 'Follow the pattern. Test your memory.',
    url: 'https://taplight.app',
    icon: require('../assets/app-icons/taplight.png'),
  },
  {
    name: 'Numlok',
    tagline: 'Find the pattern. Crack the code.',
    url: 'https://numlok.app',
    icon: require('../assets/app-icons/numlok.png'),
  },
  {
    name: 'WordShift',
    tagline: 'Decipher letters. Discover words.',
    url: 'https://wordshiftgame.app',
    icon: require('../assets/app-icons/wordshift.png'),
  },
  {
    name: 'GridZen2',
    tagline: 'Swap. Sort. Beat the clock.',
    url: 'https://gridzen2.app',
    icon: require('../assets/app-icons/gridzen2.png'),
  },
  {
    name: 'Unchunked2',
    tagline: '9 letters. 3 chunks. 1 word.',
    url: 'https://unchunked2.app',
    icon: require('../assets/app-icons/unchunked2.png'),
  },
  {
    name: 'Match Maestro',
    tagline: 'Find matches. Race the timer.',
    url: 'https://matchmaestro.app',
    icon: require('../assets/app-icons/matchmaestro.png'),
  },
];

const VISIBLE_GAMES = GAMES.filter((g) => g.name !== OWN_APP);

const openGame = (url) => Linking.openURL(url).catch(() => {});

const MoreGamesModal = ({ visible, onClose }) => {
  // Title + list + Done — shared between the iOS glass card and the Android
  // solid card so the two platforms stay in sync.
  const content = (
    <>
      <Text style={styles.title}>More Games</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {VISIBLE_GAMES.map((g) => (
          <TouchableOpacity
            key={g.url}
            style={styles.row}
            onPress={() => openGame(g.url)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${g.name} — ${g.tagline}. Opens in the app store.`}
          >
            {g.icon ? (
              <Image source={g.icon} style={styles.icon} />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconInitial}>{g.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.rowText}>
              <Text style={styles.name}>{g.name}</Text>
              <Text style={styles.tagline}>{g.tagline}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <GlassButton
        tintColor="rgba(37, 99, 235, 0.85)"
        onPress={onClose}
        style={styles.done}
        accessibilityLabel="Close more games"
      >
        <Text style={styles.doneText}>Done</Text>
      </GlassButton>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable swallows taps so a tap on the card doesn't close
            the modal via the backdrop's onPress. */}
        <Pressable onPress={() => {}}>
          {Platform.OS === 'ios' ? (
            <GlassPanel intensity={60} style={styles.cardGlass}>
              <View style={styles.cardContent}>{content}</View>
            </GlassPanel>
          ) : (
            <View style={styles.card}>{content}</View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  // iOS: GlassPanel routes `width`/`borderRadius` to its outer BlurView and
  // applies padding via the inner cardContent View.
  cardGlass: {
    width: 340,
    borderRadius: 22,
  },
  cardContent: {
    padding: 22,
  },
  // Android: solid dark card (matches GlassPanel's own Android fallback tone).
  card: {
    width: 340,
    borderRadius: 22,
    padding: 22,
    backgroundColor: 'rgba(28, 28, 38, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  list: { maxHeight: 340 },
  listContent: { paddingBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  icon: { width: 44, height: 44, borderRadius: 10, marginRight: 12 },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInitial: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  rowText: { flex: 1, paddingRight: 10 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  tagline: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  done: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default MoreGamesModal;
