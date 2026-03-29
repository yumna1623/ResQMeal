import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function MyPosts() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

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

    const updatedPosts = await Promise.all(
      (data || []).map(async (post) => {
        if (!post.picked_by) {
          return { ...post, ngoName: null };
        }

        const { data: ngo } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", post.picked_by)
          .maybeSingle();

        return {
          ...post,
          ngoName: ngo?.name || "Unknown",
        };
      })
    );

    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts); // ✅ initially same
    setLoading(false);
  };

  // 🔥 SEARCH FILTER
  useEffect(() => {
    const filtered = posts.filter((item) => {
      const titleMatch = item.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const dateMatch = item.pickup_date
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return titleMatch || dateMatch;
    });

    setFilteredPosts(filtered);
  }, [search, posts]);

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

      {/* 🔍 SEARCH BAR */}
      <TextInput
        placeholder="Search by food or date..."
        placeholderTextColor="#999"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {filteredPosts.length === 0 ? (
        <Text style={styles.empty}>No matching posts</Text>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>🍱 {item.title}</Text>
              <Text style={styles.text}>📦 {item.quantity}</Text>
              <Text style={styles.text}>📍 {item.location}</Text>
              <Text style={styles.text}>📅 {item.pickup_date}</Text>
              <Text style={styles.text}>⏰ {item.pickup_time}</Text>
              <Text style={styles.text}>⏳ {item.expiry_time}</Text>

              {/* STATUS */}
              {item.status === "available" && (
                <Text style={styles.available}>🟢 Available</Text>
              )}

              {item.status === "accepted" && (
                <>
                  <Text style={styles.accepted}>🟡 Accepted</Text>
                  <Text style={styles.ngo}>NGO: {item.ngoName}</Text>
                </>
              )}

              {item.status === "picked" && (
                <>
                  <Text style={styles.picked}>🔵 Picked</Text>
                  <Text style={styles.ngo}>NGO: {item.ngoName}</Text>
                </>
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
  search: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 15,
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
  accepted: {
    color: "#facc15",
    marginTop: 5,
    fontWeight: "bold",
  },
  picked: {
    color: "#60a5fa",
    marginTop: 5,
    fontWeight: "bold",
  },
  ngo: {
    color: "#c084fc",
    marginTop: 4,
  },
});