# Match Maestro 2.0 — Build Log

Resume-from-cold guide. The canonical spec lives at
`~/Desktop/MATCHMAESTRO_2.0_PLAN.md`; this doc tracks where we are
in executing it.

---

## Where we are right now

**Branch:** `main` (tracking `origin/main` on GitHub)
**Repo:** https://github.com/armyrunner9916/match-maestro
**Last commit:** `91b1fbc Phase 3: Mode select screen — Liquid Glass aesthetic`
**Working tree:** clean, all commits pushed
**App state:** builds and runs on iOS simulator (iPhone Air + iPad Pro
11-inch verified). All four modes are now selectable from the new
ModeSelectScreen; the Liquid Glass aesthetic dominates the home screen.
Game flow: tap mode tile → play that mode → game over → main menu
(returns to mode select).

### Commits so far (oldest → newest)

```
2c073c7 Initial commit (GitHub-generated, README only)
4e3c620 Initial commit with RevenueCat
9203495 chore: post-migration baseline + gitignore hygiene
6cafa53 Phase 1: foundation refactor + iOS toolchain fixes
b5bddd8 Phase 9: tech debt + accessibility + Game Over polish
ab1439f docs: add BUILD_LOG.md as session-resume guide
1afa81f Phase 2: SVG card backs
ce131b2 Phase 7: Settings refresh — SVG picker + Liquid Glass
8a674d9 ios: lock iPad to portrait orientation
9dd687e docs: update BUILD_LOG with Phase 2, Phase 7, and orientation lock
6444321 Phase 4: Modes config — pure logic for Easy/Normal/Hard/Challenge
70b07da docs: update BUILD_LOG for Phase 4
91b1fbc Phase 3: Mode select screen — Liquid Glass aesthetic
```

(Note: Phase 1 / Phase 9 / BUILD_LOG / Phase 2 commits have different
SHAs in the local reflog from when they were created — those were
rebased onto GitHub's initial commit during the first push. Content is
identical; just new parent hashes.)

---

## Execution order (agreed: plan-recommended)

We chose **Option 1** from the plan's "Suggested execution order" —
phases done in the order that minimizes rework, not in numerical order:

1. ✅ **Phase 1 + 9** — foundation + tech debt
2. ✅ **Phase 2** — SVG card backs
3. ✅ **Phase 7** — settings refresh (uses Phase 2 card backs)
4. ✅ **Phase 4** — modes config (pure logic)
5. ✅ **Phase 3** — mode select screen (consumes Phase 4)
6. ⏭️ **Phase 6 + 8** — in-game UX + game over redesign ← **NEXT**
7. ❌ **Phase 5** — Daily Challenge — *cut from 2.0; revisit post-launch*
8. ⏭️ **Phase 10** — QA + ship

---

## What's done

### Phase 1 — Foundation ✅

- **1.1** Dependencies installed: `expo-blur`, `expo-linear-gradient`,
  `react-native-svg`, `@expo/vector-icons`, `@callstack/liquid-glass`.
- **1.2** Glass components ported from Taplight verbatim:
  `GlassButton.js`, `GlassPanel.js`, `GlassCard.js`.
- **1.3** App.js refactored from 951 → 475 lines via Path A
  (structural-only, zero behavior change). New layout:

  ```
  MatchMaestro/
    App.js                      orchestrator (state + screen routing)
    components/
      Card.js                   gameplay tile wrapper
      CardBack.js               SVG, six designs (Phase 2)
      GlassButton.js            from Taplight, a11y-prop-forwarding
      GlassCard.js              from Taplight (uses @callstack/liquid-glass)
      GlassPanel.js             from Taplight
    screens/
      LandingScreen.js          (Phase 3 will replace as ModeSelectScreen)
      GameScreen.js
      GameOverScreen.js         (interim 3-button layout, Phase 8 redesigns)
      SettingsModal.js          ✨ Liquid Glass + SVG picker (Phase 7)
      HighScoresModal.js
      PremiumModal.js
    game/
      constants.js              SYMBOLS, ad IDs, RC keys, storage keys
      storage.js                AsyncStorage wrapper + matchMaestro:* migration
  ```

