import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import mobileAds, { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Purchases from 'react-native-purchases';

const { width } = Dimensions.get('window');

// AdMob IDs from your screenshots
const ADMOB_BANNER_ID = Platform.select({
  ios: 'ca-app-pub-7368779159802085/5597631324',
  android: 'ca-app-pub-7368779159802085/1254243392',
});

// RevenueCat Setup - Get these from your RevenueCat dashboard
const REVENUECAT_API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY_HERE', // Replace with your iOS API key from RevenueCat
  android: 'goog_YOUR_ANDROID_API_KEY_HERE', // Replace with your Android API key from RevenueCat
};

// Initialize AdMob with non-personalized ads only
mobileAds()
  .setRequestConfiguration({
    maxAdContentRating: 'G',
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  })
  .then(() => {
    return mobileAds().initialize();
  })
  .then(() => {
    console.log('AdMob initialized with non-personalized ads only');
  })
  .catch((error) => {
    console.error('AdMob initialization error:', error);
  });

// Initialize RevenueCat
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

// Call initialization on app start
initializeRevenueCat();

export default function App() {
  // Game states
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
  
  // Settings states
  const [darkMode, setDarkMode] = useState(true);
  const [cardBackColor, setCardBackColor] = useState('blue');
  const [showSettings, setShowSettings] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  
  // Premium/RevenueCat states
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  // Card symbols
  const symbols = ['⭐', '🎈', '🎨', '🎯', '🎪', '🎭', '🎸', '🎺', '🏀', '⚽', '🌈', '🌺', '🍕', '🍔', '🚀', '🛸'];

  // Calculate card size based on number of cards
  const cardSize = useMemo(() => {
    if (!width || width <= 0) return 80;
    
    const padding = 60;
    const cardCount = cards.length || 4;
    let columns = 4;
    
    if (cardCount > 16) columns = 5;
    if (cardCount > 20) columns = 6;
    
    const size = Math.floor((width - padding) / columns) - 10;
    
    const isTablet = width >= 768;
    
    if (isTablet) {
      return Math.max(80, Math.min(120, size));
    } else {
      return Math.max(50, Math.min(80, size));
    }
  }, [cards.length, width]);

  // Check premium status
  const checkPremiumStatus = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // 'ad_free' is the entitlement ID you'll create in RevenueCat
      const hasPremium = customerInfo.entitlements.active['ad_free'] !== undefined;
      setIsPremium(hasPremium);
      
      // Save premium status to local storage
      await AsyncStorage.setItem('matchMaestroIsPremium', JSON.stringify(hasPremium));
      
      return hasPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }, []);

  // Handle purchase
  const handlePurchaseAdsRemoval = useCallback(async () => {
    try {
      setIsLoadingPremium(true);
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        const package_ = offerings.current.availablePackages[0];
        
        try {
          const { customerInfo } = await Purchases.purchasePackage(package_);
          
          // Check if premium entitlement is now active
          if (customerInfo.entitlements.active['ad_free'] !== undefined) {
            setIsPremium(true);
            await AsyncStorage.setItem('matchMaestroIsPremium', JSON.stringify(true));
            Alert.alert('Success!', 'Ads removed. Enjoy your ad-free experience!');
            setShowPremiumModal(false);
            triggerHaptic('success');
          }
        } catch (error) {
          if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            // User cancelled
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

  // Restore purchases
  const handleRestorePurchases = useCallback(async () => {
    try {
      setIsLoadingPremium(true);
      const customerInfo = await Purchases.restorePurchases();
      
      const hasPremium = customerInfo.entitlements.active['ad_free'] !== undefined;
      setIsPremium(hasPremium);
      await AsyncStorage.setItem('matchMaestroIsPremium', JSON.stringify(hasPremium));
      
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

  // Load high scores and settings on mount
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const [savedScores, savedSettings, savedPremium] = await Promise.all([
        AsyncStorage.getItem('memoryMatchHighScores'),
        AsyncStorage.getItem('matchMaestroSettings'),
        AsyncStorage.getItem('matchMaestroIsPremium'),
      ]);
      
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode ?? true);
        setCardBackColor(settings.cardBackColor || 'blue');
        setHapticEnabled(settings.hapticEnabled ?? true);
        if (settings.playerName) {
          setPlayerName(settings.playerName);
        }
      }
      
      if (savedPremium) {
        setIsPremium(JSON.parse(savedPremium));
      }
      
      // Check RevenueCat for current premium status
      await checkPremiumStatus();
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        darkMode,
        cardBackColor,
        hapticEnabled,
        playerName,
      };
      await AsyncStorage.setItem('matchMaestroSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [darkMode, cardBackColor, hapticEnabled]);

  // Haptic feedback helper
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

  // Timer effect - Continuous countdown
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

  // Initialize cards
  const initializeCards = (pairCount = pairs) => {
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);
    const selectedSymbols = shuffledSymbols.slice(0, pairCount);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    return shuffled.map((symbol, index) => ({
      id: index,
      symbol,
      isMatched: false
    }));
  };

  // Start game
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

  // Handle card press - Fixed logic to prevent timer issues
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
            isMatched: card.id === newFlippedCards[0] || card.id === newFlippedCards[1] ? true : card.isMatched
          }));
          setCards(updatedCards);
          setMatchedPairs([...matchedPairs, { id1: newFlippedCards[0], id2: newFlippedCards[1] }]);
          setFlippedCards([]);
          triggerHaptic('success');
          
          // Check if level complete
          if (matchedPairs.length + 1 === pairs) {
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

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newPairs = Math.min(pairs + 1, 8);
    const newTimeLimit = Math.max(timeLimit - 2, 5);
    
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

  // End game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    triggerHaptic('error');
    
    if (completedLevel > 0) {
      const newScore = {
        name: playerName,
        level: completedLevel,
        date: new Date().toISOString(),
      };
      
      const updatedScores = [newScore, ...highScores].sort((a, b) => b.level - a.level).slice(0, 10);
      setHighScores(updatedScores);
      
      AsyncStorage.setItem('memoryMatchHighScores', JSON.stringify(updatedScores));
    }
  }, [completedLevel, playerName, highScores, triggerHaptic]);

  // Landing screen
  if (gameState === 'landing') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
            <Image 
              source={require('./assets/banner.png')} 
              style={{ width: '100%', height: 120, marginBottom: 20, borderRadius: 8 }}
              resizeMode="contain"
            />
            
            <Text style={[styles.title, { color: darkMode ? '#ffffff' : '#000000' }]}>Welcome to Match Maestro</Text>
            
            <TextInput
              style={[styles.input, { 
                color: darkMode ? '#ffffff' : '#000000',
                borderColor: darkMode ? '#4b5563' : '#cccccc'
              }]}
              placeholder="Enter your name"
              placeholderTextColor={darkMode ? '#999999' : '#666666'}
              value={playerName}
              onChangeText={setPlayerName}
            />
            
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setDarkMode(!darkMode)}
              >
                <Text>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowSettings(!showSettings)}
              >
                <Text>⚙️ Settings</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#9333ea' }]}
              onPress={() => setShowHighScores(true)}
            >
              <Text style={styles.buttonText}>High Scores</Text>
            </TouchableOpacity>

            {/* Premium Section */}
            {!isPremium && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#d4af37', marginTop: 10 }]}
                onPress={() => setShowPremiumModal(true)}
              >
                <Text style={[styles.buttonText, { color: '#000' }]}>💎 Remove Ads</Text>
              </TouchableOpacity>
            )}
            
            {isPremium && (
              <View style={{
                backgroundColor: '#d4af37',
                padding: 12,
                borderRadius: 8,
                marginTop: 10,
                alignItems: 'center'
              }}>
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>✨ Premium - No Ads</Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Settings Modal */}
        <Modal visible={showSettings} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={[styles.card, { margin: 20, backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
              <Text style={[styles.label, { fontSize: 20, fontWeight: 'bold', color: darkMode ? '#ffffff' : '#000000' }]}>Settings</Text>
              
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.label, { fontSize: 18, marginBottom: 10, color: darkMode ? '#ffffff' : '#000000' }]}>Card Back Color</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['black', 'red', 'green', 'blue', 'yellow', 'purple'].map(color => (
                    <TouchableOpacity
                      key={color}
                      style={{
                        backgroundColor: color === 'black' ? '#000' :
                                       color === 'red' ? '#dc2626' :
                                       color === 'green' ? '#16a34a' :
                                       color === 'blue' ? '#2563eb' :
                                       color === 'yellow' ? '#eab308' : '#9333ea',
                        width: 80,
                        height: 40,
                        margin: 5,
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: cardBackColor === color ? 3 : 0,
                        borderColor: '#3b82f6',
                      }}
                      onPress={() => setCardBackColor(color)}
                    >
                      <Text style={{ color: color === 'yellow' ? '#000' : '#fff' }}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { 
                  backgroundColor: hapticEnabled ? '#10b981' : '#6b7280',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  marginTop: 20,
                  marginHorizontal: 0,
                }]}
                onPress={() => setHapticEnabled(!hapticEnabled)}
              >
                <Text style={{ color: '#fff' }}>📳 Haptic Feedback</Text>
                <Text style={{ color: '#fff' }}>{hapticEnabled ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* High Scores Modal */}
        <Modal visible={showHighScores} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={[styles.card, { margin: 20, maxHeight: '80%', backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
              <Text style={[styles.label, { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: darkMode ? '#ffffff' : '#000000' }]}>
                Top 10 High Scores
              </Text>
              <ScrollView>
                {highScores.length === 0 ? (
                  <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666' }]}>No scores yet. Be the first!</Text>
                ) : (
                  highScores.map((score, i) => (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkMode ? '#4b5563' : '#e5e7eb' }}>
                      <Text style={[styles.label, { flex: 1, color: darkMode ? '#ffffff' : '#000000' }]}>{i + 1}</Text>
                      <Text style={[styles.label, { flex: 3, color: darkMode ? '#ffffff' : '#000000' }]}>{score.name}</Text>
                      <Text style={[styles.label, { flex: 1, color: darkMode ? '#ffffff' : '#000000' }]}>{score.level}</Text>
                      <Text style={[styles.label, { flex: 2, color: darkMode ? '#ffffff' : '#000000' }]}>{new Date(score.date).toLocaleDateString()}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setShowHighScores(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Premium Modal */}
        <Modal visible={showPremiumModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <View style={[styles.card, { margin: 20, backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
              <Text style={[styles.title, { color: '#d4af37', marginBottom: 10 }]}>💎 Go Premium!</Text>
              <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666', marginBottom: 20, textAlign: 'center' }]}>
                Remove all ads and enjoy Match Maestro uninterrupted
              </Text>
              
              <View style={{ backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                <Text style={[styles.label, { color: darkMode ? '#ffffff' : '#000000', fontWeight: 'bold', marginBottom: 8 }]}>✨ Premium Benefits:</Text>
                <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666', marginBottom: 5 }]}>🎮 Ad-free gameplay</Text>
                <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666', marginBottom: 5 }]}>⚡ Unlock full experience</Text>
                <Text style={[styles.label, { color: darkMode ? '#cccccc' : '#666666' }]}>🎯 Support the developer</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#d4af37', marginBottom: 10 }]}
                onPress={handlePurchaseAdsRemoval}
                disabled={isLoadingPremium}
              >
                {isLoadingPremium ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={[styles.buttonText, { color: '#000', fontWeight: 'bold' }]}>Purchase - $0.99</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { marginBottom: 10 }]}
                onPress={handleRestorePurchases}
                disabled={isLoadingPremium}
              >
                <Text>🔄 Restore Purchases</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowPremiumModal(false)}
                disabled={isLoadingPremium}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Game screen
  if (gameState === 'playing') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image 
                source={require('./assets/banner.png')} 
                style={styles.bannerImage}
              />
              
              <View style={styles.timerRow}>
                <Text style={[styles.label, { color: darkMode ? '#ffffff' : '#000000' }]}>Level: {level}</Text>
                <Text style={[styles.timer, { color: darkMode ? '#ffffff' : '#000000' }]}>Time: {timeLeft}s</Text>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: '#ef4444', margin: 0 }]}
                  onPress={endGame}
                >
                  <Text style={{ color: '#ffffff' }}>Give Up</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView>
              <View style={styles.gameGrid}>
                {cards.map(card => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.gameCard,
                      flippedCards.includes(card.id) || card.isMatched
                        ? (card.isMatched ? styles.cardMatched : styles.cardFront)
                        : styles.cardBack
                    ]}
                    onPress={() => handleCardPress(card.id)}
                    activeOpacity={0.8}
                  >
                    {(flippedCards.includes(card.id) || card.isMatched) ? (
                      <Text style={styles.cardText}>{card.symbol}</Text>
                    ) : (
                      <CardBack size={cardSize} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* AdMob Banner - Only show if not premium */}
          {!isPremium && (
            <View style={styles.adContainer}>
              <BannerAd
                unitId={ADMOB_BANNER_ID}
                size={BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(error) => {
                  console.log('Ad failed to load:', error);
                }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Game over screen
  if (gameState === 'gameOver') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <View style={[styles.card, { backgroundColor: darkMode ? '#16213e' : '#ffffff' }]}>
            <Text style={[styles.title, { marginBottom: 20, color: darkMode ? '#ffffff' : '#000000' }]}>Game Over!</Text>
            <Text style={[styles.label, { fontSize: 20, textAlign: 'center', marginBottom: 30, color: darkMode ? '#ffffff' : '#000000' }]}>
              Level Reached: {completedLevel}
            </Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => setGameState('landing')}
            >
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#9333ea' }]}
              onPress={() => {
                setShowHighScores(true);
                setGameState('landing');
              }}
            >
              <Text style={styles.buttonText}>View High Scores</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

// Card back component
function CardBack({ size }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: '#2563eb',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1e40af',
      }}
    >
      <Text style={{ fontSize: size * 0.4, color: '#60a5fa' }}>?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 80,
    marginBottom: 10,
    borderRadius: 8,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  gameCard: {
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: '#2563eb',
  },
  cardFront: {
    backgroundColor: '#f3f4f6',
  },
  cardMatched: {
    backgroundColor: '#10b981',
  },
  cardText: {
    fontSize: 24,
  },
  adContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
