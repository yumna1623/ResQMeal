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
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function FoodList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  };

 useEffect(() => {
  fetchPosts();

  const channel = supabase
    .channel("food-posts-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "food_posts" },
      () => {
        fetchPosts();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "picked",
        picked_by: user.id,
      })
      .eq("id", id);

    if (error) {
      console.log("Accept error:", error);
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Pickup accepted!");
      fetchPosts(); // refresh list
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
      <TouchableOpacity onPress={fetchPosts} style={{ marginBottom: 10 }}>
        <Text style={{ color: "#22c55e" }}>🔄 Refresh</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Available Food</Text>

      {posts.length === 0 ? (
        <Text style={styles.empty}>No food available</Text>
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

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={styles.buttonText}>Accept Pickup</Text>
              </TouchableOpacity>
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
  button: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
