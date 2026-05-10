import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  STORAGE_MIGRATION_FLAG,
  STORAGE_MIGRATION_VERSION,
} from './constants';
import { DEFAULT_MODE_STATS } from './modes';

// Fresh deep clone of DEFAULT_MODE_STATS — used so callers can mutate the
// returned object without polluting the shared constant.
const cloneDefaultModeStats = () => JSON.parse(JSON.stringify(DEFAULT_MODE_STATS));

// Migrate AsyncStorage forward to STORAGE_MIGRATION_VERSION. Idempotent —
// reads the version flag once and exits early if already current. Each step
// runs only when the previously-stored version is below it, so a fresh
// install jumps straight to the latest version.
//
//   v2: 9.2 — copy legacy 1.x keys into the matchMaestro:* namespace.
//   v3: Phase 4 — seed matchMaestro:modeStats from the legacy top-10 array
//       so existing 1.x/early-2.0 players keep their best level under
//       normal.bestLevel.
export async function migrateLegacyStorage() {
  try {
    const flag = await AsyncStorage.getItem(STORAGE_MIGRATION_FLAG);
    if (flag === STORAGE_MIGRATION_VERSION) return;

    // v2 step: namespace migration. Skip if already at v2 or higher.
    if (flag !== 'v2' && flag !== 'v3') {
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
    }

    // v3 step: seed modeStats from the legacy top-10 array. Skip if already
    // populated (an early-2.0 install that ran the v2 step but a later 2.0
    // launch already wrote modeStats shouldn't be clobbered).
    if (flag !== 'v3') {
      const existingStats = await AsyncStorage.getItem(STORAGE_KEYS.modeStats);
      if (existingStats === null) {
        const seeded = cloneDefaultModeStats();
        const rawScores = await AsyncStorage.getItem(STORAGE_KEYS.highScores);
        if (rawScores !== null) {
          try {
            const scores = JSON.parse(rawScores);
            if (Array.isArray(scores) && scores.length > 0) {
              const maxLevel = scores.reduce(
                (max, entry) => Math.max(max, entry?.level ?? 0),
                0,
              );
              seeded.normal = { bestLevel: maxLevel };
            }
          } catch {
            // Corrupt highScores blob — leave normal.bestLevel at 0.
          }
        }
        await AsyncStorage.setItem(
          STORAGE_KEYS.modeStats,
          JSON.stringify(seeded),
        );
      }
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
// modeStats is special-cased: it falls back to DEFAULT_MODE_STATS so callers
// always get a fully-shaped object.
//
// Phase 8 cleanup: legacy top-10 `highScores` no longer surfaced —
// HighScoresModal is gone, per-mode stats live on the mode tiles. The
// storage key itself still exists and the v3 migration still reads it to
// seed modeStats.normal.bestLevel for upgrading 1.x users.
export async function loadAllData() {
  try {
    const [savedSettings, savedPremium, savedModeStats] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.settings),
      AsyncStorage.getItem(STORAGE_KEYS.premium),
      AsyncStorage.getItem(STORAGE_KEYS.modeStats),
    ]);
    return {
      settings: savedSettings ? JSON.parse(savedSettings) : null,
      isPremium: savedPremium ? JSON.parse(savedPremium) : null,
      modeStats: savedModeStats ? JSON.parse(savedModeStats) : cloneDefaultModeStats(),
    };
  } catch (error) {
    console.error('Error loading game data:', error);
    return {
      settings: null,
      isPremium: null,
      modeStats: cloneDefaultModeStats(),
    };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// saveHighScores removed in Phase 8 — legacy top-10 array no longer
// written. The STORAGE_KEYS.highScores constant + v3 migration read still
// exist to seed modeStats for upgrading 1.x users on first launch.

export async function savePremium(isPremium) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.premium, JSON.stringify(isPremium));
  } catch (error) {
    console.error('Error saving premium status:', error);
  }
}

export async function saveModeStats(stats) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.modeStats, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving mode stats:', error);
  }
}
