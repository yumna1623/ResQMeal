import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function PostFood() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title || !quantity || !location || !pickupTime) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("food_posts").insert({
        user_id: user.id,
        title,
        quantity,
        location,
        pickup_time: pickupTime,
      });

      if (error) {
        console.log("Insert error:", error);
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert("Success", "Food posted successfully!");

      // Reset fields
      setTitle("");
      setQuantity("");
      setLocation("");
      setPickupTime("");

    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Food</Text>

      <TextInput
        placeholder="Food Title"
        placeholderTextColor="#999"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Quantity (e.g. 10 boxes)"
        placeholderTextColor="#999"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        placeholder="Location"
        placeholderTextColor="#999"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        placeholder="Pickup Time"
        placeholderTextColor="#999"
        style={styles.input}
        value={pickupTime}
        onChangeText={setPickupTime}
      />

      <TouchableOpacity style={styles.button} onPress={handlePost}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post Food</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
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
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});