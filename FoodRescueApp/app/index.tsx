import { View, ActivityIndicator, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { supabase } from "../src/config/supabase";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

useEffect(() => {
  const handleRedirect = async () => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      router.replace("/login");
      return;
    }

    if (data.role === "hall") {
      router.replace("/(hall)/dashboard");
    } else if (data.role === "ngo") {
      router.replace("/(ngo)/food-list");
    }
  };

  handleRedirect();
}, [user, loading]);

if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ color: "#fff", marginTop: 10 }}>
        Checking session...
      </Text>
    </View>
  );
}
}