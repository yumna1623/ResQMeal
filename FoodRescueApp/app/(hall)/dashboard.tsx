import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function HallDashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏢 Hall Owner Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>Manage your halls</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>View bookings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>Update availability</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});