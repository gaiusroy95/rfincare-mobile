import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme';
import { CUSTOMER_FOOTER_TOOLS } from '@/src/constants/customerToolLinks';

export default function CustomerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.toolsRow}>
        {CUSTOMER_FOOTER_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.href}
            style={styles.toolBtn}
            onPress={() => router.push(tool.href as never)}
            activeOpacity={0.8}
          >
            <Ionicons name={tool.icon} size={18} color={colors.customer} />
            <Text style={styles.toolLabel} numberOfLines={1}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? colors.customer : colors.mutedForeground;
          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color,
            size: 22,
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabBtn}
              activeOpacity={0.8}
            >
              {icon}
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  toolLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.foreground,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
