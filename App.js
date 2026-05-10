import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import mobileAds from 'react-native-google-mobile-ads';
import Purchases from 'react-native-purchases';

import { SYMBOLS, REVENUECAT_API_KEYS } from './game/constants';
import { MODES, DEFAULT_MODE } from './game/modes';
import {
  loadAllData,
  migrateLegacyStorage,
  saveSettings as persistSettings,
  saveHighScores as persistHighScores,
  savePremium as persistPremium,
  saveModeStats as persistModeStats,
} from './game/storage';

import ModeSelectScreen from './screens/ModeSelectScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import SettingsModal from './screens/SettingsModal';
import HighScoresModal from './screens/HighScoresModal';
import PremiumModal from './screens/PremiumModal';

// Layout constants used by cardSize. These mirror the actual style values in
// GameScreen.js so the math stays honest:
//   content padding (16) * 2 sides   = 32
//   gameGrid paddingHorizontal (10)*2 = 20
// Total fixed horizontal chrome in the gameplay area = 52.
// Each card's outer margin is 5*2 = 10, which gets subtracted per column.
const GRID_HORIZONTAL_CHROME = 52;
const CARD_HORIZONTAL_MARGIN = 10;

// --- Top-level side effects (run once at module load) ----------------------

// Initialize AdMob with non-personalized ads only.
mobileAds()
  .setRequestConfiguration({
    maxAdContentRating: 'G',
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  })
  .then(() => mobileAds().initialize())
  .then(() => {
    console.log('AdMob initialized with non-personalized ads only');
  })
  .catch((error) => {
    console.error('AdMob initialization error:', error);
  });

// Initialize RevenueCat once at module load.
const initializeRevenueCat = async () => {
  try {
    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEYS.ios,
      android: REVENUECAT_API_KEYS.android,
    });

    if (apiKey.includes('YOUR_')) {
      console.warn('RevenueCat API key not configured. Please update REVENUECAT_API_KEYS');
      return;
    }

    await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
  }
};

initializeRevenueCat();

// ---------------------------------------------------------------------------

