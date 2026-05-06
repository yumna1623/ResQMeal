import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

interface FoodPost {
  id: string;
  title: string;
  location: string;
  quantity: string;
  status: string;
  pickup_date: string;
  pickup_time: string;
  expiry_time: string;
  ngoName?: string | null;
}

export default function MyPosts() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMyPosts = async (isRefreshing = false) => {
    if (!user) return;
    if (!isRefreshing) setLoading(true);

    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const updatedPosts = await Promise.all(
      (data || []).map(async (post) => {
        if (!post.picked_by) return { ...post, ngoName: null };
        const { data: ngo } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", post.picked_by)
          .maybeSingle();

        return { ...post, ngoName: ngo?.name || "Unknown NGO" };
      }),
    );

    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts);
    setLoading(false);
    setRefreshing(false);
  };

  const handleReload = () => {
    setRefreshing(true);
    fetchMyPosts(true);
  };

  useEffect(() => {
    const filtered = posts.filter((item) => {
      const searchStr = search.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchStr) ||
        item.pickup_date?.toLowerCase().includes(searchStr) ||
        item.status?.toLowerCase().includes(searchStr)
      );
    });
    setFilteredPosts(filtered);
  }, [search, posts]);

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles_status = getStatusStyle(status);
    return (
      <View
        style={[styles.statusBadge, { backgroundColor: styles_status.bgColor }]}
      >
        <Text style={[styles.statusText, { color: styles_status.textColor }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const getStatusStyle = (status: string) => {
    if (status === "available")
      return { bgColor: "#E8F5E9", textColor: "#2E7D32" };
    if (status === "accepted")
      return { bgColor: "#FFF9C4", textColor: "#FBC02D" };
    if (status === "picked")
      return { bgColor: "#E3F2FD", textColor: "#1976D2" };
    return { bgColor: "#F5F5F5", textColor: "#757575" };
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

      {/* 🟢 PREMIUM GREEN HEADER */}
      <View style={styles.greenHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitleWhite}>My Posts</Text>
            <Text style={styles.headerSubtitleWhite}>
              Manage your donations
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reloadBtnGlass}
            onPress={handleReload}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR INSIDE HEADER */}
        <View style={styles.searchWrapperGlass}>
          <Ionicons
            name="search"
            size={20}
            color="rgba(255,255,255,0.7)"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search by title or status..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.searchBarWhite}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleReload}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#EEE" />
              <Text style={styles.emptyTitle}>No posts found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardLocation}>📍 {item.location}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.label}>QUANTITY</Text>
                  <Text style={styles.value}>{item.quantity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.label}>PICKUP DATE</Text>
                  <Text style={styles.value}>{item.pickup_date}</Text>
                </View>
              </View>

              {item.ngoName && (
                <View style={styles.ngoSection}>
                  <Text style={styles.ngoLabel}>ASSIGNED TO</Text>
                  <View style={styles.ngoBadge}>
                    <Text style={styles.ngoValue}>🏢 {item.ngoName}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        />
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

  // NAVBAR
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 25,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitleWhite: { fontSize: 28, fontWeight: "900", color: "#fff" },
  headerSubtitleWhite: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  reloadBtnGlass: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // SEARCH
  searchWrapperGlass: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchBarWhite: { flex: 1, fontSize: 16, color: "#fff", fontWeight: "600" },

  listContent: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 25 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  cardLocation: {
    fontSize: 13,
    color: "#888",
    marginTop: 5,
    fontWeight: "500",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: "#F8F8F8", marginVertical: 18 },
  detailsGrid: { flexDirection: "row", justifyContent: "space-between" },
  detailItem: { flex: 1 },
  label: { fontSize: 10, color: "#BBB", fontWeight: "800", letterSpacing: 1 },
  value: { fontSize: 14, color: "#444", fontWeight: "700", marginTop: 5 },
  ngoSection: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F8F8F8",
  },
  ngoLabel: {
    fontSize: 10,
    color: "#568056",
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  ngoBadge: {
    backgroundColor: "#F0F7F0",
    padding: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ngoValue: { fontSize: 13, color: "#568056", fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 80, opacity: 0.5 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#999", marginTop: 10 },
});