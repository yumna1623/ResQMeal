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

  // ✅ PUBLIC API (Geocoding)
const getCoordinatesFromLocation = async (locationText: string) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      locationText
    )}&format=json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FoodRescueApp/1.0",
      },
    });

    const data = await response.json();

    console.log("API Response:", data); // 🔍 debug

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.log("Geocoding error:", error);
    return null;
  }
};

  const handlePost = async () => {
    try {
      if (!title || !quantity || !location || !pickupTime) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      setLoading(true);

      // 1. Convert location text → coordinates using API
      const coords = await getCoordinatesFromLocation(location);

      if (!coords) {
        Alert.alert("Error", "Invalid or unrecognized location");
        return;
      }

      // 2. Save to Supabase
      const { error } = await supabase.from("food_posts").insert([
        {
          user_id: user.id,
          title,
          quantity,
          location,
          pickup_time: pickupTime,
          latitude: coords.latitude,
          longitude: coords.longitude,
          status: "available",
        },
      ]);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Food posted with location!");
        setTitle("");
        setQuantity("");
        setLocation("");
        setPickupTime("");
      }
    } catch (err) {
      console.log(err);
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
        placeholder="Location (e.g. Karachi DHA Phase 5)"
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