import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { supabase } from "../../src/config/supabase";

export default function HallDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("hall-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_posts" },
        fetchPosts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const { error } = await supabase
            .from("food_posts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

          if (!error) fetchPosts();
        },
      },
    ]);
  };

  const getStatusStyle = (status: string) => {
    if (status === "available") return styles.available;
    if (status === "accepted") return styles.accepted;
    return styles.picked;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>🏢 My Food Posts</Text>
      <Text style={styles.subtitle}>Manage your donations</Text>

      {posts.length === 0 ? (
        <Text style={styles.empty}>No posts yet</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* TOP ROW */}
              <View style={styles.rowBetween}>
                <Text style={styles.foodTitle}>🍱 {item.title}</Text>
                <View style={[styles.badge, getStatusStyle(item.status)]}>
                  <Text style={styles.badgeText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* DETAILS */}
              <Text style={styles.text}>📦 {item.quantity}</Text>
              <Text style={styles.text}>📍 {item.location}</Text>

              <View style={styles.timeBox}>
                <Text style={styles.timeText}>
                  📅 {item.pickup_date}
                </Text>
                <Text style={styles.timeText}>
                  ⏰ {item.pickup_time} → {item.expiry_time}
                </Text>
              </View>

              {/* STATUS MESSAGE */}
              {item.status === "accepted" && (
                <Text style={styles.info}>🚚 NGO is on the way</Text>
              )}
              {item.status === "picked" && (
                <Text style={styles.done}>✅ Completed</Text>
              )}

              {/* DELETE BUTTON */}
              {item.status !== "picked" && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 15,
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  foodTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  text: {
    color: "#cbd5f5",
    marginTop: 4,
  },

  timeBox: {
    marginTop: 8,
    backgroundColor: "#0f172a",
    padding: 8,
    borderRadius: 8,
  },

  timeText: {
    color: "#94a3b8",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  available: {
    backgroundColor: "#22c55e",
  },
  accepted: {
    backgroundColor: "#facc15",
  },
  picked: {
    backgroundColor: "#3b82f6",
  },

  info: {
    color: "#60a5fa",
    marginTop: 8,
  },

  done: {
    color: "#22c55e",
    marginTop: 8,
    fontWeight: "bold",
  },

  deleteBtn: {
  marginTop: 10,
  backgroundColor: "#ef4444",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
  alignSelf: "flex-start", // 👈 makes it small instead of full width
},

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logoutButton: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});