import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../src/config/supabase";
import { useAuth } from "../src/context/AuthContext";

export default function RatingScreen() {
  const { foodId, rateeId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    const { error } = await supabase.from("ratings").insert([
      {
        food_post_id: foodId,
        rater_id: user?.id,
        ratee_id: rateeId,
        rating,
        feedback: feedback.trim() || "No feedback provided",
      },
    ]);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success ✅", "Thank you for your feedback!", [
        { text: "OK", onPress: () => router.replace("/(ngo)/pickup-status") },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🟢 Matching Status Bar style from previous pages */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* 🟢 Green Header Navbar */}
      <View style={styles.greenHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.titleWhite}>Rate Experience</Text>
            <Text style={styles.subtitleWhite}>How was the process?</Text>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.labelText}>Tap to Rate</Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={46}
                      color={rating >= star ? "#FFD700" : "#E2E8F0"}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.labelText}>Feedback (Optional)</Text>
              <TextInput
                placeholder="Tell us what went well..."
                placeholderTextColor="#A0AEC0"
                style={styles.input}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.button, rating === 0 && styles.disabledButton]}
                onPress={submitRating}
                disabled={rating === 0}
              >
                <Text style={styles.buttonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.replace("/(ngo)/pickup-status")}
            >
              <Text style={styles.skipText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#568056" },
  container: { flex: 1, backgroundColor: "#fff" },

  // 🟢 Green Navbar Matching FoodList & PickupStatus
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 25,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { padding: 4 },
  titleWhite: { fontSize: 24, fontWeight: "900", color: "#fff" },
  subtitleWhite: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  scrollContainer: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#568056",
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starIcon: { marginHorizontal: 6 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 25 },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    marginBottom: 25,
    color: "#000",
  },
  button: {
    backgroundColor: "#568056",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#A0AEC0" },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  skipBtn: { marginTop: 20, alignItems: "center" },
  skipText: { color: "#A0AEC0", fontWeight: "700", fontSize: 14 },
});
