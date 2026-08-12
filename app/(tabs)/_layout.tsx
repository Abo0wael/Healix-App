import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";
import i18n from "../../lib/i18n";
import { useTheme } from "../../lib/ThemeContext";

export default function TabLayout() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false, // Hide text labels - icons only!
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tab_home'),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: i18n.t('tab_search'),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: i18n.t('tab_camera'),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 32, color: color }}>📷</Text>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push("/meal-analysis");
          },
        })}
      />
      <Tabs.Screen
        name="placeholder"
        options={{
          title: i18n.t('tab_services'),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🏥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: i18n.t('tab_profile'),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
