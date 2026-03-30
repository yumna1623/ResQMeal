import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { supabase } from "../../src/config/supabase";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;

export default function HallDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hallName, setHallName] = useState("Food Hall");
  const [sidebarAnim] = useState(() => new Animated.Value(-SIDEBAR_WIDTH));
  // ✅ Safe formatter
  const formatValue = (value: string) => {
    if (!value) return "N/A";
    return value;
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

  // Fetch hall name from user metadata or hall table
  const fetchHallName = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("halls")
        .select("name")
        .eq("user_id", user.id)
        .single();

      if (data) setHallName(data.name);
    } catch (err) {
      console.log("Hall name not found, using default");
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchPosts();
    fetchHallName();

    const channel = supabase
      .channel("hall-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_posts" },
        fetchPosts,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? -SIDEBAR_WIDTH : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Logout failed");
          }
        },
      },
    ]);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const { error } = await supabase
            .from("food_posts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

          if (!error) {
            fetchPosts();
            Alert.alert("Success", "Post deleted successfully");
          } else {
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  const getStatusStyle = (status: string) => {
    if (status === "available") return styles.available;
    if (status === "accepted") return styles.accepted;
    return styles.picked;
  };

  const getStatusIcon = (status: string) => {
    if (status === "available") return "📦";
    if (status === "accepted") return "🚚";
    return "✅";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your posts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <View style={styles.hamburger}>
              <View style={styles.line} />
              <View style={styles.line} />
              <View style={styles.line} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📬 Delivered Posts</Text>
            <Text style={styles.headerSubtitle}>View completed donations</Text>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.content}>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No Delivered Posts Yet</Text>
              <Text style={styles.emptyText}>
                Delivered posts will appear here once donations are completed
              </Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  {/* CARD HEADER */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardIcon}>🍱</Text>
                      <View style={styles.cardTitleSection}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardLocation}>
                          📍 {item.location}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.badge, getStatusStyle(item.status)]}>
                      <Text style={styles.badgeIcon}>
                        {getStatusIcon(item.status)}
                      </Text>
                      <Text style={styles.badgeText}>
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* QUANTITY */}
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>📦 Quantity</Text>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                  </View>

                  {/* TIME DETAILS */}
                  <View style={styles.timeSection}>
                    <View style={styles.timeItem}>
                      <Text style={styles.timeIcon}>📅</Text>
                      <View style={styles.timeContent}>
                        <Text style={styles.timeLabel}>Pickup Date</Text>
                        <Text style={styles.timeValue}>
                          {formatValue(item.pickup_date)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                      <Text style={styles.timeIcon}>🕐</Text>
                      <View style={styles.timeContent}>
                        <Text style={styles.timeLabel}>Pickup Time</Text>
                        <Text style={styles.timeValue}>
                          {formatValue(item.pickup_time)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeItem}>
                      <Text style={styles.timeIcon}>⏰</Text>
                      <View style={styles.timeContent}>
                        <Text style={styles.timeLabel}>Expiry Time</Text>
                        <Text style={styles.timeValue}>
                          {formatValue(item.expiry_time)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* STATUS MESSAGE */}
                  {item.status === "accepted" && (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageIcon}>🚚</Text>
                      <Text style={styles.message}>NGO is on the way</Text>
                    </View>
                  )}

                  {item.status === "picked" && (
                    <View style={styles.successBox}>
                      <Text style={styles.successIcon}>✅</Text>
                      <Text style={styles.success}>Donation Completed</Text>
                    </View>
                  )}

                  {/* DELETE BUTTON */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Delete Post</Text>
                    </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        {/* SIDEBAR */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
        >
          <View style={styles.sidebarContent}>
            {/* CLOSE BUTTON */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeSidebar}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {/* USER SECTION */}
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarIcon}>🏢</Text>
              </View>
              <Text style={styles.userName}>{hallName}</Text>
              <Text style={styles.userEmail}>
                {user?.email || "user@mail.com"}
              </Text>
            </View>

            <View style={styles.sidebarDivider} />

            {/* MENU ITEMS */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => {
                  closeSidebar();
                  // Navigate to home or dashboard
                }}
              >
                <Text style={styles.menuIcon}>🏠</Text>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => {
                  closeSidebar();
                  // Navigate to posts
                }}
              >
                <Text style={styles.menuIcon}>📬</Text>
                <Text style={styles.menuItemText}>Delivered Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => {
                  closeSidebar();
                  // Navigate to profile
                }}
              >
                <Text style={styles.menuIcon}>⚙️</Text>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => {
                  closeSidebar();
                  // Navigate to help
                }}
              >
                <Text style={styles.menuIcon}>❓</Text>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarDivider} />

            {/* LOGOUT BUTTON IN SIDEBAR */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                closeSidebar();
                handleLogout();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* OVERLAY */}
        {sidebarOpen && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeSidebar}
            activeOpacity={0.5}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    position: "relative",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },

  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 14,
  },

  /* HEADER */
  header: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  menuButton: {
    padding: 8,
    marginRight: 12,
  },

  hamburger: {
    width: 24,
    height: 20,
    justifyContent: "space-between",
  },

  line: {
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  /* CONTENT */
  content: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  listContent: {
    padding: 12,
    paddingBottom: 24,
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },

  /* CARD */
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  cardTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 8,
  },

  cardIcon: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 2,
  },

  cardTitleSection: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  cardLocation: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  badgeIcon: {
    fontSize: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  available: {
    backgroundColor: "#10b981",
  },

  accepted: {
    backgroundColor: "#f59e0b",
  },

  picked: {
    backgroundColor: "#3b82f6",
  },

  /* QUANTITY */
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },

  quantityLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },

  quantityValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* TIME SECTION */
  timeSection: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },

  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  timeIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },

  timeContent: {
    flex: 1,
  },

  timeLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "500",
  },

  timeValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },

  timeDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 8,
  },

  /* MESSAGES */
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e40af",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  messageIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  message: {
    color: "#bfdbfe",
    fontWeight: "600",
  },

  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064e3b",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  successIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  success: {
    color: "#86efac",
    fontWeight: "600",
  },

  /* BUTTONS */
  deleteBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  deleteBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  /* SIDEBAR */
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#1e293b",
    zIndex: 999,
    borderRightWidth: 1,
    borderRightColor: "#334155",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  sidebarContent: {
    flex: 1,
    paddingTop: 12,
  },

  closeButton: {
    alignSelf: "flex-end",
    paddingRight: 16,
    paddingVertical: 8,
  },

  closeIcon: {
    fontSize: 24,
    color: "#94a3b8",
    fontWeight: "700",
  },

  /* USER SECTION */
  userSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarIcon: {
    fontSize: 32,
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  userEmail: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "center",
  },

  sidebarDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
    marginHorizontal: 16,
  },

  /* MENU ITEMS */
  menuItems: {
    paddingHorizontal: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
    borderRadius: 8,
  },

  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },

  menuItemText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
  },

  /* LOGOUT BUTTON */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#dc2626",
    borderRadius: 8,
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },

  logoutBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* OVERLAY */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 99,
  },
});
