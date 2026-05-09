# Match Maestro 2.0 — Build Log

Resume-from-cold guide. The canonical spec lives at
`~/Desktop/MATCHMAESTRO_2.0_PLAN.md`; this doc tracks where we are
in executing it.

---

## Where we are right now

**Branch:** `main`
**Last commit:** `6165c62 Phase 9: tech debt + accessibility + Game Over polish`
**Working tree:** clean
**App state:** builds and runs on iOS simulator. Visually identical to
1.x (no aesthetic work has started). Phase 9 fixes are live and verified.

### Commits so far (oldest → newest)

```
f963db9 Initial commit with RevenueCat        (pre-2.0)
7d19faa chore: post-migration baseline        (uncommitted migration cruft)
7aa6adf Phase 1: foundation refactor          (App.js → 11 files)
6165c62 Phase 9: tech debt + accessibility    (this session's main work)
```

---

## Execution order (agreed: plan-recommended)

We chose **Option 1** from the plan's "Suggested execution order"
section — phases done in the order that minimizes rework, not in
numerical order:

1. ✅ **Phase 1 + 9** — foundation + tech debt
2. ⏭️ **Phase 2** — SVG card backs ← **NEXT**
3. ⏭️ **Phase 7** — settings refresh (uses Phase 2 card backs)
4. ⏭️ **Phase 4** — modes config (pure logic)
5. ⏭️ **Phase 3** — mode select screen (consumes Phase 4)
6. ⏭️ **Phase 6 + 8** — in-game UX + game over redesign
7. ⏭️ **Phase 5** — Daily Challenge (last; deferrable to 2.1)
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
      CardBack.js               extracted from inline (Phase 2 will rewrite)
      GlassButton.js            from Taplight
      GlassCard.js              from Taplight
      GlassPanel.js             from Taplight
    screens/
      LandingScreen.js          (Phase 3 will become ModeSelectScreen)
      GameScreen.js
      GameOverScreen.js
      SettingsModal.js
      HighScoresModal.js
      PremiumModal.js
    game/
      constants.js              SYMBOLS, ad IDs, RC keys, storage keys
      storage.js                AsyncStorage wrapper + migration
  ```

### iOS toolchain fixes ✅ (bundled with Phase 1)

- Bumped `react-native-purchases` 7.13.0 → 9.15.2 (fixed Swift
  `'SubscriptionPeriod' is ambiguous` compile error)
- `pod update PurchasesHybridCommon` to resolve the version conflict
- `Podfile`: `inhibit_all_warnings!` + post_install hook normalizing
  every Pod's `IPHONEOS_DEPLOYMENT_TARGET` to 15.1

### Phase 9 — Tech debt ✅

| Item | Status | Notes |
|---|---|---|
| 9.1 `completedLevel` semantic | ⏸️ deferred | Plan says fix as part of Phase 6.4 state split |
| 9.2 AsyncStorage namespace migration | ✅ | `matchMaestro:*` namespace, idempotent migration, version-flagged `v2` |
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

Phase 8 will replace this entire screen with a `<GlassCard>`,
share button, new-high-score callout, and Phase 6.4's partial-progress
detail.

---

## Decisions made this session

1. **Path A over Path B** for the foundational refactor — full
   extraction up front rather than refactor-on-demand. Long-term
   stability for a solo dev outweighs short-term throwaway code.
2. **Plan-recommended execution order** over strict numerical order
   — saves real rework (Phase 4 logic before Phase 3 UI, Phase 2
   card backs before Phase 7 settings).
3. **Two clean commits** for Phase 1 (baseline + Phase 1 proper)
   instead of bundling the migration cruft into the refactor commit.
4. **`@callstack/liquid-glass`** installed (additional dep beyond what
   the plan listed) so `GlassCard` gets the real iOS 26 LiquidGlassView
   instead of the BlurView fallback.
5. **`react-native-purchases` to 9.15.2 not v10** — last patch in
   the v9 line; v10 was too fresh for a solo prod app.

---

## Next: Phase 2 — SVG Card Backs

The first **visible** aesthetic change. Replaces the existing
inline-but-extracted diamond-pattern `CardBack` with six distinct
SVG designs:

| Color | Design | Motif |
|---|---|---|
| Blue | Wave | Concentric arcs flowing left-to-right |
| Red | Chevron | Nested V-shapes pointing up |
| Green | Vine | Spiraling curls and tendrils |
| Yellow | Sunburst | Radial rays from a central point |
| Purple | Deco | Art Deco diamond/lozenge grid |
| Black | Labyrinth | Greek key meander pattern |

### Phase 2 work plan

1. Rewrite `components/CardBack.js` to use `react-native-svg` with
   `viewBox="0 0 100 100"` so it scales by `size` prop without
   per-level stroke-width math.
2. Six pattern functions, one COLORS lookup. Wrap export in
   `React.memo` (re-rendering 16+ SVGs per flip is expensive).
3. Update the `COLORS` recipe to the plan's spec (yellow uses
   deep amber `#fde047` accent, not lighter yellow).
4. Verify `cardBackColor` setting still drives the picker
   (currently dead code wired through Settings — Phase 7 will
   replace the swatch picker with SVG previews).

After Phase 2 lands and is verified visually on device, the
mode-select tiles and game-over redesign will all build on top of
those card-back assets.

---

## How to resume next session

1. Open this file (`MatchMaestro/BUILD_LOG.md`) to remember where
   we left off.
2. The canonical spec (every phase in detail) is at
   `~/Desktop/MATCHMAESTRO_2.0_PLAN.md`. Reference it for the
   substance of each phase; refer to this file for status.
3. `git log --oneline` to confirm the last commit matches what's
   recorded above.
4. Build commands:
   - **iOS dev:** Xcode → Run on simulator
   - **Android dev:** `cd android && ./gradlew assembleDebug`
   - **Android release:** `cd android && ./gradlew assembleRelease`
   - **Android EAS prod:** `eas build --platform android --profile production`

---

## Known issues — fix in a later phase

- **Android top padding bug.** On Android phones and tablets, top-row content
  (Settings icon, dark/light toggle, Match Maestro logo) gets pushed up under
  the status bar. iOS handles this correctly via `SafeAreaView`. Confirmed
  in 1.x; will recur in any new screen until fixed. Canonical fix is
  Taplight's pattern:
  ```js
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  }
  ```
  **Best phase to address:** Phase 3 (mode select screen redesign) — that's
  when we rebuild the header row anyway. Apply to every screen's outer
  container at that time, not just mode select.

## Open notes / reminders for future you

- Existing high scores from 1.x **were preserved** by the storage
  migration — confirmed in this session's smoke test.
- The RevenueCat debug overlay (`[RevenueCat] 😿‼️`) toast in dev
  builds is harmless — same as Taplight, doesn't appear in
  TestFlight/App Store.
- `react-native-google-mobile-ads` is on `^15.4.0` (current). No
  upgrade needed.
- A bunch of pre-migration warnings are now suppressed via
  `inhibit_all_warnings!` in the Podfile — that's intentional, not
  a code smell.
- Phase 9.1 (`completedLevel` semantic) is the **only** Phase 9 item
  intentionally still open. It will be resolved when Phase 6.4
  splits state into `levelReached` + `pairsMatchedInLevel`.
