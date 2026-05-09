import { Platform } from 'react-native';

// Card symbols - 30 unique symbols, supports up to 30 pairs (60 cards)
export const SYMBOLS = [
  '⭐', '🎈', '🎨', '🎯', '🎪', '🎭', '🎸', '🎺',
  '🏀', '⚽', '🌈', '🌺', '🍕', '🍔', '🚀', '🛸',
  '🦁', '🐬', '🦋', '🍎', '🎃', '🏆', '🎲', '🌙',
  '🐉', '🦄', '🍦', '🎹', '🌊', '🔥',
];

// AdMob banner ad unit ID (production)
export const ADMOB_BANNER_ID = Platform.select({
  ios: 'ca-app-pub-7368779159802085/5597631324',
  android: 'ca-app-pub-7368779159802085/1254243392',
});

// RevenueCat API keys
export const REVENUECAT_API_KEYS = {
  ios: 'appl_KQKQaVWRStoGVpKEeGbCSCKKihm',
  android: 'goog_QWxzZRlzsqybdmaBHdFkxvuAxVA',
};

// AsyncStorage keys (active). All keys live under the `matchMaestro:*`
// namespace post-9.2. Legacy keys are migrated once on first 2.0 launch via
// migrateLegacyStorage() in game/storage.js.
export const STORAGE_KEYS = {
  highScores: 'matchMaestro:highScores',
  settings: 'matchMaestro:settings',
  premium: 'matchMaestro:premium',
};

// Legacy 1.x keys. Read once on first launch by migrateLegacyStorage(),
// copied into STORAGE_KEYS, then deleted. Do not write to these.
export const LEGACY_STORAGE_KEYS = {
  highScores: 'memoryMatchHighScores',
  settings: 'matchMaestroSettings',
  premium: 'matchMaestroIsPremium',
};

// Bump this when adding a new migration step so users on every prior
// version migrate forward exactly once.
export const STORAGE_MIGRATION_FLAG = 'matchMaestro:migrated';
export const STORAGE_MIGRATION_VERSION = 'v2';
