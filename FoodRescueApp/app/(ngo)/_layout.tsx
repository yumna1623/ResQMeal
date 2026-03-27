import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NgoLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#22C55E",
      }}
    >
      <Tabs.Screen
        name="food-list"
        options={{
          title: "Food",
          tabBarIcon: ({ color }) => (
            <Ionicons name="fast-food" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}