import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HallLayout() {
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
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="my-posts"
  options={{
    title: "My Posts",
    tabBarIcon: ({ color }) => (
      <Ionicons name="list" size={22} color={color} />
    ),
  }}
/>

      <Tabs.Screen
        name="post-food"
        options={{
          title: "Post Food",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={22} color={color} />
          ),
        }}
      />
    </Tabs>

    
    
  );
}