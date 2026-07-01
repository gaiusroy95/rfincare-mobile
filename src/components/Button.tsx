import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radii } from '@/src/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'customer' | 'agent';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.primaryForeground },
  secondary: { bg: colors.secondary, text: colors.secondaryForeground },
  outline: { bg: 'transparent', text: colors.primary, border: colors.border },
  ghost: { bg: 'transparent', text: colors.foreground },
  destructive: { bg: colors.destructive, text: '#fff' },
  customer: { bg: colors.customer, text: '#fff' },
  agent: { bg: colors.agent, text: '#fff' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  textStyle,
}: Props) {
  const v = variantStyles[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border || v.bg, opacity: disabled ? 0.5 : 1 },
        variant === 'outline' && styles.outline,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  outline: { borderWidth: 1 },
  text: { fontSize: 15, fontWeight: '600' },
});
