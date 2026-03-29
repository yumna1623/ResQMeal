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

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
      setLoading(false);
      return;
    }

    // 🔥 Fetch NGO NAME instead of email
    const updatedPosts = await Promise.all(
      (data || []).map(async (post) => {
        if (!post.picked_by) {
          return { ...post, ngoName: null };
        }

        const { data: ngo, error: ngoError } = await supabase
          .from("profiles")
          .select("name") // ✅ FIXED
          .eq("id", post.picked_by)
          .maybeSingle();

        if (ngoError) {
          console.log("NGO fetch error:", ngoError);
        }

        return {
          ...post,
          ngoName: ngo?.name || "Unknown", // ✅ FIXED
        };
      })
    );

    setPosts(updatedPosts);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Food Posts</Text>

      {posts.length === 0 ? (
        <Text style={styles.empty}>No posts yet</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>🍱 {item.title}</Text>
              <Text style={styles.text}>📦 {item.quantity}</Text>
              <Text style={styles.text}>📍 {item.location}</Text>
              <Text style={styles.text}>⏰ {item.pickup_time}</Text>

              {/* STATUS */}
              {item.picked_by ? (
                <>
                  <Text style={styles.picked}>✅ Picked</Text>
                  <Text style={styles.ngo}>
                    NGO: {item.ngoName}
                  </Text>
                </>
              ) : (
                <Text style={styles.available}>🟢 Available</Text>
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
  available: {
    color: "#22c55e",
    marginTop: 5,
    fontWeight: "bold",
  },
  picked: {
    color: "#facc15",
    marginTop: 5,
    fontWeight: "bold",
  },
  ngo: {
    color: "#60a5fa",
    marginTop: 4,
  },
});