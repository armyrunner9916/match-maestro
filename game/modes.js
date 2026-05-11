// Phase 4: Single source of truth for all four difficulty modes.
// Adding a new mode = one entry here.
//
// Field semantics:
//   pairsStart       — number of pairs at level 1
//   timerStart       — seconds on the clock at level 1; null = no timer
//   timerDelta       — seconds added each level advance
//   mismatchPenalty  — seconds subtracted from timeLeft on each mismatch
//   levelCap         — last playable level; null = endless. Completing
//                      the cap level ends the run with outcome 'completed'.
//   mistakeBudget    — free mismatches per level before the run ends
//                      (so 1 means: end on the second mismatch in a level).
//                      null = unlimited. May be a number or a
//                      `(pairs) => number` function for pair-scaled budgets.
//   lockFirstFlip    — if true, tapping a face-up card a second time will
//                      NOT un-flip it. Prevents free peeks.

// Brand colors match Numlok's mode palette (Material 500s) so cross-app
// branding reads as the same designer's hand. `tint` is the solid hex for
// labels/headers; `tileBg` is the same color at 92% alpha for tile fills
// over a Liquid Glass surface.
export const MODES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    hint: '10 levels',
    tint: '#4CAF50',
    tileBg: 'rgba(76, 175, 80, 0.92)',
    pairsStart: 2,
    timerStart: 20,
    timerDelta: 5,
    mismatchPenalty: 0,
    levelCap: 10,
    mistakeBudget: null,
    lockFirstFlip: false,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    hint: 'Classic',
    tint: '#FFC107',
    tileBg: 'rgba(255, 193, 7, 0.92)',
    pairsStart: 2,
    timerStart: 15,
    timerDelta: 3,
    mismatchPenalty: 0,
    levelCap: null,
    mistakeBudget: null,
    lockFirstFlip: false,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    hint: '−1s per miss',
    tint: '#F44336',
    tileBg: 'rgba(244, 67, 54, 0.92)',
    pairsStart: 4,
    timerStart: 16,
    timerDelta: 2,
    mismatchPenalty: 1,
    levelCap: null,
    mistakeBudget: null,
    lockFirstFlip: false,
  },
  challenge: {
    id: 'challenge',
    label: 'Challenge',
    hint: 'Tight mistake budget',
    tint: '#9C27B0',
    tileBg: 'rgba(156, 39, 176, 0.92)',
    pairsStart: 6,
    timerStart: null,
    timerDelta: 0,
    mismatchPenalty: 0,
    levelCap: null,
    // Function form: budget scales with pair count. (pairs - 1) gives 5 at
    // level 1 / 6 at level 2 / 7 at level 3 — tight enough to bite when
    // combined with the lockFirstFlip "no peek" rule, but enough to
    // acquire info from a fresh deck without first-flip death. Iterations
    // (pairs - 3 → pairs + 1 → pairs - 1) bracketed the sweet spot.
    // Per-level — counter resets in nextLevel.
    mistakeBudget: (pairs) => pairs - 1,
    // No take-backsies: once you flip a card, tapping it again won't
    // un-flip it. Forces commitment so players can't "peek" at a card
    // and then back out once they've learned its symbol.
    lockFirstFlip: true,
  },
};

export const MODE_IDS = ['easy', 'normal', 'hard', 'challenge'];

export const DEFAULT_MODE = 'normal';

// Initial per-mode persisted stats. easy tracks completion + a tie-breaker
// (fewer mismatches = better); the others track best level reached. Consumed
// by ModeSelectScreen's per-tile stat line and by GameOverScreen's Easy
// completion variant.
export const DEFAULT_MODE_STATS = {
  easy: { completed: false, fewestMismatches: null },
  normal: { bestLevel: 0 },
  hard: { bestLevel: 0 },
  challenge: { bestLevel: 0 },
};

// Returns true if `id` is a recognized mode key.
export function isValidMode(id) {
  return Object.prototype.hasOwnProperty.call(MODES, id);
}
