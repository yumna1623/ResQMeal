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

export default function HallDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("User");
  const [role, setRole] = useState("");

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
        setRole(data.role || "User");
      }
    } catch (err) {
      console.log("Profile error");
    }
  };

  const fetchPosts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("food_posts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "picked")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchPosts();
    fetchUserProfile();
  }, [user]);

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

  // ✅ Optimized Navigation Handler
  const handleNav = (path: any) => {
    setSidebarOpen(false);
    sidebarAnim.setValue(-SIDEBAR_WIDTH);
    overlayOpacity.setValue(0);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* 🟢 PREMIUM GREEN HEADER */}
      <View style={styles.greenHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuBtnGlass}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.titleWhite}>📬 History</Text>
            <Text style={styles.subtitleWhite}>Completed Donations</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={fetchPosts}
          style={styles.refreshBtnGlass}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#568056" size="large" />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardLocation}>📍 {item.location}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>COMPLETED</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.label}>QUANTITY</Text>
                    <Text style={styles.value}>{item.quantity}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.label}>DATE</Text>
                    <Text style={styles.value}>{item.pickup_date}</Text>
                  </View>
                </View>
              </View>
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

      {/* SIDEBAR */}
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

          <View style={styles.sidebarMenu}>
            <TouchableOpacity
              style={styles.activeMenuItem}
              onPress={() => closeSidebar()}
            >
              <Ionicons name="time-outline" size={20} color="#fff" />
              <Text style={styles.activeMenuItemText}>Donation History</Text>
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
  content: { flex: 1, backgroundColor: "#fff" },

  // NAVBAR
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
  titleWhite: { fontSize: 24, fontWeight: "900", color: "#fff" },
  subtitleWhite: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  menuBtnGlass: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  refreshBtnGlass: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  listContent: { padding: 25, paddingTop: 30, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  cardLocation: { fontSize: 13, color: "#777", marginTop: 4 },
  statusBadge: {
    backgroundColor: "#f0f7f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { color: "#568056", fontSize: 10, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#f8f8f8", marginVertical: 15 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 10, color: "#bbb", fontWeight: "700", letterSpacing: 0.5 },
  value: { fontSize: 14, color: "#444", fontWeight: "600", marginTop: 4 },

  // SIDEBAR
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  avatarWrapper: { position: "relative" },
});
