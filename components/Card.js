import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import CardBack from './CardBack';

// Single playable memory card. Renders face-down (CardBack) until revealed
// or matched. Phase 6.1 will add the rotateY flip animation here.
function Card({ card, isFlipped, cardSize, cardBackColor, onPress }) {
  const showFace = isFlipped || card.isMatched;

  return (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { width: cardSize, height: cardSize * 1.4 },
        card.isMatched ? styles.cardMatched : null,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {showFace ? (
        <View style={{
          width: cardSize,
          height: cardSize * 1.4,
          backgroundColor: card.isMatched ? '#10b981' : '#1e3a5f',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: card.isMatched ? '#059669' : '#2563eb',
        }}>
          <Text style={{ fontSize: cardSize * 0.45 }}>{card.symbol}</Text>
        </View>
      ) : (
        <CardBack size={cardSize} color={cardBackColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  cardMatched: {
    backgroundColor: '#10b981',
  },
});

export default Card;
