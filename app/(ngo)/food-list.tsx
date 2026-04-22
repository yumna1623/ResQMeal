import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;

export default function FoodList() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("User");
  const [role, setRole] = useState("");
  const router = useRouter();

  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();
      if (data) {
        setFirstName(data.name.split(" ")[0]);
        setRole(data.role || "NGO");
      }
    } catch (err) {
      console.log("Profile error");
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
    const channel = supabase
      .channel("food-posts-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_posts" },
        () => fetchPosts(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSidebarOpen(false);
      if (callback) callback();
    });
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

      {/* --- NAVBAR --- */}
      <View style={styles.greenHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.titleWhite}>Available Food</Text>
            <Text style={styles.subtitleWhite}>
              Help rescue surplus food nearby
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={fetchPosts}
          style={styles.refreshBtnGreen}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🥗</Text>
            <Text style={styles.empty}>No food available right now</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/food-details",
                    params: { item: JSON.stringify(item) },
                  })
                }
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconBox}>
                    <Text style={styles.emoji}>🍱</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="cube-outline" size={14} color="#94a3b8" />
                      <Text style={styles.subText}>{item.quantity}</Text>
                      <View style={styles.dot} />
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#94a3b8"
                      />
                      <Text style={styles.subText}>{item.pickup_date}</Text>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#568056"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* OVERLAY */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => closeSidebar()}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* --- SIDEBAR --- */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >
        <View style={styles.sidebarGreenHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.imageContainerWhite}>
              <Text style={styles.avatarInitialGreen}>{firstName[0]}</Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <TouchableOpacity
            style={styles.closeSidebarBtnWhite}
            onPress={() => closeSidebar()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarBody}>
          <View style={styles.userTextContainer}>
            <View style={styles.roleBadgeGreen}>
              <Text style={styles.roleBadgeTextWhite}>
                {role.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userNameText}>{firstName} 👋</Text>
            <Text style={styles.userEmailText}>{user?.email}</Text>
          </View>

          <View style={styles.sidebarDivider} />

          {/* SIDEBAR MENU - Only Available Food Kept */}
          <View style={styles.sidebarMenu}>
            <TouchableOpacity
              style={styles.activeMenuItem}
              onPress={() => closeSidebar()}
            >
              <Ionicons name="fast-food-outline" size={20} color="#fff" />
              <Text style={styles.activeMenuItemText}>Available Food</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert("Logout", "Confirm?", [
                { text: "Cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    router.replace("/login");
                  },
                },
              ]);
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
            <Text style={styles.logoutBtnText}>Logout Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#568056" },
  container: { flex: 1, backgroundColor: "#fff" },
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
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  menuButton: { padding: 4 },
  titleWhite: { fontSize: 26, fontWeight: "900", color: "#fff" },
  subtitleWhite: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 3,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 54,
    height: 54,
    backgroundColor: "#F8FAF8",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 24 },
  info: { flex: 1, marginLeft: 15 },
  titleText: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  subText: { color: "#64748b", fontSize: 13, marginLeft: 4 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 8,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#F0F7F0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  sidebarGreenHeader: {
    backgroundColor: "#568056",
    paddingTop: Platform.OS === "ios" ? 70 : 60,
    paddingBottom: 35,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 40,
  },
  avatarWrapper: { position: "relative" },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    borderWidth: 3,
    borderColor: "#568056",
    zIndex: 10,
  },
  imageContainerWhite: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  avatarInitialGreen: { fontSize: 30, fontWeight: "bold", color: "#568056" },
  closeSidebarBtnWhite: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarBody: { flex: 1, paddingHorizontal: 25, marginTop: 25 },
  userTextContainer: { marginTop: 10, marginBottom: 5 },
  roleBadgeGreen: {
    backgroundColor: "#568056",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  roleBadgeTextWhite: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.8,
  },
  userNameText: { fontSize: 26, fontWeight: "900", color: "#1A1A1A" },
  userEmailText: { fontSize: 14, color: "#999", marginTop: 4 },
  sidebarDivider: { height: 1, backgroundColor: "#f2f2f2", marginVertical: 30 },
  sidebarMenu: { flex: 1 },
  activeMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#568056",
    borderRadius: 15,
    marginBottom: 10,
  },
  activeMenuItemText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  logoutBtn: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffeded",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
    gap: 10,
  },
  logoutBtnText: { color: "#ff4d4d", fontWeight: "800", fontSize: 15 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyEmoji: { fontSize: 50, marginBottom: 15 },
  empty: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
