import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

import { STORAGE_KEYS } from './constants';

// Native in-app rating prompt (Apple SKStoreReviewController / Google Play
// In-App Review). The OS itself throttles how often its dialog actually
// appears (~3 times per 365 days on iOS, and silently no-ops past the cap),
// so this module's job is only to (a) ask exclusively after positive
// moments and (b) avoid burning those system allowances on players who
// clearly aren't engaged yet.
//
// Gate:
//   - Only ever called from a positive game outcome (see App.js endGame).
//   - Requires a few good moments first, so the very first win — before the
//     player has formed an opinion — doesn't trigger a prompt.
//   - Self-imposed cooldown between prompts on top of the OS throttle.
//
// Best-effort throughout: any failure (storage, unavailable platform) is
// swallowed so the prompt can never disrupt the Game Over flow.

const MIN_POSITIVE_OUTCOMES = 3;
const REPROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 90; // 90 days

// Read persisted rating state. Returns a fully-shaped default for a fresh
// install or any read/parse failure.
async function readRatingState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.rating);
    if (!raw) return { positiveCount: 0, lastPromptTs: null };
    const parsed = JSON.parse(raw);
    return {
      positiveCount: parsed.positiveCount ?? 0,
      lastPromptTs: parsed.lastPromptTs ?? null,
    };
  } catch {
    return { positiveCount: 0, lastPromptTs: null };
  }
}

async function writeRatingState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.rating, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving rating state:', error);
  }
}

// Call after a positive game outcome (Easy completion or a new high score).
// Records the good moment and, once the player has had enough of them and
// we're outside the cooldown, asks the OS to surface its native review
// prompt. The positive counter is always advanced; the prompt itself is
// gated.
export async function maybeRequestReview() {
  try {
    const state = await readRatingState();
    const positiveCount = state.positiveCount + 1;

    const now = Date.now();
    const cooledDown =
      state.lastPromptTs === null ||
      now - state.lastPromptTs >= REPROMPT_COOLDOWN_MS;

    const eligible = positiveCount >= MIN_POSITIVE_OUTCOMES && cooledDown;

    if (!eligible) {
      await writeRatingState({ ...state, positiveCount });
      return;
    }

    // hasAction() is the strongest "can we actually review?" check — it
    // verifies native capability AND, on its fallback path, that store URLs
    // exist. Falls back gracefully if the platform can't review at all.
    const canReview = await StoreReview.hasAction();
    if (!canReview) {
      await writeRatingState({ ...state, positiveCount });
      return;
    }

    await StoreReview.requestReview();

    // Record the prompt time so the cooldown gates re-prompting. We do NOT
    // reset positiveCount — the cooldown plus the OS-level cap are what
    // prevent nagging.
    await writeRatingState({ positiveCount, lastPromptTs: now });
  } catch (error) {
    console.error('Rating prompt error:', error);
  }
}
