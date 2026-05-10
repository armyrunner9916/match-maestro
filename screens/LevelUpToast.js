import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import GlassPanel from '../components/GlassPanel';

// Phase 6.3: Light level-up celebration. A centered mode-tinted "Level N"
// pulse renders between levels — fades in (180ms) → holds (450ms) →
// fades out (220ms). 850ms total, designed to fit cleanly between match
// resolution and the next-level deal-out.
//
// App.js owns the mount/unmount lifecycle via the `levelUpToastLevel`
// state; the toast just runs its animation once on mount. pointerEvents
// 'none' means it doesn't block input on the GameScreen below.
function LevelUpToast({ level, modeTint }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(450),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // Animated.Values are stable refs; no cleanup needed.
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <GlassPanel style={styles.panel}>
          <Text style={[styles.text, { color: modeTint }]}>Level {level}</Text>
        </GlassPanel>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    paddingVertical: 22,
    paddingHorizontal: 44,
    borderRadius: 18,
    minWidth: 200,
    alignItems: 'center',
  },
  text: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default LevelUpToast;
