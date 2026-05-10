import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import CardBack from './CardBack';

// Phase 6.5: rotateY flip animation. Standard recipe — two Animated.Views
// stacked with `backfaceVisibility: hidden`, one shared Animated.Value
// drives both. Back rotates 0deg → 180deg, front rotates 180deg → 360deg,
// so at any moment exactly one face is camera-facing.
//
// 200ms with Easing.out(cubic) — snappy but readable as a flip.
//
// Initial value matches the initial showFace so a card that mounts already
// face-up (e.g., a previously-matched card surviving a re-render) doesn't
// animate from the back.
const FLIP_DURATION = 200;

function Card({ card, isFlipped, cardSize, cardBackColor, onPress }) {
  const showFace = isFlipped || card.isMatched;
  const flip = useRef(new Animated.Value(showFace ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(flip, {
      toValue: showFace ? 1 : 0,
      duration: FLIP_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showFace, flip]);

  const backRotation = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const frontRotation = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const a11yLabel = card.isMatched
    ? 'Matched pair'
    : isFlipped
      ? `Card showing ${card.symbol}`
      : 'Face-down card, double-tap to flip';

  return (
    <TouchableOpacity
      style={[styles.gameCard, { width: cardSize, height: cardSize * 1.4 }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: card.isMatched, selected: isFlipped }}
    >
      {/* Back face — visible at flip=0, hidden past 90° rotation. */}
      <Animated.View
        style={[
          styles.face,
          { transform: [{ perspective: 800 }, { rotateY: backRotation }] },
        ]}
        pointerEvents="none"
      >
        <CardBack size={cardSize} color={cardBackColor} />
      </Animated.View>

      {/* Front face — pre-rotated 180° so it starts facing away; visible
          once flip crosses 90° toward 1. Symbol Text is centered inside. */}
      <Animated.View
        style={[
          styles.face,
          styles.frontFace,
          {
            backgroundColor: card.isMatched ? '#10b981' : '#1e3a5f',
            borderColor: card.isMatched ? '#059669' : '#2563eb',
            transform: [{ perspective: 800 }, { rotateY: frontRotation }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={{ fontSize: cardSize * 0.45 }}>{card.symbol}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    margin: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontFace: {
    borderWidth: 2,
  },
});

export default Card;
