import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

const GlassCard = ({ style, children, tintColor }) => {
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        effect="regular"
        colorScheme="dark"
        tintColor={tintColor}
        style={[styles.base, style]}
      >
        {children}
      </LiquidGlassView>
    );
  }
  return (
    <View style={[styles.base, styles.fallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(31, 41, 55, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default GlassCard;