### iOS toolchain fixes ✅ (bundled with Phase 1)

- Bumped `react-native-purchases` 7.13.0 → 9.15.2 (fixed Swift
  `'SubscriptionPeriod' is ambiguous` compile error)
- `pod update PurchasesHybridCommon` to resolve the version conflict
- `Podfile`: `inhibit_all_warnings!` + post_install hook normalizing
  every Pod's `IPHONEOS_DEPLOYMENT_TARGET` to 15.1

### Phase 9 — Tech debt + accessibility ✅

| Item | Status | Notes |
|---|---|---|
| 9.1 `completedLevel` semantic | ⏸️ deferred | Plan says fix as part of Phase 6.4 state split |
| 9.2 AsyncStorage namespace migration | ✅ | `matchMaestro:*` namespace, idempotent migration, version-flagged `v2`. Existing 1.x scores preserved. |
| 9.3 `useWindowDimensions` | ✅ | Reflows on rotation / iPad split-view |
| 9.4 Real RevenueCat keys | ✅ | Already done before this branch |
| 9.5 Card grid math | ✅ | Magic 60 → named constants (real values: 52 + 10) |
| 9.6 useCallback dep audit | ✅ | `triggerHaptic` + `nextLevel` deps fixed; `nextLevel` reordered above `handleCardPress` to avoid TDZ |
| 9.7 Accessibility | ✅ | Labels + roles on every interactive element; `GlassButton` forwards a11y props |
| 9.8 Pause timer during match resolution | ✅ | Timer effect gated on `!isProcessingMatch` |

### Game Over polish (interim) ✅

Three-button layout with semantic colors, pending the full Phase 8
redesign:

- **New Game** (cyan) — actually restarts the game (was misleadingly
  dumping to landing before)
- **Main Menu** (blue) — returns to landing
- **View High Scores** (purple) — opens modal on landing

### Phase 2 — SVG card backs ✅

