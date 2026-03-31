import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function FoodDetails() {
  const { item } = useLocalSearchParams();
  const { user } = useAuth();

  const food = JSON.parse(item as string);

  const handleAccept = async () => {
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "accepted",
        picked_by: user.id,
      })
      .eq("id", food.id)
      .eq("status", "available");

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Food accepted!");
    }
  };

  const handlePicked = async () => {
    const { error } = await supabase
      .from("food_posts")
      .update({
        status: "picked",
      })
      .eq("id", food.id)
      .eq("picked_by", user.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Marked as picked!");
    }
  };

  const openMap = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${food.latitude},${food.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍱 {food.title}</Text>

      <Text style={styles.text}>📦 {food.quantity}</Text>
      <Text style={styles.text}>📍 {food.location}</Text>

      <Text style={styles.text}>📅 {food.pickup_date}</Text>
      <Text style={styles.text}>⏰ From: {food.pickup_time}</Text>
      <Text style={styles.text}>⏳ Until: {food.expiry_time}</Text>

      {/* MAP */}
      <TouchableOpacity style={styles.button} onPress={openMap}>
        <Text style={styles.buttonText}>View on Map</Text>
      </TouchableOpacity>

      {/* ACCEPT */}
      {food.status === "available" && (
        <TouchableOpacity style={styles.button} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accept Pickup</Text>
        </TouchableOpacity>
      )}

      {/* PICKED */}
      {food.status === "accepted" && food.picked_by === user.id && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3b82f6" }]}
          onPress={handlePicked}
        >
          <Text style={styles.buttonText}>Mark as Picked</Text>
        </TouchableOpacity>
      )}
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
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    marginBottom: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});