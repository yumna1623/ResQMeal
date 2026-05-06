import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function HallProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [contactNumber, setContactNumber] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        if (!user) return;
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("contact_number")
          .eq("id", user.id)
          .maybeSingle();

        if (!error) {
          setContactNumber(data?.contact_number || "");
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    }, [user]),
  );

  if (!user || loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#568056" />
      </View>
    );
  }

  const initial = user.email?.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* --- CLEAN STATIC NAVBAR --- */}
      <View style={styles.greenHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBoxHeader}>
            <Ionicons name="person" size={24} color="#568056" />
          </View>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.titleWhite}>Hall Profile</Text>
            <Text style={styles.subtitleWhite}>Manage your hall details</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={styles.editBtnGreen}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.emailText}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>HALL OWNER</Text>
          </View>
        </View>

        {/* ACCOUNT DETAILS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>

          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>Contact Number</Text>
              <Text style={styles.value}>
                {contactNumber || "Not added yet"}
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={18} color="#568056" />
            </View>
          </View>

          <View style={styles.infoRow}>
            <View>
              <Text style={styles.label}>Account Status</Text>
              <Text style={[styles.value, styles.activeText]}>
                Verified & Active
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#568056" />
            </View>
          </View>

          <View
            style={[
              styles.infoRow,
              { backgroundColor: "#f8f8f8", borderColor: "#eee", elevation: 0 },
            ]}
          >
            <View>
              <Text style={styles.label}>User ID</Text>
              <Text style={[styles.value, { fontSize: 11, color: "#999" }]}>
                {user.id}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#568056",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  /* NAVBAR STYLES (No Buttons Design) */
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 15 : (StatusBar.currentHeight || 0) + 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBoxHeader: {
    width: 45,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  titleWhite: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
  },
  subtitleWhite: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  editBtnGreen: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  /* CONTENT AREA */
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
    backgroundColor: "#fff",
    flexGrow: 1,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#568056",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#F0F7F0",
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: "#fff" },
  emailText: { fontSize: 19, fontWeight: "800", color: "#1A1A1A" },
  roleBadge: {
    backgroundColor: "#F0F7F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#568056",
    letterSpacing: 1.2,
  },

  /* INFO ROWS */
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#568056",
    letterSpacing: 1.5,
    marginBottom: 20,
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 22,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F8F8F8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7F0",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#A0A0A0",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  value: { fontSize: 16, color: "#333", fontWeight: "700" },
  activeText: { color: "#568056" },
});