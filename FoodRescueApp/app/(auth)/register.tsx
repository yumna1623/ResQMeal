import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hall");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      setLoading(true);
      await register(email, password, role,name);
      router.replace("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
  placeholder="Hall / NGO Name"
  placeholderTextColor="#999"
  style={styles.input}
  value={name}
  onChangeText={setName}
/>

      {/* ✅ ROLE SELECTION */}
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setRole("hall")} style={{ marginRight: 20 }}>
          <Text style={{ color: role === "hall" ? "#22c55e" : "#fff" }}>Hall Owner</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setRole("ngo")}>
          <Text style={{ color: role === "ngo" ? "#22c55e" : "#fff" }}>NGO Owner</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#0f172a" },
  title: { fontSize: 28, color: "#fff", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: "#fff",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#60a5fa", marginTop: 15, textAlign: "center" },
});