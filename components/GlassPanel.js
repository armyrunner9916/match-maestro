import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
      key === 'maxWidth' ||
      key === 'minWidth' ||
      key === 'flex' ||
      key === 'flexGrow' ||
      key === 'flexShrink' ||
      key === 'flexBasis' ||
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

const GlassPanel = ({
  style,
  children,
  intensity = 50,
  tint = 'systemMaterial',
  overlay = 'rgba(0, 0, 0, 0.55)',
}) => {
  const { outer, inner, borderRadius } = splitStyle(style);
  const innerWithOverlay = overlay ? { ...inner, backgroundColor: overlay } : inner;

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint={tint}
        intensity={intensity}
        style={[styles.base, outer, { borderRadius, overflow: 'hidden' }]}
      >
        <View style={innerWithOverlay}>{children}</View>
        <LinearGradient
          colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.highlight,
            { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius },
          ]}
          pointerEvents="none"
        />
      </BlurView>
    );
  }

  return (
    <View style={[styles.base, styles.fallback, outer, { borderRadius }]}>
      <View style={innerWithOverlay}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(40, 40, 60, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
  },
});

export default GlassPanel;
