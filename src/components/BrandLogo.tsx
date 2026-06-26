import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, fonts } from '@/src/theme';

/** In-app header / branding — orange finance mark */
const IN_APP_LOGO = require('../../assets/images/logo.jpg');

type Props = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  showName?: boolean;
};

const HEIGHTS = { sm: 48, md: 76, lg: 128 };
const NAME_SIZES = { sm: 12, md: 15, lg: 19 };

export default function BrandLogo({ size = 'md', style, showName = true }: Props) {
  const height = HEIGHTS[size] || HEIGHTS.md;
  const nameSize = NAME_SIZES[size] || NAME_SIZES.md;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={IN_APP_LOGO}
        style={[styles.logo, { height, width: height }]}
        resizeMode="contain"
        accessibilityLabel="Rfincare"
      />
      {showName ? (
        <Text style={[styles.name, { fontSize: nameSize }]}>
          R<Text style={styles.nameAccent}>fincare</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  logo: {} as ImageStyle,
  name: {
    marginTop: 4,
    fontFamily: fonts.headline,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.2,
  },
  nameAccent: {
    color: colors.primary,
  },
});
