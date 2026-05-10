// Phase 4: Single source of truth for all four difficulty modes.
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
//                      null = unlimited.
//
// Phase 3 will consume this for the mode-select UI; Phase 4 just threads
// the values through gameplay. Adding a new mode = one entry here.

export const MODES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    hint: '10 levels',
    tint: '#10b981', // brand green
    pairsStart: 2,
    timerStart: 20,
    timerDelta: 5,
    mismatchPenalty: 0,
    levelCap: 10,
    mistakeBudget: null,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    hint: 'Classic',
    tint: '#f59e0b', // brand amber
    pairsStart: 2,
    timerStart: 15,
    timerDelta: 3,
    mismatchPenalty: 0,
    levelCap: null,
    mistakeBudget: null,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    hint: '−2s per miss',
    tint: '#ef4444', // brand red
    pairsStart: 4,
    timerStart: 12,
    timerDelta: 2,
    mismatchPenalty: 2,
    levelCap: null,
    mistakeBudget: null,
  },
  challenge: {
    id: 'challenge',
    label: 'Challenge',
    hint: '1 mistake / level',
    tint: '#9333ea', // brand purple
    pairsStart: 6,
    timerStart: null,
    timerDelta: 0,
    mismatchPenalty: 0,
    levelCap: null,
    mistakeBudget: 1,
  },
};

export const MODE_IDS = ['easy', 'normal', 'hard', 'challenge'];

export const DEFAULT_MODE = 'normal';

// Initial per-mode persisted stats. easy tracks completion + a tie-breaker
// (fewer mismatches = better); the others track best level reached. Phase 3
// will use this shape to render mode-select badges; Phase 8 will surface
// the easy "completed" celebration.
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
