import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme';
import { CUSTOMER_FOOTER_TOOLS } from '@/src/constants/customerToolLinks';

type SidebarContextValue = { open: () => void; close: () => void };

const SidebarContext = createContext<SidebarContextValue>({
  open: () => {},
  close: () => {},
});

export const useCustomerSidebar = () => useContext(SidebarContext);

const PANEL_WIDTH = Math.min(300, Dimensions.get('window').width * 0.82);

export function CustomerSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const open = useCallback(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: -PANEL_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setMounted(false));
  }, [translateX, backdrop]);

  useEffect(() => {
    if (mounted) {
      translateX.setValue(-PANEL_WIDTH);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [mounted, translateX, backdrop]);

  const go = (href: string) => {
    close();
    setTimeout(() => router.push(href as never), 200);
  };

  return (
    <SidebarContext.Provider value={{ open, close }}>
      {children}
      <Modal visible={mounted} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            { width: PANEL_WIDTH, paddingTop: insets.top + 16, transform: [{ translateX }] },
          ]}
        >
          <View style={styles.header}>
            <Ionicons name="apps" size={20} color={colors.customer} />
            <Text style={styles.headerText}>Quick Tools</Text>
            <TouchableOpacity onPress={close} style={styles.closeBtn} accessibilityLabel="Close menu">
              <Ionicons name="close" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {CUSTOMER_FOOTER_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.href}
              style={styles.item}
              onPress={() => go(tool.href)}
              activeOpacity={0.8}
            >
              <View style={styles.itemIcon}>
                <Ionicons name={tool.icon} size={18} color={colors.customer} />
              </View>
              <Text style={styles.itemLabel}>{tool.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </SidebarContext.Provider>
  );
}

/** Hamburger button that opens the left sidebar. */
export function SidebarToggle() {
  const { open } = useCustomerSidebar();
  return (
    <TouchableOpacity style={styles.toggle} onPress={open} accessibilityLabel="Open menu">
      <Ionicons name="menu" size={22} color={colors.foreground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.foreground },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: `${colors.customer}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.foreground },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
