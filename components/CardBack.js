import React from 'react';
import { View, Text } from 'react-native';

// Phase 2 will replace this with six distinct SVG designs (Wave/Chevron/Vine/
// Sunburst/Deco/Labyrinth). For now this is the existing diamond-grid pattern,
// extracted verbatim so behavior is unchanged.
const COLOR_MAP = {
  black:  { bg: '#1a1a1a', border: '#444444', pattern: '#333333', accent: '#666666' },
  red:    { bg: '#991b1b', border: '#fca5a5', pattern: '#dc2626', accent: '#fca5a5' },
  green:  { bg: '#14532d', border: '#86efac', pattern: '#16a34a', accent: '#86efac' },
  blue:   { bg: '#1e3a8a', border: '#93c5fd', pattern: '#2563eb', accent: '#93c5fd' },
  yellow: { bg: '#713f12', border: '#fde68a', pattern: '#ca8a04', accent: '#fde68a' },
  purple: { bg: '#4c1d95', border: '#d8b4fe', pattern: '#7c3aed', accent: '#d8b4fe' },
};

function CardBack({ size, color = 'blue' }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const height = size * 1.4;
  const diamondSize = size * 0.18;
  return (
    <View
      style={{
        width: size,
        height: height,
        backgroundColor: colors.bg,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Inner border frame */}
      <View style={{
        position: 'absolute',
        top: height * 0.06,
        left: size * 0.08,
        right: size * 0.08,
        bottom: height * 0.06,
        borderWidth: 1.5,
        borderColor: colors.accent,
        borderRadius: 4,
        opacity: 0.6,
      }} />
      {/* Diamond grid pattern - 3 cols x 4 rows for rectangle */}
      {[0, 1, 2, 3].map(row => (
        [0, 1, 2].map(col => (
          <View key={`${row}-${col}`} style={{
            position: 'absolute',
            width: diamondSize,
            height: diamondSize,
            backgroundColor: colors.pattern,
            transform: [{ rotate: '45deg' }],
            opacity: 0.5,
            top: height * 0.15 + row * height * 0.2,
            left: size * 0.18 + col * size * 0.3,
            borderRadius: 2,
          }} />
        ))
      ))}
      {/* Center suit symbol */}
      <Text style={{
        fontSize: size * 0.35,
        color: colors.accent,
        opacity: 0.9,
      }}>♦</Text>
    </View>
  );
}

export default CardBack;
