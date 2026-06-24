import { Tabs } from 'expo-router';
import { colors } from '@/src/theme';
import { tabBarIcon } from '@/src/components/TabBarIcon';

export default function AgentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.agent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: tabBarIcon('stats-chart', 'stats-chart-outline') }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Clients', tabBarIcon: tabBarIcon('people', 'people-outline') }}
      />
      <Tabs.Screen
        name="documents"
        options={{ title: 'Documents', tabBarIcon: tabBarIcon('folder-open', 'folder-open-outline') }}
      />
      <Tabs.Screen
        name="learning"
        options={{ title: 'Learning', tabBarIcon: tabBarIcon('school', 'school-outline') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabBarIcon('settings', 'settings-outline') }}
      />
    </Tabs>
  );
}
