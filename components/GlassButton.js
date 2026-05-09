import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const splitStyle = (style) => {
  const flat = StyleSheet.flatten(style || {});
  const outer = {};
  const inner = {};
  Object.keys(flat).forEach((key) => {
    const value = flat[key];
    if (
      key === 'margin' ||
      key === 'marginTop' ||
      key === 'marginBottom' ||
      key === 'marginLeft' ||
      key === 'marginRight' ||
      key === 'marginHorizontal' ||
      key === 'marginVertical' ||
      key === 'width' ||
      key === 'alignSelf'
    ) {
      outer[key] = value;
    } else if (key === 'borderRadius') {
      outer[key] = value;
      inner[key] = value;
    } else {
      inner[key] = value;
    }
  });
  return { outer, inner, borderRadius: flat.borderRadius ?? 12 };
};

const GlassButton = ({ tintColor, onPress, disabled, style, children, intensity = 50 }) => {
  const { outer, inner, borderRadius } = splitStyle(style);

  if (Platform.OS === 'ios') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={outer}>
        <BlurView
          tint="systemMaterial"
          intensity={intensity}
          style={[styles.base, { borderRadius }]}
        >
          <View style={[inner, { backgroundColor: tintColor }]}>{children}</View>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.06)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.highlight,
              { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius },
            ]}
            pointerEvents="none"
          />
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled} style={outer}>
      <View style={[inner, { backgroundColor: tintColor, borderRadius }]}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
  },
});

export default GlassButton;