export default function App() {
  // Game state
  const [gameState, setGameState] = useState('landing');
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [level, setLevel] = useState(1);
  const [pairs, setPairs] = useState(MODES[DEFAULT_MODE].pairsStart);
  const [timeLimit, setTimeLimit] = useState(MODES[DEFAULT_MODE].timerStart);
  const [timeLeft, setTimeLeft] = useState(MODES[DEFAULT_MODE].timerStart);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [completedLevel, setCompletedLevel] = useState(0);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);

  // Phase 4 mode-aware run state. Reset by startGame; consumed by endGame
  // and the modeStats persistence.
  //   totalMismatches    — cumulative mismatches across the whole run.
  //                        Tie-breaker for Easy mode "completed" badge.
  //   mistakesThisLevel  — Challenge mode per-level counter; resets in
  //                        nextLevel. Run ends when this exceeds the mode's
  //                        mistakeBudget.
  //   gameOutcome        — 'timeout' | 'completed' | 'mistakes' | 'gaveUp'.
  //                        Phase 8 will surface this in the Game Over UI.
  const [totalMismatches, setTotalMismatches] = useState(0);
  const [mistakesThisLevel, setMistakesThisLevel] = useState(0);
  const [gameOutcome, setGameOutcome] = useState(null);

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [cardBackColor, setCardBackColor] = useState('blue');
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Phase 4: per-mode stats (best level / completion). Lives alongside the
  // legacy `highScores` array; both are written on game end during the
  // transition. HighScoresModal still consumes the legacy array. Phase 3/8
  // will replace that consumer and we can drop the dual write.
  const [modeStats, setModeStats] = useState({
    easy: { completed: false, fewestMismatches: null },
    normal: { bestLevel: 0 },
    hard: { bestLevel: 0 },
    challenge: { bestLevel: 0 },
  });

  // Premium / RevenueCat state
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  // 9.3: Hook-based dimensions so card layout updates on rotation and iPad
  // split-view, instead of capturing the window size once at module load.
  const { width } = useWindowDimensions();

  // 9.5: Compute card size from real layout chrome (no magic 60). The gameplay
  // area's horizontal chrome is GRID_HORIZONTAL_CHROME; each column also eats
  // CARD_HORIZONTAL_MARGIN for the card's outer margin.
  const cardSize = useMemo(() => {
    if (!width || width <= 0) return 80;

    const cardCount = cards.length || 4;
    let columns = 4;
    if (cardCount > 16) columns = 5;
    if (cardCount > 24) columns = 6;
    if (cardCount > 30) columns = 7;

    const availableWidth = width - GRID_HORIZONTAL_CHROME;
    const size = Math.floor(availableWidth / columns) - CARD_HORIZONTAL_MARGIN;
    const isTablet = width >= 768;

    if (isTablet) {
      return Math.max(60, Math.min(120, size));
    }
    return Math.max(38, Math.min(80, size));
  }, [cards.length, width]);

  // Check premium status from RevenueCat and persist locally.
  const checkPremiumStatus = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasPremium = customerInfo.entitlements.active['ad_free'] !== undefined;
      setIsPremium(hasPremium);
      await persistPremium(hasPremium);
      return hasPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }, []);

  // Purchase the lifetime "ad_free" entitlement.
  const handlePurchaseAdsRemoval = useCallback(async () => {
    try {
      setIsLoadingPremium(true);
      const offerings = await Purchases.getOfferings();

      // Find the lifetime package across all offerings.
      let package_ = null;
      for (const offering of Object.values(offerings.all)) {
        const found = offering.availablePackages.find(
          p => p.packageType === 'LIFETIME' || p.identifier === '$rc_lifetime'
        );
        if (found) { package_ = found; break; }
      }

      if (package_ !== null) {
        try {
          const { customerInfo } = await Purchases.purchasePackage(package_);
          if (customerInfo.entitlements.active['ad_free'] !== undefined) {
            setIsPremium(true);
            await persistPremium(true);
            Alert.alert('Success!', 'Ads removed. Enjoy your ad-free experience!');
            setShowPremiumModal(false);
            triggerHaptic('success');
          }
        } catch (error) {
          if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            console.log('Purchase cancelled');
          } else {
            Alert.alert('Purchase Error', error.message);
          }
        }
      } else {
        Alert.alert('Error', 'No packages available. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
      Alert.alert('Error', 'Could not load purchase options. Please try again.');
    } finally {
      setIsLoadingPremium(false);
    }
  }, [triggerHaptic]); // 9.6: triggerHaptic was missing from deps

  // Restore previous purchases.
  const handleRestorePurchases = useCallback(async () => {
    try {
      setIsLoadingPremium(true);
      const customerInfo = await Purchases.restorePurchases();

      const hasPremium = customerInfo.entitlements.active['ad_free'] !== undefined;
      setIsPremium(hasPremium);
      await persistPremium(hasPremium);

      if (hasPremium) {
        Alert.alert('Success!', 'Premium purchase restored!');
        setShowPremiumModal(false);
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setIsLoadingPremium(false);
    }
  }, []);

  // Load high scores, settings, and premium status on mount.
  useEffect(() => {
    const loadGameData = async () => {
      // 9.2: Migrate any 1.x AsyncStorage keys into the matchMaestro:*
      // namespace before reading. Idempotent — no-ops on subsequent launches.
      await migrateLegacyStorage();

      const {
        highScores: savedScores,
        settings: savedSettings,
        isPremium: savedPremium,
        modeStats: savedModeStats,
      } = await loadAllData();

      if (savedScores) setHighScores(savedScores);
      if (savedModeStats) setModeStats(savedModeStats);

      if (savedSettings) {
        setDarkMode(savedSettings.darkMode ?? true);
        setCardBackColor(savedSettings.cardBackColor || 'blue');
        setHapticEnabled(savedSettings.hapticEnabled ?? true);
        if (savedSettings.playerName) setPlayerName(savedSettings.playerName);
      }

      if (savedPremium !== null) setIsPremium(savedPremium);

      await checkPremiumStatus();
    };

    loadGameData();
  }, []);

  // Persist settings whenever they change.
  useEffect(() => {
    persistSettings({ darkMode, cardBackColor, hapticEnabled, playerName });
  }, [darkMode, cardBackColor, hapticEnabled, playerName]);

  // Haptic feedback helper.
  const triggerHaptic = useCallback((type = 'impact') => {
    if (hapticEnabled) {
      switch (type) {
        case 'impact':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  }, [hapticEnabled]);

  // Timer effect. 9.8: paused while a match is being evaluated so a player
  // who taps the last pair just before time-out can't be robbed of credit by
  // the 600ms resolution delay racing the 1s timer tick. Phase 4: a `null`
  // timeLimit (Challenge mode) suppresses the clock entirely.
  useEffect(() => {
    if (timeLimit === null) return;

    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isProcessingMatch) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !isProcessingMatch) {
      endGame('timeout');
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, gameState, isProcessingMatch, timeLimit]);

  // Build a fresh shuffled deck of `pairCount` pairs.
  const initializeCards = (pairCount = pairs) => {
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const selectedSymbols = shuffledSymbols.slice(0, pairCount);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    return shuffled.map((symbol, index) => ({
      id: index,
      symbol,
      isMatched: false,
    }));
  };

  // Start a new game from the landing screen. Phase 4: caller can specify
  // a mode; defaults to whatever mode is currently selected (Phase 3 will
  // wire mode selection into the UI). Pulls level-1 settings from MODES.
  const startGame = (modeId = mode) => {
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name!');
      return;
    }
    const cfg = MODES[modeId];
    setMode(modeId);
    setGameState('playing');
    setLevel(1);
    setPairs(cfg.pairsStart);
    setTimeLimit(cfg.timerStart);
    setTimeLeft(cfg.timerStart);
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards(initializeCards(cfg.pairsStart));
    setCompletedLevel(0);
    setIsProcessingMatch(false);
    setTotalMismatches(0);
    setMistakesThisLevel(0);
    setGameOutcome(null);
    triggerHaptic('impact');
  };

  // End the current game and persist score if it qualifies. Phase 4: takes
  // an outcome ('timeout' | 'completed' | 'mistakes' | 'gaveUp') and writes
  // per-mode stats alongside the legacy top-10 array.
  //
  // Defined before nextLevel because nextLevel calls endGame for the Easy
  // mode levelCap completion path, and useCallback closes over its deps at
  // render time — referencing endGame from nextLevel's deps requires endGame
  // to be in scope already.
  const endGame = useCallback((outcome = 'timeout') => {
    setGameState('gameOver');
    setGameOutcome(outcome);
    triggerHaptic('error');

    // Legacy top-10 array — kept for HighScoresModal until Phase 3/8
    // replaces that consumer. Same logic as before.
    if (completedLevel > 0) {
      const newScore = {
        name: playerName,
        level: completedLevel,
        date: new Date().toISOString(),
      };

      const updatedScores = [newScore, ...highScores]
        .sort((a, b) => b.level - a.level)
        .slice(0, 10);
      setHighScores(updatedScores);
      persistHighScores(updatedScores);
    }

    // Per-mode stats. Easy tracks completion + tie-breaker; the others
    // track best level reached. Only update when there's something to
    // record (completedLevel > 0 OR an Easy completion).
    const isEasyCompletion = mode === 'easy' && outcome === 'completed';
    if (completedLevel > 0 || isEasyCompletion) {
      const next = { ...modeStats };

      if (mode === 'easy') {
        const prev = next.easy || { completed: false, fewestMismatches: null };
        const completed = prev.completed || isEasyCompletion;
        let fewestMismatches = prev.fewestMismatches;
        if (isEasyCompletion) {
          fewestMismatches =
            fewestMismatches === null
              ? totalMismatches
              : Math.min(fewestMismatches, totalMismatches);
        }
        next.easy = { completed, fewestMismatches };
      } else {
        const prevBest = next[mode]?.bestLevel ?? 0;
        next[mode] = { bestLevel: Math.max(prevBest, completedLevel) };
      }

      setModeStats(next);
      persistModeStats(next);
    }
  }, [mode, completedLevel, playerName, highScores, modeStats, totalMismatches, triggerHaptic]);

  // Advance to the next level. Phase 6.4 / 9.1 will fix the `completedLevel`
  // semantic — it currently records the level entered, not the level finished.
  // Declared before handleCardPress so the latter can list it in its deps.
  // Phase 4: pulls timer/pair deltas from MODES[mode], honors levelCap by
  // ending the run with outcome 'completed' once the cap is cleared.
  const nextLevel = useCallback(() => {
    const cfg = MODES[mode];

    // Easy mode: completing the cap level ends the run with a "completed"
    // outcome instead of advancing. Phase 8 will surface a celebration UI.
    if (cfg.levelCap !== null && level >= cfg.levelCap) {
      endGame('completed');
      return;
    }

    const newLevel = level + 1;
    const newPairs = Math.min(pairs + 1, SYMBOLS.length);
    const newTimeLimit =
      cfg.timerStart === null ? null : timeLimit + cfg.timerDelta;

    setLevel(newLevel);
    setPairs(newPairs);
    setTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards(initializeCards(newPairs));
    setCompletedLevel(newLevel);
    setMistakesThisLevel(0); // Challenge mode: per-level counter resets
    triggerHaptic('success');
  }, [mode, level, pairs, timeLimit, triggerHaptic, endGame]);

  // Handle a card tap during gameplay.
  const handleCardPress = useCallback((cardId) => {
    if (gameState !== 'playing' || isProcessingMatch) return;

    const clickedCard = cards.find(card => card.id === cardId);
    if (clickedCard.isMatched) return;

    if (flippedCards.includes(cardId)) {
      setFlippedCards(flippedCards.filter(id => id !== cardId));
      triggerHaptic('impact');
      return;
    }

    if (flippedCards.length === 2) return;

    triggerHaptic('impact');
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsProcessingMatch(true);

      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);

      setTimeout(() => {
        if (card1.symbol === card2.symbol) {
          const updatedCards = cards.map(card => ({
            ...card,
            isMatched:
              card.id === newFlippedCards[0] || card.id === newFlippedCards[1]
                ? true
                : card.isMatched,
          }));
          const newMatchedPairs = [
            ...matchedPairs,
            { id1: newFlippedCards[0], id2: newFlippedCards[1] },
          ];
          setCards(updatedCards);
          setMatchedPairs(newMatchedPairs);
          setFlippedCards([]);
          triggerHaptic('success');

          if (newMatchedPairs.length === pairs) {
            nextLevel();
          }
        } else {
          // Mismatch. Phase 4 layers three mode-specific effects on top of
          // the existing flip-back: cumulative mismatch tally, Hard mode
          // timer penalty, Challenge mode mistake-budget exhaustion.
          const cfg = MODES[mode];
          setFlippedCards([]);
          setTotalMismatches(prev => prev + 1);
          triggerHaptic('error');

          if (cfg.mismatchPenalty > 0 && timeLimit !== null) {
            setTimeLeft(prev => Math.max(0, prev - cfg.mismatchPenalty));
          }

          if (cfg.mistakeBudget !== null) {
            // mistakeBudget can be a number OR a function of `pairs` so it
            // can scale with level. Challenge mode uses the function form.
            const budget = typeof cfg.mistakeBudget === 'function'
              ? cfg.mistakeBudget(pairs)
              : cfg.mistakeBudget;
            const newMistakes = mistakesThisLevel + 1;
            setMistakesThisLevel(newMistakes);
            // Budget = N free mistakes per level; the (N+1)th ends the run.
            if (newMistakes > budget) {
              endGame('mistakes');
            }
          }
        }
        setIsProcessingMatch(false);
      }, 600);
    }
  }, [
    gameState, cards, flippedCards, matchedPairs, pairs,
    isProcessingMatch, triggerHaptic,
    mode, timeLimit, mistakesThisLevel, endGame,
    nextLevel, // 9.6: nextLevel was missing from deps — caused stale level-up
  ]);

  // --- Render ---------------------------------------------------------------

  // Modals always render at root level (RN Modals portal to root anyway). They
  // remain hidden via `visible={false}` outside the landing/gameOver flow.
  const modals = (
    <>
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        cardBackColor={cardBackColor}
        setCardBackColor={setCardBackColor}
        hapticEnabled={hapticEnabled}
        setHapticEnabled={setHapticEnabled}
      />
      <HighScoresModal
        visible={showHighScores}
        onClose={() => setShowHighScores(false)}
        darkMode={darkMode}
        highScores={highScores}
      />
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        darkMode={darkMode}
        isLoadingPremium={isLoadingPremium}
        onPurchase={handlePurchaseAdsRemoval}
        onRestore={handleRestorePurchases}
      />
    </>
  );

  if (gameState === 'landing') {
    return (
      <>
        <ModeSelectScreen
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          playerName={playerName}
          setPlayerName={setPlayerName}
          modeStats={modeStats}
          onSelectMode={startGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHighScores={() => setShowHighScores(true)}
          isPremium={isPremium}
          onOpenPremium={() => setShowPremiumModal(true)}
          onRestorePurchases={handleRestorePurchases}
          isLoadingPremium={isLoadingPremium}
        />
        {modals}
      </>
    );
  }

  if (gameState === 'playing') {
    // Compute remaining mistakes for modes that have a budget. null in
    // every other mode → GameScreen hides the indicator.
    const cfg = MODES[mode];
    let mistakesLeft = null;
    if (cfg.mistakeBudget !== null) {
      const budget = typeof cfg.mistakeBudget === 'function'
        ? cfg.mistakeBudget(pairs)
        : cfg.mistakeBudget;
      mistakesLeft = Math.max(0, budget - mistakesThisLevel);
    }
    return (
      <>
        <GameScreen
          darkMode={darkMode}
          level={level}
          timeLeft={timeLeft}
          hasTimer={timeLimit !== null}
          mistakesLeft={mistakesLeft}
          cards={cards}
          flippedCards={flippedCards}
          cardSize={cardSize}
          cardBackColor={cardBackColor}
          isPremium={isPremium}
          onCardPress={handleCardPress}
          onEndGame={() => endGame('gaveUp')}
        />
        {modals}
      </>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <>
        <GameOverScreen
          darkMode={darkMode}
          completedLevel={completedLevel}
          onNewGame={startGame}
          onMainMenu={() => setGameState('landing')}
          onViewHighScores={() => {
            setShowHighScores(true);
            setGameState('landing');
          }}
        />
        {modals}
      </>
    );
  }

  return null;
}
