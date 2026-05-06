import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../src/config/supabase";
import { useAuth } from "../src/context/AuthContext";

type Food = {
  id: string;
  user_id: string;
  title: string;
  quantity: string;
  location: string;
  pickup_date: string;
  pickup_time: string;
  expiry_time: string;
  contact_number: string;
  latitude: number;
  longitude: number;
  status: string;
  picked_by?: string;
};

export default function FoodDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const { item } = useLocalSearchParams();

  const food: Food = JSON.parse(item as string);
  const [status, setStatus] = useState(food.status);
  const [pickedBy, setPickedBy] = useState(food.picked_by);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "accepted",
        picked_by: user.id,
      })
      .eq("id", food.id)
      .eq("status", "available");

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setStatus("accepted");
      setPickedBy(user.id);
      Alert.alert("Success ✅", "Pickup accepted! You're on the way.", [
        { text: "OK", onPress: () => router.replace("/(ngo)/pickup-status") },
      ]);
    }
  };

  const handlePicked = async () => {
    const { error } = await supabase
      .from("food_posts")
      .update({ status: "picked" })
      .eq("id", food.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Pickup Completed ✅", "Would you like to rate this donor?", [
      { text: "Skip", onPress: () => router.replace("/(ngo)/pickup-status") },
      {
        text: "Rate Now",
        onPress: () => {
          router.push({
            pathname: "/rating",
            params: { foodId: food.id, rateeId: food.user_id },
          });
        },
      },
    ]);
  };

  const openMap = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${food.latitude},${food.longitude}`;
    const label = food.title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* 🟢 FIXED GREEN HEADER */}
      <View style={styles.greenHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtnGlass}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.emojiContainer}>
            <Text style={styles.mainEmoji}>🍱</Text>
          </View>
          <Text style={styles.foodTitle}>{food.title}</Text>
          <View style={[styles.badge, getStatusStyle(status)]}>
            <Text style={[styles.badgeText, getStatusTextStyle(status)]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <DetailItem
            icon="cube-outline"
            label="Quantity"
            value={food.quantity}
          />
          <DetailItem
            icon="location-outline"
            label="Location"
            value={food.location}
          />
          <DetailItem
            icon="calendar-outline"
            label="Pickup Date"
            value={food.pickup_date}
          />
          <DetailItem
            icon="time-outline"
            label="Available Time"
            value={`${food.pickup_time} - ${food.expiry_time}`}
          />
          <DetailItem
            icon="call-outline"
            label="Contact"
            value={food.contact_number}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Ionicons name="map-outline" size={20} color="#568056" />
            <Text style={styles.mapButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>

          {status === "available" && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Accept Pickup</Text>
              )}
            </TouchableOpacity>
          )}

          {status === "accepted" &&
            (pickedBy || food.picked_by) === user.id && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#3b82f6" }]}
                onPress={handlePicked}
              >
                <Text style={styles.buttonText}>🚚 Mark as Picked</Text>
              </TouchableOpacity>
            )}

          {status === "picked" && (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle" size={24} color="#568056" />
              <Text style={styles.completedText}>Pickup Completed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Detail Component
const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.detailItem}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={20} color="#568056" />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const getStatusStyle = (status: string) => {
  if (status === "available") return { backgroundColor: "#E8F5E9" };
  if (status === "accepted") return { backgroundColor: "#FFF3E0" };
  return { backgroundColor: "#E3F2FD" };
};

const getStatusTextStyle = (status: string) => {
  if (status === "available") return { color: "#568056" };
  if (status === "accepted") return { color: "#E65100" };
  return { color: "#1565C0" };
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  backBtnGlass: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 40 },
  card: { alignItems: "center", marginBottom: 30 },
  emojiContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F0F7F0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  mainEmoji: { fontSize: 40 },
  foodTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  detailsSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailTextContainer: { flex: 1 },
  detailLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "700",
    marginTop: 2,
  },
  actions: { gap: 15 },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  mapButtonText: { marginLeft: 10, color: "#568056", fontWeight: "700" },
  primaryButton: {
    backgroundColor: "#568056",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F7F0",
    padding: 18,
    borderRadius: 18,
  },
  completedText: {
    marginLeft: 10,
    color: "#568056",
    fontWeight: "800",
    fontSize: 16,
  },
});