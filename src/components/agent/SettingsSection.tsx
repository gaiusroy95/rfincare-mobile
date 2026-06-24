import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';

type Props = {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  danger?: boolean;
  children: React.ReactNode;
};

export default function SettingsSection({
  title,
  description,
  icon,
  iconColor = colors.agent,
  iconBg = '#FCE7F3',
  danger,
  children,
}: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={danger ? colors.destructive : iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14, padding: 16 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  titleDanger: { color: colors.destructive },
  description: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 17 },
});
