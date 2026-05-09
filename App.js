import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dimensions, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import mobileAds from 'react-native-google-mobile-ads';
import Purchases from 'react-native-purchases';

import { SYMBOLS, REVENUECAT_API_KEYS } from './game/constants';
import {
  loadAllData,
  saveSettings as persistSettings,
  saveHighScores as persistHighScores,
  savePremium as persistPremium,
} from './game/storage';

import LandingScreen from './screens/LandingScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import SettingsModal from './screens/SettingsModal';
import HighScoresModal from './screens/HighScoresModal';
import PremiumModal from './screens/PremiumModal';

const { width } = Dimensions.get('window');

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
  const [level, setLevel] = useState(1);
  const [pairs, setPairs] = useState(2);
  const [timeLimit, setTimeLimit] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [completedLevel, setCompletedLevel] = useState(0);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [cardBackColor, setCardBackColor] = useState('blue');
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Premium / RevenueCat state
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  // Calculate card size based on number of cards.
  // Phase 9.3 will replace `width` with `useWindowDimensions()` for rotation/
  // split-view support. Phase 9.5 will fix the padding math (currently uses
  // padding=60 but actual layout pads content:16 + grid:10 + card margin:5).
  const cardSize = useMemo(() => {
    if (!width || width <= 0) return 80;

    const padding = 60;
    const cardCount = cards.length || 4;
    let columns = 4;

    if (cardCount > 16) columns = 5;
    if (cardCount > 24) columns = 6;
    if (cardCount > 30) columns = 7;

    const size = Math.floor((width - padding) / columns) - 10;
    const isTablet = width >= 768;

    if (isTablet) {
      return Math.max(60, Math.min(120, size));
    } else {
      return Math.max(38, Math.min(80, size));
    }
  }, [cards.length]);

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
  }, []);

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
      const { highScores: savedScores, settings: savedSettings, isPremium: savedPremium } =
        await loadAllData();

      if (savedScores) setHighScores(savedScores);

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

  // Timer effect. Phase 9.8 will pause this during the 600ms match-resolution
  // window so a player who matches the last pair right at time-out gets credit.
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, gameState]);

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

  // Start a new game from the landing screen.
  const startGame = () => {
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name!');
      return;
    }
    setGameState('playing');
    setLevel(1);
    setPairs(2);
    setTimeLimit(15);
    setTimeLeft(15);
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards(initializeCards(2));
    setCompletedLevel(0);
    setIsProcessingMatch(false);
    triggerHaptic('impact');
  };

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
          setFlippedCards([]);
          triggerHaptic('error');
        }
        setIsProcessingMatch(false);
      }, 600);
    }
  }, [gameState, cards, flippedCards, matchedPairs, pairs, isProcessingMatch, triggerHaptic]);

  // Advance to the next level. Phase 6.4 / 9.1 will fix the `completedLevel`
  // semantic — it currently records the level entered, not the level finished.
  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newPairs = Math.min(pairs + 1, SYMBOLS.length);
    const newTimeLimit = timeLimit + 3;

    setLevel(newLevel);
    setPairs(newPairs);
    setTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards(initializeCards(newPairs));
    setCompletedLevel(newLevel);
    triggerHaptic('success');
  }, [level, pairs, timeLimit, triggerHaptic]);

  // End the current game and persist score if it qualifies.
  const endGame = useCallback(() => {
    setGameState('gameOver');
    triggerHaptic('error');

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
  }, [completedLevel, playerName, highScores, triggerHaptic]);

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
        <LandingScreen
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          playerName={playerName}
          setPlayerName={setPlayerName}
          onStartGame={startGame}
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
    return (
      <>
        <GameScreen
          darkMode={darkMode}
          level={level}
          timeLeft={timeLeft}
          cards={cards}
          flippedCards={flippedCards}
          cardSize={cardSize}
          cardBackColor={cardBackColor}
          isPremium={isPremium}
          onCardPress={handleCardPress}
          onEndGame={endGame}
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
          onNewGame={() => setGameState('landing')}
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