Six distinct designs in `components/CardBack.js`, each rendered via
`react-native-svg` and wrapped in `React.memo` (16+ cards on screen
each re-rendering on flip is expensive). Coordinate system:
`viewBox="0 0 100 140"` (matches the card's 1:1.4 aspect).

| Color | Design | Motif |
|---|---|---|
| Blue | Wave | 8 stacked sine arcs + foam-dot grid |
| Red | Chevron | 9 nested V-shapes alternating wide/narrow |
| Green | Vine | Two procedurally-generated mirrored trees, 5 branch levels each, leaves at every tip + mid-branch, twigs, central berry cluster (~50 SVG elements) |
| Yellow | Sunburst | 24 alternating long/medium rays + outer ring of 24 dots + 3-layer concentric medallion |
| Purple | Deco | 4×5 grid of outlined diamonds with inner filled diamonds + connecting trellis lines |
| Black | Labyrinth | Greek-key meander border + two stacked central cartouches with cross detail |

All designs ship with the inner border frame element that real playing
card backs have ("card edge" feel).

### Phase 7 — Settings refresh ✅

- **7.1 SVG card-back preview picker** — Six 76px `<CardBack>` previews
  in a 3-column grid, named (Wave/Chevron/Vine/Sunburst/Deco/Labyrinth).
  Tap = immediate apply with `setCardBackColor`. Selected state: 2px
  white-alpha-40 ring + 5% scale-up + bolder/brighter label.
- **7.2 Settings modal redesigned with Liquid Glass** —
  `GlassPanel` frame with built-in dark overlay tint over `BlurView`.
  `GlassButton` for haptic toggle (green on / gray off) and Close (blue).
  480px max-width on tablets via outer container wrapper.
- **7.3 Sound effects** — ⏸️ deferred (needs audio asset sourcing from
  Mixkit / Zapsplat / freesound.org).
- **7.4 Top-corner sound + dark-mode icons** — ⏸️ deferred to Phase 3
  (depends on the new mode-select header).

### Phase 4 — Modes config ✅

Pure logic, no UI. All four difficulties live in `game/modes.js` as the
single source of truth. `startGame` and `nextLevel` consume `MODES[mode]`
instead of hardcoded values. Default mode is `'normal'` so existing
behavior is preserved verbatim until Phase 3 wires the mode-select UI.

| Mode | pairsStart | timerStart | timerDelta | mismatchPenalty | levelCap | mistakeBudget |
|---|---|---|---|---|---|---|
| Easy | 2 | 20 | +5 | 0 | 10 | — |
| Normal | 2 | 15 | +3 | 0 | — | — |
| Hard | 4 | 12 | +2 | 2s | — | — |
| Challenge | 6 | null (no timer) | 0 | 0 | — | 1 |

- **4.1 `MODES` config** — Single source of truth + `DEFAULT_MODE`,
  `MODE_IDS`, `DEFAULT_MODE_STATS`, `isValidMode()`. Adding a new mode
  is a single entry.
- **4.2 Mode threading** — `startGame(modeId = mode)` pulls level-1
  settings from MODES; `nextLevel` reads timer/pair deltas from MODES
  and resets the per-level Challenge counter.
- **4.3 v3 storage migration** — New `matchMaestro:modeStats` key
  alongside the legacy top-10 array. v3 step seeds `normal.bestLevel`
  from the legacy array's max level so existing players keep their
  progress. `endGame` dual-writes both shapes during the transition;
  Phase 3/8 will rip out the legacy array when HighScoresModal is
  replaced. `STORAGE_MIGRATION_VERSION` bumped to `'v3'`.
- **4.4 Hard mode mismatchPenalty** — `handleCardPress` mismatch branch
  subtracts `cfg.mismatchPenalty` seconds from `timeLeft`, clamped at 0.
  No-op for non-Hard modes.
- **4.5 Challenge mode mistakeBudget** — `mistakesThisLevel` state,
  reset by `nextLevel`. Run ends with outcome `'mistakes'` on the
  (budget+1)th mismatch in a level. Timer effect early-returns when
  `timeLimit === null` so Challenge runs without a clock.
- **4.6 Easy mode levelCap** — `nextLevel` checks `level >= levelCap`
  before advancing; if hit, ends the run with outcome `'completed'`
  and records `fewestMismatches` (cumulative `totalMismatches` across
  the run) as the tie-breaker. Phase 8 will surface the celebration UI.
- **GameScreen** takes a `hasTimer` prop; the Time text is replaced by
  an empty flex spacer in Challenge mode. Phase 3 will redesign the
  full header.
- **`gameOutcome` state** — `'timeout' | 'completed' | 'mistakes' |
  'gaveUp'`. Set by `endGame`; consumed by Phase 8's redesigned Game
  Over screen. Existing GameOverScreen ignores it for now.
- **`endGame` reordered above `nextLevel`** — `nextLevel` now calls
  `endGame('completed')` for the Easy levelCap path, and useCallback
  closes over its deps at render time, so endGame must be in scope.

### Phase 3 — Mode select screen ✅

`LandingScreen.js` deleted; `ModeSelectScreen.js` is the new home screen.
Liquid Glass becomes the dominant aesthetic, as planned. Default mode
flow: tap a mode tile → play that mode → game over → "Main Menu" →
returns to ModeSelectScreen with name + last selected mode preserved.

| Mode | Tint | Hint shown on tile |
|---|---|---|
| Easy | Green `#10b981` | 10 levels |
| Normal | Amber `#f59e0b` | Classic |
| Hard | Red `#ef4444` | −2s per miss |
| Challenge | Purple `#9333ea` | 1 mistake / level |

- **3.1 ModeSelectScreen layout** — Compact header (sun/moon emoji
  button | banner | gear emoji button), name input, 2×2 mode grid,
  full-width High Scores GlassButton, generous gap, then Remove Ads +
  Restore Purchases grouped together. Premium players see a "✨
  Premium — No Ads" badge in place of the ad-removal block.
- **3.2 Mode tile design** — `Pressable` wrapping `GlassCard` with
  three children: 4px colored top accent bar, mode label in the brand
  tint, white-alpha hint, white-alpha-dim per-mode stat. Glass surface
  stays neutral (no `tintColor` passed) — same-color text on
  same-color glass washes out. Pressed state: 3% scale-down + 8%
  opacity drop.
- **3.3 Per-mode stat formatting** —
  - Easy not-completed: `"Not yet completed"`
  - Easy completed: `"✓ Completed (N misses)"` (or `(1 miss)` singular)
  - Normal/Hard/Challenge with bestLevel=0: `"No runs yet"`
  - Else: `"Best: Level N"`
- **3.4 Brand colors centralized** — `tint` field on each `MODES`
  entry; `COLORS.bgNavy = '#0a1228'` in `constants.js` shared across
  ModeSelectScreen, GameScreen, GameOverScreen.
- **3.5 Banner shrunk** — 120 → 90px (75% of pre-Phase-3) so the 2×2
  grid fits without scrolling on iPhone Air. Survives intact at iPad
  scale.
- **Android safe-area fix** — `paddingTop: Platform.OS === 'android' ?
  StatusBar.currentHeight : 0` rolled into ModeSelectScreen,
  GameScreen, and GameOverScreen at the same time. Closes the
  long-standing top-row-under-status-bar bug.
- **Light mode caveat** — Phase 3 didn't redesign the light-mode
  palette. White-on-light text is unreadable in the new layout. Two
  options for resolution: drop the dark/light toggle entirely (every
  screen already assumes dark via Liquid Glass), or build a real
  light-mode pass. Decision deferred to Phase 6/8 or a dedicated
  pass — for now, recommend testing dark only.

### iPad portrait lock ✅

`UISupportedInterfaceOrientations~ipad` was retaining all four
orientations from an earlier prebuild (iPhone and Android were already
portrait-only). Trimmed iPad's array to portrait + portrait-upside-down
to match the rest. Same lock pattern Taplight ships with — Match
Maestro's UX is vertical-first.

### GitHub remote ✅

- Repo created at https://github.com/armyrunner9916/match-maestro (private)
- Local commits rebased on top of GitHub's auto-generated README commit
- macOS Keychain configured as credential helper — future pushes are silent
- Git identity now `Steven Reitz <steven.j.reitz@gmail.com>`

---

## Decisions made this session

1. **Path A over Path B** for the foundational refactor — full
   extraction up front rather than refactor-on-demand. Long-term
   stability for a solo dev outweighs short-term throwaway code.
2. **Plan-recommended execution order** over strict numerical order
   — saves real rework (Phase 4 logic before Phase 3 UI, Phase 2
   card backs before Phase 7 settings).
3. **Two-commit baseline split** — `chore: post-migration baseline`
   separated from `Phase 1: foundation refactor` instead of bundling
   the migration cruft into the refactor commit.
4. **`@callstack/liquid-glass`** installed (additional dep beyond what
   the plan listed) so `GlassCard` gets the real iOS 26 LiquidGlassView
   instead of the BlurView fallback.
5. **`react-native-purchases` to 9.15.2 not v10** — last patch in
   the v9 line; v10 was too fresh for a solo prod app.
6. **viewBox `0 0 100 140`** for card backs (not the plan's `100 100`)
   so SVG patterns are designed in card-aspect coordinates and circles
   stay circular without stretching.
7. **iterate Phase 2 designs in two passes** — first cut was too sparse
   ("PowerPoint clipart"), second pass added inner frames + density to
   read like real playing-card backs. Vine got a complete rewrite
   (procedurally-generated mirrored trees) after the first pass was
   asymmetric and underwhelming.
8. **Two stacked cartouches in Labyrinth** instead of one centered
   square — eliminates dead middle, gives the meander border two
   focal anchors.
9. **Light Glass touches in Phase 7** — Settings modal uses GlassPanel
   + GlassButton even though plan only mandated the picker change.
   Gives an earlier taste of the Liquid Glass aesthetic; Phase 3 still
   delivers the bigger reveal.
10. **iPad portrait lock applied tonight** — caught the Info.plist
    iPad-orientations drift before it could ship; same fix Taplight
    needed.
11. **Dual-write storage during Phase 4 transition** — the legacy
    top-10 array (`matchMaestro:highScores`) is preserved alongside
    the new per-mode shape (`matchMaestro:modeStats`) until Phase 3/8
    rebuilds HighScoresModal. Keeps Phase 4 pure-logic and avoids
    breaking the existing modal. Brief dual-write code to delete in
    Phase 3/8.
12. **`gameOutcome` state added in Phase 4** — even though the existing
    GameOverScreen ignores it. Outcome distinction is required by
    Phase 4 correctness (the `'completed'` path writes Easy mode's
    `completed: true` flag); Phase 8 will surface the celebration UI.
13. **Mistake budget interpreted as "free mistakes per level"** —
    `mistakeBudget: 1` means one free mistake; the second ends the
    run. Per-level counter resets on level advance. Spec wording
    ("end on the second mistake") confirmed this reading.
14. **Brand color set finalized in Phase 3** — Easy=green, Normal=amber,
    Hard=red, Challenge=purple. The Phase 3 first-draft proposal
    (Easy/green, Normal/blue, Hard/amber, Challenge/purple) was
    overruled in favor of brand consistency. These tints live as
    `tint` fields on each `MODES` entry; consumers (ModeSelectScreen
    today, in-game header tomorrow) read from there, never hardcode.
15. **Mode tile glass stays neutral** — the brand tint shows in the
    accent bar + label only, not as `tintColor` on the GlassCard.
    Same-color text on same-color glass washes out; this gives clean
    separation between the surface (neutral glass) and the brand
    signal (color).
16. **Daily Challenge cut from 2.0** — Phase 5 marked ❌. Will revisit
    post-launch if the feature still seems valuable. Mode tile slot
    stays at 2×2; if Daily Challenge ever ships, it gets its own
    surface (probably a top banner above the 2×2) rather than
    cramming into the grid.
17. **Light mode left unaddressed in Phase 3** — the new layout assumes
    a dark background everywhere (Liquid Glass renders against dark).
    The dark/light toggle still works but light mode is visually
    broken. Decision pending: drop the toggle entirely or build a
    real light-mode pass.
18. **Worktree branch caught us once** — Phase 3 first iteration was
    invisible to the user's Xcode workspace because Xcode opened the
    main checkout while all my work lived on the
    `claude/flamboyant-kare-99369b` worktree branch. Phase 4
    "smoke test" had silently passed the same way (normal-mode
    behavior is identical between old and new code). Lesson: any
    visible UI change MUST be merged to main before user testing,
    or the user must explicitly open the worktree's `.xcworkspace`.

---

## Next: Phase 6 + 8 — In-game UX + Game Over redesign

Two phases tackled together because they touch the same screens
(GameScreen + GameOverScreen) and would step on each other if split.

**Phase 6 — In-game UX:**
- 6.1 GlassPanel header showing level, mode (with tint), timer (or
  mistakes-remaining for Challenge mode), and current matched pairs.
- 6.2 Replace "Give Up" with a Pause overlay (resume / quit to mode
  select).
- 6.3 Level-up celebration animation between levels.
- 6.4 State split: `levelReached` + `pairsMatchedInLevel` instead
  of overloaded `completedLevel`. Closes Phase 9.1 deferred item.
- 6.5 Card flip animation (`rotateY` interpolated transform).

**Phase 8 — Game Over redesign:**
- 8.1 Per-mode-aware Game Over variants:
  - Timeout / Mistake-out → "Game Over! Reached Level X"
  - Easy completion → 🎉 celebration screen with mismatch count
  - Give-up → muted "See you next time"
- 8.2 "🎉 New high score!" callout when modeStats[mode].bestLevel
  was just exceeded.
- 8.3 Share button (Normal/Hard/Challenge only — Easy completion
  has its own share variant). Skip Daily Challenge — feature cut.
- 8.4 GlassPanel + GlassButton throughout, matching ModeSelectScreen.

After 6 + 8, only Phase 10 (QA + ship) remains. Light-mode decision
should land somewhere in here too.

---

## How to resume next session

1. Open this file (`MatchMaestro/BUILD_LOG.md`) to remember where
   we left off.
2. The canonical spec (every phase in detail) is at
   `~/Desktop/MATCHMAESTRO_2.0_PLAN.md`. Reference it for the
   substance of each phase; refer to this file for status.
3. `git log --oneline | head -10` to confirm the last commit matches
   what's recorded above.
4. `git status` should show working tree clean.
5. Build commands:
   - **iOS dev:** Xcode → Run on simulator
   - **Android dev:** `cd android && ./gradlew assembleDebug`
   - **Android release:** `cd android && ./gradlew assembleRelease`
   - **Android EAS prod:** `eas build --platform android --profile production`

---

## Known issues — fix in a later phase

- **Android top padding bug.** On Android phones and tablets, top-row
  content (Settings icon, dark/light toggle, Match Maestro logo) gets
  pushed up under the status bar. iOS handles this correctly via
  `SafeAreaView`. Confirmed in 1.x; will recur in any new screen until
  fixed. Canonical fix is Taplight's pattern:
  ```js
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  }
  ```
  Alternative: install `react-native-safe-area-context` and use *its*
  cross-platform `SafeAreaView`. **Best phase to address:** Phase 3
  (mode-select redesign) — that's when we rebuild the header row anyway.
  Apply to every screen's outer container at that time, not just mode
  select.

---

## Open notes / reminders for future you

- Existing high scores from 1.x **were preserved** by the storage
  migration — confirmed in this session's smoke test.
- The RevenueCat debug overlay (`[RevenueCat] 😿‼️ ... Configuration
  is not valid`) toast in dev builds is harmless — same as Taplight,
  doesn't appear in TestFlight/App Store. Confirmed across iPhone Air
  and iPad Pro 11-inch.
- `react-native-google-mobile-ads` is on `^15.4.0` (current). No
  upgrade needed.
- A bunch of pre-migration warnings are now suppressed via
  `inhibit_all_warnings!` in the Podfile — that's intentional, not
  a code smell.
- Phase 9.1 (`completedLevel` semantic) is the **only** Phase 9 item
  intentionally still open. It will be resolved when Phase 6.4
  splits state into `levelReached` + `pairsMatchedInLevel`.
- The `darkMode` prop is currently unused inside `SettingsModal.js`
  (the Glass aesthetic is dark regardless). Plan calls for moving the
  dark-mode toggle into Settings during the Phase 3 work — leave the
  prop in the signature until then to avoid a multi-file edit.
- `gh` CLI is **not** installed. Future repo creation would benefit
  from `brew install gh && gh auth login` (one-line repo setup
  thereafter). Not blocking.

---

## Today's session in numbers

- **9 commits** pushed to GitHub (one was the GitHub-generated initial)
- **Phases completed:** 1, 9, 2, 7 (4 of 8 plan phases done)
- **Files added:** ~14 (components, screens, game/, BUILD_LOG)
- **App.js:** 951 → 475 lines (50% reduction, plus Phase 9 additions)
- **CardBack.js:** ~70 lines of inline diamonds → ~490 lines of SVG
  with 6 distinct designs
- **Toolchain:** RevenueCat 7.13 → 9.15.2, Pods deployment target
  normalized, iPad portrait lock corrected
- **GitHub:** repo created, all history pushed, Keychain configured

Big day. Sleep well. 🎴
