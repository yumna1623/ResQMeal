import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/config/supabase";
import { useAuth } from "../../src/context/AuthContext";

export default function PostFood() {
  const { user } = useAuth();

  // Form States
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Picker States
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [activePicker, setActivePicker] = useState<
    "date" | "start" | "expiry" | null
  >(null);

  const [pickupDate, setPickupDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [expiryTime, setExpiryTime] = useState(new Date());

  const [dateText, setDateText] = useState("");
  const [startTimeText, setStartTimeText] = useState("");
  const [expiryTimeText, setExpiryTimeText] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("contact_number")
        .eq("id", user.id)
        .single();
      if (data?.contact_number) setContactNumber(data.contact_number);
    };
    fetchProfile();
  }, [user]);

  const onPickerChange = (event: any, selectedValue?: Date) => {
    if (Platform.OS !== "ios") setActivePicker(null);

    if (selectedValue) {
      if (activePicker === "date") {
        setPickupDate(selectedValue);
        setDateText(selectedValue.toISOString().split("T")[0]);
      } else if (activePicker === "start") {
        setStartTime(selectedValue);
        setStartTimeText(
          selectedValue.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } else if (activePicker === "expiry") {
        setExpiryTime(selectedValue);
        setExpiryTimeText(
          selectedValue.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      }
    }
  };

  const getCoordinatesFromLocation = async (locationText: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationText)}&format=json`;
      const response = await fetch(url, {
        headers: { "User-Agent": "FoodRescueApp/1.0" },
      });
      const data = await response.json();
      return data && data.length > 0
        ? {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          }
        : null;
    } catch (error) {
      return null;
    }
  };

  const handlePost = async () => {
    if (
      !title ||
      !quantity ||
      !location ||
      !contactNumber ||
      !dateText ||
      !startTimeText ||
      !expiryTimeText
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const coords = await getCoordinatesFromLocation(location);
      if (!coords) {
        Alert.alert("Location Error", "Could not find coordinates.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("food_posts").insert([
        {
          user_id: user.id,
          title,
          quantity,
          location,
          contact_number: contactNumber,
          pickup_date: dateText,
          pickup_time: startTimeText,
          expiry_time: expiryTimeText,
          latitude: coords.latitude,
          longitude: coords.longitude,
          status: "available",
        },
      ]);

      if (error) throw error;
      Alert.alert("Success", "Food posted successfully!");
      setTitle("");
      setQuantity("");
      setLocation("");
      setDateText("");
      setStartTimeText("");
      setExpiryTimeText("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#568056"
        translucent
      />

      {/* 🟢 PREMIUM GREEN HEADER */}
      <View style={styles.greenHeader}>
        <View>
          <Text style={styles.headerTitleWhite}>Donate Food</Text>
          <Text style={styles.headerSubtitleWhite}>
            Share your surplus surplus surplus
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons
            name="fast-food-outline"
            size={30}
            color="rgba(255,255,255,0.4)"
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>FOOD ITEM NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#568056"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="e.g. Fresh Biryani"
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>QUANTITY</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="layers-outline"
                  size={20}
                  color="#568056"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="e.g. 10 Plates"
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>DATE OF PICKUP</Text>
              <TouchableOpacity
                style={styles.pickerSelector}
                onPress={() => {
                  setPickerMode("date");
                  setActivePicker("date");
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#568056"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[styles.pickerText, !dateText && { color: "#CCC" }]}
                  >
                    {dateText || "Select Date"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#BBB" />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>START TIME</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => {
                    setPickerMode("time");
                    setActivePicker("start");
                  }}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !startTimeText && { color: "#CCC" },
                    ]}
                  >
                    {startTimeText || "Set Time"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>EXPIRY TIME</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => {
                    setPickerMode("time");
                    setActivePicker("expiry");
                  }}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !expiryTimeText && { color: "#CCC" },
                    ]}
                  >
                    {expiryTimeText || "Set Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>PICKUP ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#568056"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="e.g. DHA Phase 6"
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>CONTACT NUMBER</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#568056"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="03xx-xxxxxxx"
                  style={styles.input}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirm Donation</Text>
            )}
          </TouchableOpacity>

          {activePicker && (
            <DateTimePicker
              value={
                activePicker === "date"
                  ? pickupDate
                  : activePicker === "start"
                    ? startTime
                    : expiryTime
              }
              mode={pickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onPickerChange}
              accentColor="#568056"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#568056" },

  // NAVBAR
  greenHeader: {
    backgroundColor: "#568056",
    paddingTop:
      Platform.OS === "ios" ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 35,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerTitleWhite: { fontSize: 28, fontWeight: "900", color: "#fff" },
  headerSubtitleWhite: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 25,
    backgroundColor: "#fff",
  },
  formCard: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 10 },
  inputGroup: { marginBottom: 22 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#BBB",
    marginBottom: 10,
    letterSpacing: 1,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  pickerSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  pickerText: { fontSize: 15, color: "#333", fontWeight: "600" },
  row: { flexDirection: "row" },

  primaryButton: {
    backgroundColor: "#568056",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    elevation: 6,
    shadowColor: "#568056",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
