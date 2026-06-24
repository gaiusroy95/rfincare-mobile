import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';
import { isSvgLogoUrl, resolveRasterLogoUrl } from '@/src/utils/bankBranding';

type LoadMode = 'raster' | 'svg' | 'fallback';

type Props = {
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  iconSize?: number;
  backgroundColor?: string;
};

function initialMode(uri: string): LoadMode {
  if (resolveRasterLogoUrl(uri)) return 'raster';
  if (isSvgLogoUrl(uri)) return 'svg';
  return 'raster';
}

export default function BankLogo({
  uri,
  size = 56,
  style,
  imageStyle,
  iconSize,
  backgroundColor = colors.muted,
}: Props) {
  const [mode, setMode] = useState<LoadMode>(() => (uri ? initialMode(uri) : 'fallback'));

  useEffect(() => {
    setMode(uri ? initialMode(uri) : 'fallback');
  }, [uri]);

  const wrapStyle = [
    styles.wrap,
    { width: size, height: size, backgroundColor },
    style,
  ];

  if (!uri || mode === 'fallback') {
    return (
      <View style={wrapStyle}>
        <Ionicons
          name="business-outline"
          size={iconSize ?? Math.round(size * 0.5)}
          color={colors.mutedForeground}
        />
      </View>
    );
  }

  if (mode === 'svg') {
    return (
      <View style={wrapStyle}>
        <SvgUri
          uri={uri}
          width={size}
          height={size}
          onError={() => setMode('fallback')}
        />
      </View>
    );
  }

  const rasterUrl = resolveRasterLogoUrl(uri);
  const imageUri = rasterUrl || uri;

  return (
    <View style={wrapStyle}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, imageStyle]}
        resizeMode="contain"
        onError={() => {
          if (isSvgLogoUrl(uri)) {
            setMode('svg');
            return;
          }
          setMode('fallback');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
