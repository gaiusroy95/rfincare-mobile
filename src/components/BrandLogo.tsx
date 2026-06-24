import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

/** In-app header / branding — orange finance mark */
const IN_APP_LOGO = require('../../assets/images/logo.jpg');

type Props = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

const HEIGHTS = { sm: 40, md: 56, lg: 80 };

export default function BrandLogo({ size = 'md', style }: Props) {
  const height = HEIGHTS[size] || HEIGHTS.md;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={IN_APP_LOGO}
        style={[styles.logo, { height, width: height }]}
        resizeMode="contain"
        accessibilityLabel="Rfincare"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  logo: {} as ImageStyle,
});
