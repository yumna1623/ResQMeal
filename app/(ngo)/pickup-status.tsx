import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function PickupStatus() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPicked = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("picked_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPicked();
    const channel = supabase
      .channel("pickup-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_posts" },
        () => fetchPicked(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkPicked = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("food_posts")
      .update({ status: "picked", picked_by: user.id })
      .eq("id", id);

    if (error) {
      Alert.alert("Error", "Failed to update status");
    } else {
      fetchPicked();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#568056" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* 🟢 GREEN HEADER NAVBAR */}
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
            <Text style={styles.titleWhite}>My Pickups</Text>
            <Text style={styles.subtitleWhite}>
              Track your food rescue missions
            </Text>
          </View>
        </View>

        {/* 🔄 REFRESH BUTTON: Updated to Glassmorphism (Green Theme) */}
        <TouchableOpacity
          onPress={fetchPicked}
          style={styles.refreshBtnGreen}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🚚</Text>
            <Text style={styles.empty}>No pickups yet</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Text style={styles.emoji}>🍱</Text>
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardQty}>
                      Quantity: {item.quantity}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === "picked" ? "#E8F5E9" : "#FFF9C4",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === "picked" ? "#568056" : "#FBC02D",
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsBox}>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#64748b"
                    />
                    <Text style={styles.infoText}>{item.location}</Text>
                  </View>
                  <View style={[styles.infoRow, { marginTop: 8 }]}>
                    <Ionicons name="time-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{item.pickup_time}</Text>
                  </View>
                </View>

                {item.status !== "picked" ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => handleMarkPicked(item.id)}
                  >
                    <Text style={styles.buttonText}>Mark as Picked</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.doneText}>✅ Pickup Completed</Text>
                    <TouchableOpacity
                      style={styles.rateButton}
                      onPress={() =>
                        router.push({
                          pathname: "/rating",
                          params: { foodId: item.id, rateeId: item.user_id },
                        })
                      }
                    >
                      <Ionicons
                        name="star"
                        size={16}
                        color="#000"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.rateButtonText}>
                        Rate this Donation
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#568056" },
  container: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 25,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 2,
  },
  // 🟢 Fixed Refresh Button - Glass Effect
  refreshBtnGreen: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  listPadding: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#F8FAF8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F4F0",
  },
  emoji: { fontSize: 22 },
  headerText: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  cardQty: { fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900" },
  detailsBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: "#568056",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  completedContainer: { width: "100%" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  doneText: {
    color: "#568056",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 14,
  },
  rateButton: {
    marginTop: 12,
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rateButtonText: { color: "#000", fontWeight: "800", fontSize: 15 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyEmoji: { fontSize: 50, marginBottom: 15 },
  empty: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
});
