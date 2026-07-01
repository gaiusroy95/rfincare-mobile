import { Tabs } from 'expo-router';
import { colors } from '@/src/theme';
import { tabBarIcon } from '@/src/components/TabBarIcon';
import CustomerTabBar from '@/src/components/customer/CustomerTabBar';

export default function CustomerTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.customer,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: tabBarIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="apply"
        options={{ title: 'Apply', tabBarIcon: tabBarIcon('create', 'create-outline') }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{ title: 'Banks', tabBarIcon: tabBarIcon('business', 'business-outline') }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: tabBarIcon('grid', 'grid-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabBarIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
