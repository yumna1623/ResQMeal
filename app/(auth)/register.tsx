import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("hall"); // 'hall' or 'ngo'
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  // Real-time validation state
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Real-time check
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(email, password, role, name);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.mainContainer}>
            {/* Top Section */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Create an Account</Text>
              <Text style={styles.subtitle}>
                Sign up for your NGO or Hall account
              </Text>
            </View>

            {/* Role Toggle Switch */}
            <View style={styles.toggleWrapper}>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    role === "hall" && styles.activeToggleButton,
                  ]}
                  onPress={() => setRole("hall")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      role === "hall" && styles.activeToggleText,
                    ]}
                  >
                    Hall Owner
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    role === "ngo" && styles.activeToggleButton,
                  ]}
                  onPress={() => setRole("ngo")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      role === "ngo" && styles.activeToggleText,
                    ]}
                  >
                    NGO Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.legend}>Hall / NGO Name</Text>
                <TextInput
                  placeholder="e.g. Grand Plaza / Edhi Foundation"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.legend}>Email Address</Text>
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#bbb"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.legend}>Password</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.legendRow}>
                  <Text style={styles.legend}>Confirm Password</Text>
                  {!passwordsMatch && (
                    <Text style={styles.errorText}>Mismatch</Text>
                  )}
                </View>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                  secureTextEntry
                  style={[styles.input, !passwordsMatch && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.functionalButton}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.link}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  flexContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, backgroundColor: "#fff" },
  mainContainer: { flex: 1, padding: 24, backgroundColor: "#fff" },
  textContainer: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 5 },

  toggleWrapper: { marginTop: 25, alignItems: "center" },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 4,
    width: "100%",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeToggleButton: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#888" },
  activeToggleText: { color: "#568056" },

  inputContainer: { marginTop: 20 },
  fieldGroup: { marginBottom: 12 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    color: "#568056",
    marginBottom: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#ff4444",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputError: { borderColor: "#ff4444" },

  bottomSection: {
    marginTop: "auto",
    marginBottom: 20,
    paddingTop: 30,
    alignItems: "stretch",
  },
  functionalButton: {
    backgroundColor: "#568056",
    paddingVertical: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  loginLink: { marginTop: 15, paddingVertical: 10, alignItems: "center" },
  link: { color: "#568056", fontWeight: "600" },
});
