import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  STORAGE_MIGRATION_FLAG,
  STORAGE_MIGRATION_VERSION,
} from './constants';

// 9.2: One-time migration from the 1.x key names to the `matchMaestro:*`
// namespace. Idempotent — checks the migration flag and exits early if
// already at the current version. Does NOT clobber existing new-namespace
// data (so a user who installed both old and new versions in dev won't
// lose progress). Deletes legacy keys after successful copy.
export async function migrateLegacyStorage() {
  try {
    const flag = await AsyncStorage.getItem(STORAGE_MIGRATION_FLAG);
    if (flag === STORAGE_MIGRATION_VERSION) return;

    for (const slice of Object.keys(LEGACY_STORAGE_KEYS)) {
      const legacyKey = LEGACY_STORAGE_KEYS[slice];
      const newKey = STORAGE_KEYS[slice];

      const legacyValue = await AsyncStorage.getItem(legacyKey);
      if (legacyValue === null) continue;

      const existingNew = await AsyncStorage.getItem(newKey);
      if (existingNew === null) {
        await AsyncStorage.setItem(newKey, legacyValue);
      }
      // Always remove the legacy key once we've handled it, even if the
      // new key was already populated — there's no value in keeping the
      // duplicate around.
      await AsyncStorage.removeItem(legacyKey);
    }

    await AsyncStorage.setItem(STORAGE_MIGRATION_FLAG, STORAGE_MIGRATION_VERSION);
  } catch (error) {
    // Migration is best-effort — if it fails, the app still works against
    // the legacy keys for that session, and migration retries next launch.
    console.error('Storage migration error:', error);
  }
}

// Load every persisted slice in parallel. Returns an object with `null` for any
// slice that wasn't present so callers can apply their own defaults.
export async function loadAllData() {
  try {
    const [savedScores, savedSettings, savedPremium] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.highScores),
      AsyncStorage.getItem(STORAGE_KEYS.settings),
      AsyncStorage.getItem(STORAGE_KEYS.premium),
    ]);
    return {
      highScores: savedScores ? JSON.parse(savedScores) : null,
      settings: savedSettings ? JSON.parse(savedSettings) : null,
      isPremium: savedPremium ? JSON.parse(savedPremium) : null,
    };
  } catch (error) {
    console.error('Error loading game data:', error);
    return { highScores: null, settings: null, isPremium: null };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function saveHighScores(scores) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(scores));
  } catch (error) {
    console.error('Error saving high scores:', error);
  }
}

export async function savePremium(isPremium) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.premium, JSON.stringify(isPremium));
  } catch (error) {
    console.error('Error saving premium status:', error);
  }
}
