import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#32B5F4",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
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
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 32, color: color }}>📷</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="placeholder"
        options={{
          title: "Services",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>🏥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 28, color: color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
