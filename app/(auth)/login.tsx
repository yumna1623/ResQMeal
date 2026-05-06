import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.legend}>Email Address</Text>
                <TextInput
                  placeholder="e.g. name@ngo.org"
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

              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() =>
                  Alert.alert("Reset Password", "Link sent to email.")
                }
              >
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Functional Button - No more external component issues */}
              <TouchableOpacity
                style={styles.functionalButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.link}>
                  Don't have an account? Register now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flexContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  mainContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  textContainer: {
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 50,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    color: "#568056",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  forgotPasswordLink: {
    alignItems: "flex-end",
    marginTop: -5,
  },
  link: {
    color: "#568056",
    fontWeight: "600",
  },
  bottomSection: {
    marginTop: "auto",
    marginBottom: 30,
    paddingTop: 20,
    alignItems: "stretch", // Button ko full width karne ke liye
  },
  functionalButton: {
    backgroundColor: "#568056",
    paddingVertical: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Full width stretch
    // Shadow for premium look
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
});