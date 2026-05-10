import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Card from '../components/Card';
import { ADMOB_BANNER_ID } from '../game/constants';

// Phase 6 will add: pause overlay (replacing Give Up), level-up celebration,
// per-mode stats panel via <GlassPanel>, and the rotateY card flip animation.
function GameScreen({
  darkMode,
  level,
  timeLeft,
  hasTimer = true,
  cards,
  flippedCards,
  cardSize,
  cardBackColor,
  isPremium,
  onCardPress,
  onEndGame,
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#1a1a2e' : '#f5f5f5' }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../assets/banner.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />

            <View style={styles.timerRow}>
              <Text
                style={[styles.label, { color: darkMode ? '#ffffff' : '#000000', flex: 1 }]}
                accessibilityLabel={`Level ${level}`}
              >
                Level: {level}
              </Text>
              {hasTimer ? (
                <Text
                  style={[styles.timer, { color: darkMode ? '#ffffff' : '#000000', flex: 1, textAlign: 'center' }]}
                  accessibilityLabel={`Time remaining: ${timeLeft} seconds`}
                  accessibilityLiveRegion="polite"
                >
                  Time: {timeLeft}s
                </Text>
              ) : (
                // Phase 4: Challenge mode runs without a clock. Phase 3 will
                // replace this row with a per-mode header that surfaces
                // mistakes-remaining instead of seconds.
                <View style={{ flex: 1 }} />
              )}
              <TouchableOpacity
                style={styles.giveUpButton}
                onPress={onEndGame}
                accessibilityRole="button"
                accessibilityLabel="Give up and end this game"
              >
                <Text style={styles.giveUpButtonText}>Give Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>
            <View style={styles.gameGrid}>
              {cards.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  isFlipped={flippedCards.includes(card.id)}
                  cardSize={cardSize}
                  cardBackColor={cardBackColor}
                  onPress={() => onCardPress(card.id)}
                />
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
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 60,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  giveUpButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  giveUpButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  adContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default GameScreen;
