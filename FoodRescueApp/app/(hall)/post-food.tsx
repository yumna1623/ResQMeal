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

  const [pickupDate, setPickupDate] = useState(""); // ✅ NEW
  const [pickupTime, setPickupTime] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  const [loading, setLoading] = useState(false);

  // 🌍 API
  const getCoordinatesFromLocation = async (locationText: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        locationText
      )}&format=json`;

      const response = await fetch(url, {
        headers: { "User-Agent": "FoodRescueApp/1.0" },
      });

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const handlePost = async () => {
    try {
      if (
        !title ||
        !quantity ||
        !location ||
        !pickupDate ||
        !pickupTime ||
        !expiryTime
      ) {
        Alert.alert("Error", "Fill all fields");
        return;
      }

      setLoading(true);

      const coords = await getCoordinatesFromLocation(location);

      if (!coords) {
        Alert.alert("Invalid location");
        return;
      }

      const { error } = await supabase.from("food_posts").insert([
        {
          user_id: user.id,
          title,
          quantity,
          location,
          pickup_date: pickupDate, // ✅ NEW
          pickup_time: pickupTime,
          expiry_time: expiryTime,
          latitude: coords.latitude,
          longitude: coords.longitude,
          status: "available",
        },
      ]);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Food posted!");

        setTitle("");
        setQuantity("");
        setLocation("");
        setPickupDate("");
        setPickupTime("");
        setExpiryTime("");
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
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Quantity"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Location (Karachi DHA)"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#999"
      />

      {/* ✅ DATE */}
      <TextInput
        placeholder="Pickup Date (YYYY-MM-DD)"
        style={styles.input}
        value={pickupDate}
        onChangeText={setPickupDate}
        placeholderTextColor="#999"
      />

      {/* ⏰ START */}
      <TextInput
        placeholder="Pickup Start Time (e.g. 6 PM)"
        style={styles.input}
        value={pickupTime}
        onChangeText={setPickupTime}
        placeholderTextColor="#999"
      />

      {/* ⏳ END */}
      <TextInput
        placeholder="Collect Before (e.g. 9 PM)"
        style={styles.input}
        value={expiryTime}
        onChangeText={setExpiryTime}
        placeholderTextColor="#999"
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});