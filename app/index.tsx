import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../src/config/supabase";
import { useAuth } from "../src/context/AuthContext";
import MyModal from "./modal"; // Import your modal component

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isModalVisible, setModalVisible] = useState(true); // Set modal visibility to true initially

  const closeModal = () => {
    setModalVisible(false); // Close modal when button is pressed
  };

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

    if (!isModalVisible) {
      handleRedirect(); // Redirection happens only after modal is closed
    }
  }, [user, loading, isModalVisible]);

  if (loading || isModalVisible) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MyModal isVisible={isModalVisible} onClose={closeModal} />
        {loading && !isModalVisible && <ActivityIndicator size="large" />}
      </View>
    );
  }

  return null; // This will not be reached until the modal is closed
}