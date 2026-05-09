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

// AsyncStorage keys. Phase 9.2 will migrate these to a `matchMaestro:*` namespace.
// Keep current keys here so the migration has a single source of truth.
export const STORAGE_KEYS = {
  highScores: 'memoryMatchHighScores',
  settings: 'matchMaestroSettings',
  premium: 'matchMaestroIsPremium',
};
