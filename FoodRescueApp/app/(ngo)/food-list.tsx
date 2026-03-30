import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking, // ✅ ADD THIS
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function FoodList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Accept pickup
  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "accepted",
        picked_by: user.id,
      })
      .eq("id", id)
      .eq("status", "available");

    if (error) {
      console.log("Accept error:", error);
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Food accepted!");
      fetchPosts();
    }
  };

  // ✅ Mark as picked
  const handlePicked = async (id: string) => {
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "picked",
      })
      .eq("id", id)
      .eq("picked_by", user.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Marked as picked!");
      fetchPosts();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }
  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open maps");
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Food</Text>
      <TouchableOpacity onPress={fetchPosts} style={{ marginBottom: 10 }}>
        <Text style={{ color: "#22c55e" }}>🔄 Refresh</Text>
      </TouchableOpacity>

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
              <Text>📅 Date: {item.pickup_date}</Text>
              <Text>⏰ From: {item.pickup_time}</Text>
              <Text>⏳ Until: {item.expiry_time}</Text>
              {/* View on Map */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6366f1" }]}
                onPress={() =>
                  router.push({
                    pathname: "/(ngo)/map",
                    params: {
                      latitude: item.latitude,
                      longitude: item.longitude,
                      title: item.title,
                      location: item.location,
                    },
                  })
                }
              >
                <Text style={styles.buttonText}>View on Map</Text>
              </TouchableOpacity>

              {/* Accept Button */}
              {item.status === "available" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAccept(item.id)}
                >
                  <Text style={styles.buttonText}>Accept Pickup</Text>
                </TouchableOpacity>
                
              )}

              {/* Mark as Picked Button */}
              {item.status === "accepted" && item.picked_by === user.id && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#3b82f6" }]}
                  onPress={() => handlePicked(item.id)}
                >
                  <Text style={styles.buttonText}>Mark as Picked</Text>
                </TouchableOpacity>
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
