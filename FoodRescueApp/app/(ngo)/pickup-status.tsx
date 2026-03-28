import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function PickupStatus() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPicked = async () => {
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
  }, []);

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
              <Text style={styles.status}>✅ Picked</Text>
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
    color: "#22c55e",
    marginTop: 5,
    fontWeight: "bold",
  },
});