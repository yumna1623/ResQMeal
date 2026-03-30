import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function PickupStatus() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        () => {
          fetchPicked();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Mark as picked (update status + picked_by)
  const handleMarkPicked = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "picked",
        picked_by: user.id,
      })
      .eq("id", id);

    if (error) {
      console.log("Update error:", error);
      Alert.alert("Error", "Failed to update status");
    } else {
      fetchPicked();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pickups</Text>

      <TouchableOpacity onPress={fetchPicked} style={{ marginBottom: 10 }}>
        <Text style={{ color: "#22c55e" }}>🔄 Refresh</Text>
      </TouchableOpacity>

      {posts.length === 0 ? (
        <Text style={styles.empty}>No pickups yet</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>🍱 {item.title}</Text>
              <Text style={styles.text}>📦 {item.quantity}</Text>
              <Text style={styles.text}>📍 {item.location}</Text>
              <Text style={styles.text}>⏰ {item.pickup_time}</Text>

              <Text style={styles.status}>Status: {item.status}</Text>

              {/* ✅ Button only if not already picked */}
              {item.status !== "picked" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleMarkPicked(item.id)}
                >
                  <Text style={styles.buttonText}>Mark as Picked</Text>
                </TouchableOpacity>
              )}

              {item.status === "picked" && (
                <Text style={styles.done}>✅ Picked Up</Text>
              )}
            </View>
          )}
        />
      )}
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
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  text: {
    color: "#fff",
    marginBottom: 4,
  },

  status: {
    color: "#facc15",
    marginTop: 6,
    fontWeight: "bold",
  },

  button: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },

  done: {
    marginTop: 8,
    color: "#22c55e",
    fontWeight: "bold",
  },
});